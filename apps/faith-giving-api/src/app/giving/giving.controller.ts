import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreatePaymentIntentDto } from '../dto/giving/create-payment-intent.dto';
import { GivingService } from './giving.service';
import { PaymentDTO } from '../dto/giving/payment.dto';

@Controller('giving')
export class GivingController {

    constructor(
        private givingService: GivingService
    ) {}

    @Get("getGivingInformationForUser/:email")
    async getGivingInformationForUser(@Param('email') email: string) {
        if (!email) throw new BadRequestException('An error occurred', { cause: new Error(), description: 'email required' });
        return this.givingService.getGivingInformationForUser(email);
    }

    @Post("createPaymentIntent")
    createPaymentIntent(@Body() body: CreatePaymentIntentDto) {
        return this.givingService.createPaymentIntent(body);
    }

    @Post("submitPayment")
    async submitPayment(@Body() body: PaymentDTO) {
        await this.givingService.submitPayment(body);
        return {success: true, message: "Payment submitted successfully"}
    }
}
