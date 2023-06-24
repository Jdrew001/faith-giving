import { MiddlewareConsumer, Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GivingModule } from './giving/giving.module';
import { HttpModule } from '@nestjs/axios';
import { CorsMiddleware } from './middleware/cors.middleware';
import { FaithGivingDataModule } from '@faith-giving/faith-giving.data';
import { FaithGivingServiceModule } from '@faith-giving/faith-giving.service';

@Module({
  imports: [
    GivingModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    HttpModule,
    FaithGivingDataModule,
    FaithGivingServiceModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes('*');
  }
}
