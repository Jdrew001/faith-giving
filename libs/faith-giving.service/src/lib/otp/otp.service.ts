import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { OtpCode } from '@faith-giving/faith-giving.model';
import { TextingService } from '../texting/texting.service';
import * as Sentry from '@sentry/node';

@Injectable()
export class OtpService {

    constructor(
        @InjectRepository(OtpCode) private otpRepo: Repository<OtpCode>,
        private textingService: TextingService
    ) {}

    private generateCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async sendOtp(phone: string): Promise<void> {
        await this.otpRepo.update({ phone, used: false }, { used: true });

        const code = this.generateCode();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        const otpEntry = this.otpRepo.create({ phone, code, expiresAt, used: false });

        try {
            await this.otpRepo.save(otpEntry);
        } catch (error) {
            Logger.error(`OTP save failed: ${error}`);
            Sentry.captureException(`OTP save failed: ${error}`);
            throw new BadRequestException('An error occurred sending the code.');
        }

        await this.textingService.sendText(phone, `Your Faith Giving login code is: ${code}. It expires in 5 minutes.`);
    }

    async verifyOtp(phone: string, code: string): Promise<boolean> {
        const now = new Date();
        let record: OtpCode | null;

        try {
            record = await this.otpRepo.findOne({
                where: {
                    phone,
                    code,
                    used: false,
                    expiresAt: MoreThan(now)
                }
            });
        } catch (error) {
            Logger.error(`OTP lookup failed: ${error}`);
            Sentry.captureException(`OTP lookup failed: ${error}`);
            throw new BadRequestException('An error occurred verifying the code.');
        }

        if (!record) return false;

        record.used = true;
        await this.otpRepo.save(record);
        return true;
    }
}
