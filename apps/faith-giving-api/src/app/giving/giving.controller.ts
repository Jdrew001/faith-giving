import { Body, Controller, Post } from '@nestjs/common';
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

    //pm_1N4mnaA0DJoBf0VzpG4esIVN
    @Post("submitPayment")
    async submitPayment(@Body() body: PaymentDTO) {
        await this.givingService.submitPayment(body);
        return {success: true, message: "Payment submitted successfully"}
    }
}
