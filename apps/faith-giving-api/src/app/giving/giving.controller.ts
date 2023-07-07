import { Body, Controller, Post, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { GivingService } from '@faith-giving/faith-giving.service';
import { CalulateTotalDto, PaymentDTO } from '@faith-giving/faith-giving.model';
import { ClientSessionService } from 'libs/faith-giving.service/src/lib/client-session/client-session.service';
import { ClientSessionMapperService } from '@faith-giving/faith-giving.mapper';
import { CryptService } from 'libs/faith-giving.service/src/lib/crypt/crypt.service';

@Controller('giving')
export class GivingController {

    get isDevelopment() { return process.env['NODE_ENV'] == 'development' }
    get secretKey() { return process.env['SESSION_KEY'] }

    constructor(
        private givingService: GivingService,
        private clientSessionService: ClientSessionService,
        private clientSessionMapper: ClientSessionMapperService,
        private cryptService: CryptService
    ) {}

    @Post("submitPayment")
    async submitPayment(@Body() body: PaymentDTO, @Res() res: Response) {
        let givingResult = await this.givingService.submitPayment(body);
        let individual = givingResult.individual;
        const twoMonths = 60 * 60 * 24 * 60 * 1000; // 2 months in milliseconds
        const expirationDate = new Date(Date.now() + twoMonths);

        let session = await this.clientSessionService.saveNewClientSession(individual);
        let mapped = this.clientSessionMapper.mapEntityToDTO(session);
        let encryptedData = this.cryptService.encrypt(mapped);
        res.cookie('client_data', encryptedData.toString() ,{
            httpOnly: true,
            secure: !this.isDevelopment,
            expires: expirationDate
        });
        return res.status(200).json({ success: true, message: 'Giving submitted successfully' });
    }

    @Post("calculateTotal")
    calculateTotal(@Body() body: CalulateTotalDto) {
        return { success: true, data: this.givingService.calculateTotal(body) }
    }
}
