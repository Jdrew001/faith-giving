import { Test, TestingModule } from '@nestjs/testing';
import { GroupmeService } from './groupme.service';

describe('GroupmeService', () => {
  let service: GroupmeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupmeService],
    }).compile();

    service = module.get<GroupmeService>(GroupmeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
