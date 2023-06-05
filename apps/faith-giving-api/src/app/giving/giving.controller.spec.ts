import { Test, TestingModule } from '@nestjs/testing';
import { GivingController } from './giving.controller';
import { GivingService } from './giving.service';
import { PaymentDTO } from '../dto/giving/payment.dto';

describe('GivingController', () => {
  let controller: GivingController;
  let givingService: GivingService;
  let givingResult = {
    data: [
      {
        email: 'dtatkison@gmail.com',
        firstName: 'Drew',
        lastName: 'Atkison',
        phone: '9876543',
        tithe: 1,
        offerings: [],
        feeCovered: true
      }
    ],
    length: 1
  };
  let payment: PaymentDTO = {
    paymentMethodId: '1234',
    giveDetails: {
      email: 'dtatkison@gmail.com',
      firstName: 'Drew',
      lastName: 'Atkison',
      phone: '9876543',
      tithe: 1,
      offerings: [],
      feeCovered: true
    }
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GivingController],
      providers: [
        {
          provide: GivingService,
          useValue: {
            getGivingInformationForUser: jest.fn().mockResolvedValue(givingResult),
            submitPayment: jest.fn().mockResolvedValue({success: true, message: 'Payment submitted successfully'}),
            calculateTotal: jest.fn().mockResolvedValue({success: true, data: '100'})
          },
        },
      ]
    }).compile();

    controller = module.get<GivingController>(GivingController);
    givingService = module.get<GivingService>(GivingService);

    jest.spyOn(givingService, 'getGivingInformationForUser').mockImplementation(async (email: string) => {
      return givingResult;
    });

    jest.spyOn(givingService, 'submitPayment').mockImplementation(async (body: PaymentDTO) => {
      return;
    })
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call get giving information for user', async () => {
    const email = 'dtatkison@gmail.com';
    const result = await controller.getGivingInformationForUser(email);

    expect(givingService.getGivingInformationForUser).toHaveBeenCalledWith(email);
    expect(result.data.length).toBe(1);
    expect(result.length).toBe(1);
  });

  it('should call submit payment', async () => {
    const result = await controller.submitPayment(payment);

    expect(givingService.submitPayment).toHaveBeenCalledWith(payment);
    expect(result.message).toBe('Payment submitted successfully');
    expect(result.success).toBe(true);
  });

  it('should call calculate total', async () => {
    const mock = {
      tithe: 10,
      offerings: [],
      feeCovered: true
    }
    const result = await controller.calculateTotal(mock);
    
    expect(givingService.calculateTotal).toHaveBeenCalledWith(mock);
    expect(result.success).toBe(true);
  });
});