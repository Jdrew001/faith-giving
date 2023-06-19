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

@Module({
  providers: [
    UserService,
    ReferenceService
  ],
  imports: [
    TypeOrmModule.forFeature([
      Giving,
      Individual,
      Offering,
      OfferingType,
      User,
      PaymentMethod,
    ]),
  ],
  exports: [
    UserService,
    ReferenceService
  ],
})
export class FaithGivingServiceModule {}
