import { Body, Controller, Post } from '@nestjs/common';
import { CreatePaymentIntentDto } from '../dto/giving/create-payment-intent.dto';

@Controller('giving')
export class GivingController {

    constructor(
    ) {}

    @Post("createPaymentIntent")
    createPaymentIntent(@Body() body: CreatePaymentIntentDto) {
        return body;
    }
}
