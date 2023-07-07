import { FaithGivingMapperModule } from '@faith-giving/faith-giving.mapper';
import { FaithGivingServiceModule } from '@faith-giving/faith-giving.service';
import { Module } from '@nestjs/common';
import { IndividualController } from './individual.controller';

@Module({
    imports: [
        FaithGivingServiceModule,
        FaithGivingMapperModule
    ],
    controllers: [IndividualController],
    providers: []
})
export class IndividualModule {
    
}
