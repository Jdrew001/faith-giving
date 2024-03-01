import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

// Import firebase-admin
import { initializeApp } from "firebase/app";
import * as Sentry from '@sentry/node';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);
  const firebaseConfig = {
    apiKey: configService.get<string>('FIREBASE_API_KEY'),
    authDomain: configService.get<string>('FIREBASE_AUTH_DOMAIN'),
    databaseURL: configService.get<string>('FIREBASE_DATABASE_URL'),
    projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
    storageBucket: configService.get<string>('FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: configService.get<string>('FIREBASE_MESSAGING_SENDER_ID'),
    appId: configService.get<string>('FIREBASE_APP_ID'),
    measurementId: configService.get<string>('FIREBASE_MEASUREMENT_ID')
  }
  initializeApp(firebaseConfig);//

  Sentry.init({
    dsn: process.env.SENTRY_URL,
    environment: process.env.NODE_ENV
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const port = process.env.PORT || 3000;
  app.enableCors({
    origin: ["http://localhost:4200", "https://discoverfaitharlington.org"],
    credentials: true
  });
  app.use(cookieParser());
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
