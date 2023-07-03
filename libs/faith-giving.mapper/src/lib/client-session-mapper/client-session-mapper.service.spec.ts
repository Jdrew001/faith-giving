import { Test, TestingModule } from '@nestjs/testing';
import { ClientSessionMapperService } from './client-session-mapper.service';

describe('ClientSessionMapperService', () => {
  let service: ClientSessionMapperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientSessionMapperService],
    }).compile();

    service = module.get<ClientSessionMapperService>(
      ClientSessionMapperService
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
