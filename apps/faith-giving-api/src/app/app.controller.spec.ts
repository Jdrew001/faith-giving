import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService, AppVersionInfo } from './app.service';
import { ReferenceService, UserService } from '@faith-giving/faith-giving.service';

describe('AppController', () => {
  let app: TestingModule;
  let appController: AppController;
  const admins = [{ id: 'admin-1' }];
  const references = [{ id: 'reference-1' }];
  const version: AppVersionInfo = {
    service: 'faith-giving-api',
    version: '1.0.4',
    buildVersion: '1.0.4-build.1234567890',
    buildNumber: '1234567890',
    buildDate: '2026-08-07T00:00:00Z',
    environment: 'production',
  };

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getVersion: jest.fn().mockReturnValue(version),
          },
        },
        {
          provide: UserService,
          useValue: {
            findAdmins: jest.fn().mockResolvedValue(admins),
          },
        },
        {
          provide: ReferenceService,
          useValue: {
            findAll: jest.fn().mockResolvedValue(references),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('returns admin data from the user service', async () => {
    await expect(appController.getData()).resolves.toEqual(admins);
  });

  it('returns reference data from the reference service', async () => {
    await expect(appController.getReferenceData()).resolves.toEqual(references);
  });

  it('returns deployed API version metadata', () => {
    expect(appController.getVersion()).toEqual(version);
  });
});
