import { Module } from '@nestjs/common';
import { GivingMapperService } from './giving-mapper/giving-mapper.service';
import { IndividualMapperService } from './individual-mapper/individual-mapper.service';

@Module({
  controllers: [],
  providers: [GivingMapperService, IndividualMapperService],
  exports: [GivingMapperService, IndividualMapperService],
})
export class FaithGivingMapperModule {}
