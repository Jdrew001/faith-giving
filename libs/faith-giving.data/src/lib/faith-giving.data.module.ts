import { Giving, Individual, Offering, OfferingType, PaymentMethod, User } from '@faith-giving/faith-giving.model';
import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'libs/faith-giving.model/src/lib/entities/role';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env['DB_HOST'],
      port: Number(process.env['DB_PORT']),
      username: process.env['DB_USER'],
      password: process.env['DB_PASSWORD'],
      database: 'faith-giving',
      entities: [
        Giving,
        Individual,
        Offering,
        OfferingType,
        User,
        PaymentMethod,
        Role
      ],
      synchronize: true, // Don't use this in the production
    }), 
  ]
})
export class FaithGivingDataModule {
  constructor() {
    Logger.log(process.env['DB_HOST'])
  }
}
