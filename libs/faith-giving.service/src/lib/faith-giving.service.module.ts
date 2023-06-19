import { Module } from '@nestjs/common';
import { UserService } from './user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Giving, Individual, Offering, OfferingType, PaymentMethod, User } from '@faith-giving/faith-giving.model';

@Module({
  providers: [
    UserService
  ],
  imports: [
    TypeOrmModule.forFeature([
      Giving,
      Individual,
      Offering,
      OfferingType,
      User,
      PaymentMethod
    ])
  ],
  exports: [UserService]
})
export class FaithGivingServiceModule {}
