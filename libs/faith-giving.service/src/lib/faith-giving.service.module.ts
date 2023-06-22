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
import { StripeService } from './stripe/stripe.service';
import { TextingService } from './texting/texting.service';
import { EmailService } from './email/email.service';

@Module({
  providers: [
    UserService,
    ReferenceService,
    GivingService,
    StripeService,
    TextingService,
    EmailService,
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
    FaithGivingMapperModule,
  ],
  exports: [UserService, ReferenceService, GivingService],
})
export class FaithGivingServiceModule {}
