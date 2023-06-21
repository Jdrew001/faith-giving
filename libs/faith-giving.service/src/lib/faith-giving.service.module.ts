import { Module } from '@nestjs/common';
import { UserService } from './user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Giving,
  Individual,
  Offering,
  OfferingType,
  PaymentMethod,
  User,
} from '@faith-giving/faith-giving.model';
import { ReferenceService } from './reference/reference.service';
import { GivingService } from './giving/giving.service';
import { FaithGivingMapperModule } from '@faith-giving/faith-giving.mapper';

@Module({
  providers: [UserService, ReferenceService, GivingService],
  imports: [
    TypeOrmModule.forFeature([
      Giving,
      Individual,
      Offering,
      OfferingType,
      User,
      PaymentMethod,
    ]),
    FaithGivingMapperModule
  ],
  exports: [
    UserService, 
    ReferenceService,
    GivingService
  ],
})
export class FaithGivingServiceModule {}
