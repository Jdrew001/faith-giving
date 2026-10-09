import { Response } from 'express';
import { AuthController } from './auth.controller';

type AuthDependencies = ConstructorParameters<typeof AuthController>;

// Keep the response contract tests independent of ORM and provider initialization.
jest.mock('@faith-giving/faith-giving.mapper', () => ({
  ClientSessionMapperService: jest.fn(),
}));
jest.mock(
  'libs/faith-giving.service/src/lib/client-session/client-session.service',
  () => ({ ClientSessionService: jest.fn() })
);
jest.mock('libs/faith-giving.service/src/lib/crypt/crypt.service', () => ({
  CryptService: jest.fn(),
}));
jest.mock(
  'libs/faith-giving.service/src/lib/individual/individual.service',
  () => ({ IndividualService: jest.fn() })
);
jest.mock('libs/faith-giving.service/src/lib/otp/otp.service', () => ({
  OtpService: jest.fn(),
}));

function createAuthFixture() {
  const individual = {
    id: 'donor-123',
    firstname: 'Jane',
    lastname: 'Donor',
    email: 'jane@example.com',
    phone: '8175550100',
    stripeCustomerId: 'customer-private',
  };
  const session = { id: 'session-123', individual };
  const sessionData = { sessionId: session.id, individualId: individual.id };
  const individualService = {
    findIndividualByPhone: jest.fn().mockResolvedValue(individual),
  };
  const otpService = { verifyOtp: jest.fn().mockResolvedValue(true) };
  const sessionService = {
    saveNewClientSession: jest.fn().mockResolvedValue(session),
  };
  const sessionMapper = {
    mapEntityToDTO: jest.fn().mockReturnValue(sessionData),
  };
  const cryptService = {
    encrypt: jest.fn().mockReturnValue('encrypted-session'),
  };
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  };
  const controller = new AuthController(
    individualService as unknown as AuthDependencies[0],
    otpService as unknown as AuthDependencies[1],
    sessionService as unknown as AuthDependencies[2],
    sessionMapper as unknown as AuthDependencies[3],
    cryptService as unknown as AuthDependencies[4]
  );

  return {
    controller,
    individual,
    session,
    sessionData,
    individualService,
    otpService,
    sessionService,
    sessionMapper,
    cryptService,
    response,
    expressResponse: response as unknown as Response,
  };
}

describe('AuthController donor identity', () => {
  const otpRequest = { phone: '8175550100', code: '123456' };

  afterEach(() => jest.restoreAllMocks());

  it.each([true, false])(
    'includes donor id and preserves session cookies (development: %s)',
    async (development) => {
      const fixture = createAuthFixture();
      const now = Date.UTC(2026, 9, 8);
      jest.spyOn(Date, 'now').mockReturnValue(now);
      jest
        .spyOn(fixture.controller, 'isDevelopment', 'get')
        .mockReturnValue(development);

      await fixture.controller.verifyOtp(otpRequest, fixture.expressResponse);

      expect(fixture.otpService.verifyOtp).toHaveBeenCalledWith(
        otpRequest.phone,
        otpRequest.code
      );
      expect(
        fixture.individualService.findIndividualByPhone
      ).toHaveBeenCalledWith(otpRequest.phone);
      expect(fixture.sessionService.saveNewClientSession).toHaveBeenCalledWith(
        fixture.individual
      );
      expect(fixture.sessionMapper.mapEntityToDTO).toHaveBeenCalledWith(
        fixture.session
      );
      expect(fixture.cryptService.encrypt).toHaveBeenCalledWith(
        fixture.sessionData
      );
      expect(fixture.response.cookie).toHaveBeenCalledWith(
        'client_data',
        'encrypted-session',
        {
          httpOnly: true,
          secure: !development,
          expires: new Date(now + 60 * 60 * 24 * 60 * 1000),
        }
      );
      expect(fixture.response.status).toHaveBeenCalledWith(200);
      expect(fixture.response.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: fixture.individual.id,
          firstname: fixture.individual.firstname,
          lastname: fixture.individual.lastname,
          email: fixture.individual.email,
          phone: fixture.individual.phone,
        },
      });
    }
  );

  it('rejects an invalid OTP before donor lookup or session creation', async () => {
    const fixture = createAuthFixture();
    fixture.otpService.verifyOtp.mockResolvedValue(false);

    await fixture.controller.verifyOtp(otpRequest, fixture.expressResponse);

    expect(fixture.response.status).toHaveBeenCalledWith(400);
    expect(fixture.response.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid or expired code.',
    });
    expect(
      fixture.individualService.findIndividualByPhone
    ).not.toHaveBeenCalled();
    expect(fixture.sessionService.saveNewClientSession).not.toHaveBeenCalled();
    expect(fixture.cryptService.encrypt).not.toHaveBeenCalled();
    expect(fixture.response.cookie).not.toHaveBeenCalled();
  });

  it('preserves the missing donor response without creating a session', async () => {
    const fixture = createAuthFixture();
    fixture.individualService.findIndividualByPhone.mockResolvedValue(null);

    await fixture.controller.verifyOtp(otpRequest, fixture.expressResponse);

    expect(fixture.response.status).toHaveBeenCalledWith(404);
    expect(fixture.response.json).toHaveBeenCalledWith({
      success: false,
      message: 'Individual not found.',
    });
    expect(fixture.sessionService.saveNewClientSession).not.toHaveBeenCalled();
    expect(fixture.cryptService.encrypt).not.toHaveBeenCalled();
    expect(fixture.response.cookie).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    'preserves cookie clearing on signout (development: %s)',
    (development) => {
      const fixture = createAuthFixture();
      jest
        .spyOn(fixture.controller, 'isDevelopment', 'get')
        .mockReturnValue(development);

      fixture.controller.signOut(fixture.expressResponse);

      expect(fixture.response.clearCookie).toHaveBeenCalledWith('client_data', {
        httpOnly: true,
        secure: !development,
      });
      expect(fixture.response.status).toHaveBeenCalledWith(200);
      expect(fixture.response.json).toHaveBeenCalledWith({ success: true });
    }
  );
});
