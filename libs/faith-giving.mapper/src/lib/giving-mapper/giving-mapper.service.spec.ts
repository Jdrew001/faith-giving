import { Test, TestingModule } from '@nestjs/testing';
import { GivingMapperService } from './giving-mapper.service';

describe('GivingMapperService', () => {
  let service: GivingMapperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GivingMapperService],
    }).compile();

    service = module.get<GivingMapperService>(GivingMapperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
