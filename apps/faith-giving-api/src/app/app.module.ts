import { MiddlewareConsumer, Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DataService } from './services/data/data.service';
import { GivingModule } from './giving/giving.module';
import { EmailService } from './services/email/email.service';
import { HttpModule } from '@nestjs/axios';
import { TextingService } from './services/texting/texting.service';
import { CorsMiddleware } from './middleware/cors.middleware';

@Module({
  imports: [
    GivingModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    HttpModule,
  ],
  controllers: [AppController],
  providers: [AppService, DataService, EmailService, TextingService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes('*');
  }
}
