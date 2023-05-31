import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DataService } from './services/data/data.service';
import { GivingModule } from './giving/giving.module';
import { EmailService } from './services/email/email.service';
import { HttpModule } from '@nestjs/axios';
import { ExportModule } from './export/export.module';

@Module({
  imports: [
    GivingModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    HttpModule,
    ExportModule,
  ],
  controllers: [AppController],
  providers: [AppService, DataService, EmailService],
})
export class AppModule {}
