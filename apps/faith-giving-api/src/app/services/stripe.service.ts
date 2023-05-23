import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { CreatePaymentIntentDto } from '../dto/giving/create-payment-intent.dto';
import { PaymentDTO } from '../dto/giving/payment.dto';
import * as Sentry from '@sentry/node';

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

    async createPaymentIntent(data: CreatePaymentIntentDto, total: number) {
        Logger.log(`Creating payment intent`);
        let paymentIntent;
        Logger.log(`Total: ${total}`);
        try {
            paymentIntent = await this.stripe.paymentIntents.create({
                amount: parseFloat((total * 100).toFixed(2)), // TODO: This needs to be calculated based on the amount passed in
                currency: 'usd',
                payment_method_types: ['card'],
            });
        } catch (error) {
            Sentry.captureException(`error creating payment intent: ${error}`);
            throw new BadRequestException('An error occurred', { cause: new Error(), description: 'error creating payment intent' });
        }
        return {id: paymentIntent.id, clientSecret: paymentIntent.client_secret };
    }

    async submitPayment(body: PaymentDTO, total: number) {
        let paymentIntent = await this.createPaymentIntent(body.giveDetails, total);
        Logger.log(`Submitting payment`);
        let payment = await this.stripe.paymentIntents.confirm(paymentIntent.id, {
            payment_method: body.paymentMethodId
        });

        if (!payment) {
            Logger.error(`Payment failed`, payment);
            Sentry.captureException(`error submitting payment (submit payment) failed: ${payment}`);
            throw new BadRequestException('An error occurred', { cause: new Error(), description: 'error submitting payment' });
        }

        if (payment.status != 'succeeded') {
            Logger.error(`Payment failed`, payment);
            Sentry.captureException(`error submitting payment (submit payment) failed: ${payment}`);
            throw new BadRequestException('An error occurred', { cause: new Error(), description: 'error submitting payment' });
        }

        Logger.log(`Payment succeeded`);
        return payment;
    }
}
