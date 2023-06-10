import { Module } from '@nestjs/common';
import { GivingService } from './giving.service';
import { GivingController } from './giving.controller';
import { ConfigModule } from '@nestjs/config';
import { DataService } from '../services/data/data.service';
import { StripeService } from '../services/stripe.service';
import { EmailService } from '../services/email/email.service';
import { HttpModule } from '@nestjs/axios';
import { AppService } from '../app.service';
import { TextingService } from '../services/texting/texting.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    HttpModule
  ],
  controllers: [GivingController],
  providers: [
    GivingService,
    DataService,
    StripeService,
    EmailService,
    AppService,
    TextingService],
})
export class GivingModule {}
