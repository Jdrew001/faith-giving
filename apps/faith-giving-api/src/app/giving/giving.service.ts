import { Injectable } from '@nestjs/common';
import { DataService } from '../services/data/data.service';
import { CreatePaymentIntentDto } from '../dto/giving/create-payment-intent.dto';
import { StripeService } from '../services/stripe.service';
import { PaymentDTO } from '../dto/giving/payment.dto';

@Injectable()
export class GivingService {

    constructor(
        private dataService: DataService,
        private stripeService: StripeService
    ) {}

    async createPaymentIntent(body: CreatePaymentIntentDto) {
        const stripeIntent = await this.stripeService.createPaymentIntent(body);
        return stripeIntent;
    }

    async submitPayment(body: PaymentDTO) {
        const payment = await this.stripeService.submitPayment(body);
        return payment;
    }
}
