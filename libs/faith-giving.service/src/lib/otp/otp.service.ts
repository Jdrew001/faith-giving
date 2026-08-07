import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { OtpCode } from '../../../../faith-giving.model/src/lib/entities/otp-code';
import * as Sentry from '@sentry/node';
import twilio = require('twilio');

@Injectable()
export class OtpService {

    constructor(
        @InjectRepository(OtpCode) private otpRepo: Repository<OtpCode>,
        private readonly configService: ConfigService
    ) {}

    get accountSid() {
        return this.configService.get<string>('TWILIO_ACCOUNT_SID')
            ?? this.configService.get<string>('TWILIO_ACCOUNTSID');
    }

    get authToken() {
        return this.configService.get<string>('TWILIO_AUTH_TOKEN')
            ?? this.configService.get<string>('TWILIO_AUTH');
    }

    get verifyServiceSid() {
        return this.configService.get<string>('TWILIO_VERIFY_SERVICE_SID')
            ?? this.configService.get<string>('VERIFY_SERVICE_SID');
    }

    get useLocalOtp() {
        return process.env['NODE_ENV'] === 'development'
            || this.configService.get<string>('OTP_LOCAL_MODE') === 'true'
            || this.configService.get<string>('DISABLE_TEXTING') === 'true';
    }

    private generateCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async sendOtp(phone: string): Promise<void> {
        if (!this.useLocalOtp) {
            await this.sendVerifyOtp(phone);
            return;
        }

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

        if (process.env['NODE_ENV'] === 'development') {
            Logger.log(`[LOCAL OTP] Faith Giving login code for ${phone}: ${code}`);
        }
    }

    async verifyOtp(phone: string, code: string): Promise<boolean> {
        if (!this.useLocalOtp) {
            return this.verifyWithTwilio(phone, code);
        }

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

    private async sendVerifyOtp(phone: string): Promise<void> {
        const { client, serviceSid } = this.getVerifyContext();

        try {
            await client.verify.v2
                .services(serviceSid)
                .verifications
                .create({ to: phone, channel: 'sms' });
        } catch (error) {
            Logger.error(`Twilio Verify send failed: ${error}`);
            Sentry.captureException(error);
            throw new BadRequestException('An error occurred sending the code.');
        }
    }

    private async verifyWithTwilio(phone: string, code: string): Promise<boolean> {
        const { client, serviceSid } = this.getVerifyContext();

        try {
            const check = await client.verify.v2
                .services(serviceSid)
                .verificationChecks
                .create({ to: phone, code });

            return check.status === 'approved';
        } catch (error) {
            Logger.error(`Twilio Verify check failed: ${error}`);
            Sentry.captureException(error);
            throw new BadRequestException('An error occurred verifying the code.');
        }
    }

    private getVerifyContext() {
        const accountSid = this.accountSid;
        const authToken = this.authToken;
        const serviceSid = this.verifyServiceSid;

        if (!accountSid || !authToken || !serviceSid) {
            throw new BadRequestException('Login verification is not configured.');
        }

        return {
            client: twilio(accountSid, authToken),
            serviceSid
        };
    }
}
