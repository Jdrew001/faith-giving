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
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { IndividualService } from './individual/individual.service';

@Module({
  providers: [
    UserService,
    ReferenceService,
    GivingService,
    StripeService,
    TextingService,
    EmailService,
    IndividualService,
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
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    HttpModule,
    FaithGivingMapperModule,
  ],
  exports: [UserService, ReferenceService, GivingService],
})
export class FaithGivingServiceModule {}
