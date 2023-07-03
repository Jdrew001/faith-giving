import { Giving, Individual, Offering, OfferingType, PaymentMethod, User } from '@faith-giving/faith-giving.model';
import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'libs/faith-giving.model/src/lib/entities/role';
import { ClientSession } from 'typeorm';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env['DB_HOST'],
      port: Number(process.env['DB_PORT']),
      username: process.env['DB_USER'],
      password: process.env['DB_PASSWORD'],
      database: process.env['DB_NAME'],
      entities: [
        Giving,
        Individual,
        Offering,
        OfferingType,
        User,
        PaymentMethod,
        Role,
        ClientSession
      ],
      synchronize: false
    }), 
  ]
})
export class FaithGivingDataModule {
  constructor() {
    Logger.log(process.env['DB_HOST'])
  }
}
