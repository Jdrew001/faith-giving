import { OtpService } from './otp.service';
import twilio = require('twilio');

jest.mock('twilio', () => jest.fn());

describe('OtpService', () => {
    const originalNodeEnv = process.env['NODE_ENV'];
    let repository: {
        update: jest.Mock;
        create: jest.Mock;
        save: jest.Mock;
        findOne: jest.Mock;
    };
    let configService: { get: jest.Mock };
    let services: jest.Mock;
    let verificationCreate: jest.Mock;
    let verificationCheckCreate: jest.Mock;

    beforeEach(() => {
        process.env['NODE_ENV'] = 'production';
        repository = {
            update: jest.fn().mockResolvedValue(undefined),
            create: jest.fn((value) => value),
            save: jest.fn().mockResolvedValue(undefined),
            findOne: jest.fn()
        };
        configService = {
            get: jest.fn((key: string) => ({
                TWILIO_ACCOUNT_SID: 'AC123',
                TWILIO_AUTH_TOKEN: 'auth-token',
                TWILIO_VERIFY_SERVICE_SID: 'VA123'
            }[key]))
        };
        verificationCreate = jest.fn().mockResolvedValue({ status: 'pending' });
        verificationCheckCreate = jest.fn().mockResolvedValue({ status: 'approved' });
        services = jest.fn().mockReturnValue({
            verifications: { create: verificationCreate },
            verificationChecks: { create: verificationCheckCreate }
        });
        (twilio as unknown as jest.Mock).mockReturnValue({
            verify: { v2: { services } }
        });
    });

    afterEach(() => {
        process.env['NODE_ENV'] = originalNodeEnv;
        jest.clearAllMocks();
    });

    function createService() {
        return new OtpService(repository as any, configService as any);
    }

    it('starts an sms verification through Twilio Verify in production', async () => {
        await createService().sendOtp('+15551234567');

        expect(twilio).toHaveBeenCalledWith('AC123', 'auth-token');
        expect(services).toHaveBeenCalledWith('VA123');
        expect(verificationCreate).toHaveBeenCalledWith({
            to: '+15551234567',
            channel: 'sms'
        });
        expect(repository.save).not.toHaveBeenCalled();
    });

    it('approves valid verification checks from Twilio Verify', async () => {
        await expect(createService().verifyOtp('+15551234567', '123456')).resolves.toBe(true);

        expect(verificationCheckCreate).toHaveBeenCalledWith({
            to: '+15551234567',
            code: '123456'
        });
    });

    it('rejects pending verification checks from Twilio Verify', async () => {
        verificationCheckCreate.mockResolvedValue({ status: 'pending' });

        await expect(createService().verifyOtp('+15551234567', '123456')).resolves.toBe(false);
    });

    it('keeps the local otp table fallback for development', async () => {
        process.env['NODE_ENV'] = 'development';

        await createService().sendOtp('+15551234567');

        expect(repository.update).toHaveBeenCalledWith(
            { phone: '+15551234567', used: false },
            { used: true }
        );
        expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
            phone: '+15551234567',
            used: false
        }));
        expect(verificationCreate).not.toHaveBeenCalled();
    });

    it('checks the local otp table fallback in development', async () => {
        process.env['NODE_ENV'] = 'development';
        const record = { used: false };
        repository.findOne.mockResolvedValue(record);

        await expect(createService().verifyOtp('+15551234567', '123456')).resolves.toBe(true);

        expect(repository.findOne).toHaveBeenCalledWith({
            where: expect.objectContaining({
                phone: '+15551234567',
                code: '123456',
                used: false
            })
        });
        expect(record.used).toBe(true);
        expect(repository.save).toHaveBeenCalledWith(record);
    });
});
