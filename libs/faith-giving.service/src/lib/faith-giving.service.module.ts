import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { UserService } from './user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import {
  ClientSession,
  Giving,
  Individual,
  Offering,
  OfferingType,
  OtpCode,
  PaymentMethod,
  User,
} from '@faith-giving/faith-giving.model';
import { ReferenceService } from './reference/reference.service';
import { GivingService } from './giving/giving.service';
import { FaithGivingMapperModule } from '@faith-giving/faith-giving.mapper';
import { StripeService } from './stripe/stripe.service';
import { EmailService } from './email/email.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { IndividualService } from './individual/individual.service';
import { ClientSessionService } from './client-session/client-session.service';
import { CryptService } from './crypt/crypt.service';
import { GroupmeService } from './groupme/groupme.service';
import { OtpService } from './otp/otp.service';
import { PaymentMethodService } from './payment-method/payment-method.service';

@Module({
  providers: [
    UserService,
    ReferenceService,
    GivingService,
    StripeService,
    EmailService,
    IndividualService,
    ClientSessionService,
    CryptService,
    GroupmeService,
    OtpService,
    PaymentMethodService
  ],
  imports: [
    TypeOrmModule.forFeature([
      Giving,
      Individual,
      Offering,
      OfferingType,
      User,
      PaymentMethod,
      ClientSession,
      OtpCode,
    ]),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    HttpModule,
    CacheModule.register({
      ttl: 3600,
    }),
    FaithGivingMapperModule,
  ],
  exports: [
    UserService,
    ReferenceService,
    GivingService,
    ClientSessionService,
    IndividualService,
    CryptService,
    GroupmeService,
    OtpService,
    PaymentMethodService,
    StripeService
  ],
})
export class FaithGivingServiceModule {}
