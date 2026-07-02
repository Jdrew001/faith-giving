import { Body, Controller, Logger, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { IndividualService } from 'libs/faith-giving.service/src/lib/individual/individual.service';
import { OtpService } from 'libs/faith-giving.service/src/lib/otp/otp.service';
import { ClientSessionService } from 'libs/faith-giving.service/src/lib/client-session/client-session.service';
import { ClientSessionMapperService } from '@faith-giving/faith-giving.mapper';
import { CryptService } from 'libs/faith-giving.service/src/lib/crypt/crypt.service';

@Controller('auth')
export class AuthController {

    get isDevelopment() { return process.env['NODE_ENV'] === 'development'; }

    constructor(
        private individualService: IndividualService,
        private otpService: OtpService,
        private clientSessionService: ClientSessionService,
        private clientSessionMapper: ClientSessionMapperService,
        private cryptService: CryptService
    ) {}

    @Post('requestOtp')
    async requestOtp(@Body() body: { phone: string }) {
        const { phone } = body;
        if (!phone) return { success: false, message: 'Phone number is required.' };

        const individual = await this.individualService.findIndividualByPhone(phone);

        if (!individual) {
            return { success: true, found: false };
        }

        await this.otpService.sendOtp(phone);
        return { success: true, found: true };
    }

    @Post('verifyOtp')
    async verifyOtp(@Body() body: { phone: string; code: string }, @Res() res: Response) {
        const { phone, code } = body;

        const valid = await this.otpService.verifyOtp(phone, code);
        if (!valid) {
            return res.status(400).json({ success: false, message: 'Invalid or expired code.' });
        }

        const individual = await this.individualService.findIndividualByPhone(phone);
        if (!individual) {
            return res.status(404).json({ success: false, message: 'Individual not found.' });
        }

        const session = await this.clientSessionService.saveNewClientSession(individual);
        const mapped = this.clientSessionMapper.mapEntityToDTO(session);
        const encryptedData = this.cryptService.encrypt(mapped);

        const twoMonths = 60 * 60 * 24 * 60 * 1000;
        const expirationDate = new Date(Date.now() + twoMonths);

        res.cookie('client_data', encryptedData.toString(), {
            httpOnly: true,
            secure: !this.isDevelopment,
            expires: expirationDate
        });

        return res.status(200).json({
            success: true,
            data: {
                firstname: individual.firstname,
                lastname: individual.lastname,
                email: individual.email,
                phone: individual.phone
            }
        });
    }

    @Post('signOut')
    signOut(@Res() res: Response) {
        res.clearCookie('client_data', {
            httpOnly: true,
            secure: !this.isDevelopment
        });
        return res.status(200).json({ success: true });
    }
}
