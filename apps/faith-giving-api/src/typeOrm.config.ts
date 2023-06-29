import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
// import { Giving, Individual, Offering, OfferingType, PaymentMethod, Role, User } from '@faith-giving/faith-giving.model';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.getOrThrow('DB_HOST'),
  port: configService.getOrThrow('DB_PORT'),
  database: 'faith-giving',
  username: configService.getOrThrow('DB_USER'),
  password: configService.getOrThrow('DB_PASSWORD'),
  migrations: ['migrations/**'],
  entities: ["../../libs/faith-giving.model/src/lib/entities/*.{.ts,.js}"]
});