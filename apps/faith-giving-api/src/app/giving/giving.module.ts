import { Module } from '@nestjs/common';
import { GivingController } from './giving.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AppService } from '../app.service';
import { FaithGivingServiceModule } from '@faith-giving/faith-giving.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    HttpModule,
    FaithGivingServiceModule
  ],
  controllers: [GivingController],
  providers: [AppService],
})
export class GivingModule {}
