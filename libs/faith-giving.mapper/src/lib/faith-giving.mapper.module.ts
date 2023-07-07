import { Module } from '@nestjs/common';
import { GivingMapperService } from './giving-mapper/giving-mapper.service';
import { IndividualMapperService } from './individual-mapper/individual-mapper.service';
import { ClientSessionMapperService } from './client-session-mapper/client-session-mapper.service';

@Module({
  controllers: [],
  providers: [
    GivingMapperService,
    IndividualMapperService,
    ClientSessionMapperService,
  ],
  exports: [GivingMapperService, IndividualMapperService, ClientSessionMapperService],
})
export class FaithGivingMapperModule {}
