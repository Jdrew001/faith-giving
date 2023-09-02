import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { UserService } from './user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ClientSession,
  Giving,
  Individual,
  Offering,
  OfferingType,
  PaymentMethod,
  Token,
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
import { ClientSessionService } from './client-session/client-session.service';
import { CryptService } from './crypt/crypt.service';
import { ChmeetingService } from './chmeeting/chmeeting.service';

@Module({
  providers: [
    UserService,
    ReferenceService,
    GivingService,
    StripeService,
    TextingService,
    EmailService,
    IndividualService,
    ClientSessionService,
    CryptService,
    ChmeetingService,
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
      Token
    ]),
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    HttpModule,
    CacheModule.register({
      ttl: 3600
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
    ChmeetingService
  ],
})
export class FaithGivingServiceModule {}
