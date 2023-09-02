import { Test, TestingModule } from '@nestjs/testing';
import { ChmeetingService } from './chmeeting.service';

describe('ChmeetingService', () => {
  let service: ChmeetingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChmeetingService],
    }).compile();

    service = module.get<ChmeetingService>(ChmeetingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
