import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { FaithGivingServiceModule } from '@faith-giving/faith-giving.service';
import { FaithGivingMapperModule } from '@faith-giving/faith-giving.mapper';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({ envFilePath: '.env' }),
        FaithGivingServiceModule,
        FaithGivingMapperModule
    ],
    controllers: [AuthController]
})
export class AuthModule {}
