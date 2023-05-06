import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { CreatePaymentIntentDto } from '../dto/giving/create-payment-intent.dto';

@Injectable()
export class StripeService {

    stripe: Stripe;

    constructor() {
        if (!this.stripeKey) {
            throw new Error('Stripe key not found');
        }

        Logger.log(`Stripe Key loaded -- initalizing stripe`);
        this.initStripe();
    }

    get stripeKey() { return process.env.NODE_ENV == 'development' ? process.env.STRIPE_TEST_KEY: process.env.STRIPE_KEY; }
    
    initStripe() {
        this.stripe = new Stripe(this.stripeKey, {
            apiVersion: '2022-11-15',
            maxNetworkRetries: 2
        });
    }

    async createPaymentIntent(data: CreatePaymentIntentDto) {
        Logger.log(`Creating payment intent`);
        let paymentIntent: Stripe.PaymentIntent = await this.stripe.paymentIntents.create({
            amount: 1000, // TODO: This needs to be calculated based on the amount passed in
            currency: 'usd',
            payment_method_types: ['card'],
        });
        return {id: paymentIntent.id, clientSecret: paymentIntent.client_secret };
    }
}
