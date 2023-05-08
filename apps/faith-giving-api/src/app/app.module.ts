import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DataService } from './services/data/data.service';
import { GivingModule } from './giving/giving.module';

@Module({
  imports: [
    GivingModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    })
  ],
  controllers: [AppController],
  providers: [AppService, DataService],
})
export class AppModule {}
