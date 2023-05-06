import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreatePaymentIntentDto } from '../dto/giving/create-payment-intent.dto';
import { GivingService } from './giving.service';
import { PaymentDTO } from '../dto/giving/payment.dto';

@Controller('giving')
export class GivingController {

    constructor(
        private givingService: GivingService
    ) {}

    @Post("createPaymentIntent")
    createPaymentIntent(@Body() body: CreatePaymentIntentDto) {
        return this.givingService.createPaymentIntent(body);
    }

    @Post("submitPayment")
    async submitPayment(@Body() body: PaymentDTO) {
        await this.givingService.submitPayment(body);
        return {success: true, message: "Payment submitted successfully"}
    }

    @Get("getGivingInformationForUser")
    async getGivingInformationForUser() {
        return this.givingService.getGivingInformationForUser();
    }
}
