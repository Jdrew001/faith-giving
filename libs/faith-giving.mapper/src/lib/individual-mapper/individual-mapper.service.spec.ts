import { Test, TestingModule } from '@nestjs/testing';
import { IndividualMapperService } from './individual-mapper.service';

describe('IndividualMapperService', () => {
  let service: IndividualMapperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IndividualMapperService],
    }).compile();

    service = module.get<IndividualMapperService>(IndividualMapperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
