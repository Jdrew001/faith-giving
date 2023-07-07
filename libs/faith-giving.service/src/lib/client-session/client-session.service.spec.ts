import { Test, TestingModule } from '@nestjs/testing';
import { ClientSessionService } from './client-session.service';

describe('ClientSessionService', () => {
  let service: ClientSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientSessionService],
    }).compile();

    service = module.get<ClientSessionService>(ClientSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
