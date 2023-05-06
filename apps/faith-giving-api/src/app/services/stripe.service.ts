import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { CreatePaymentIntentDto } from '../dto/giving/create-payment-intent.dto';
import { PaymentDTO } from '../dto/giving/payment.dto';

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
        let total = this.getTotal(data.tithe, data.offerings, data.feeCovered);
        Logger.log(`Total: ${total}`);
        let paymentIntent: Stripe.PaymentIntent = await this.stripe.paymentIntents.create({
            amount: total * 100, // TODO: This needs to be calculated based on the amount passed in
            currency: 'usd',
            payment_method_types: ['card'],
        });
        return {id: paymentIntent.id, clientSecret: paymentIntent.client_secret };
    }

    async submitPayment(body: PaymentDTO) {
        let paymentIntent = await this.createPaymentIntent(body.giveDetails);
        Logger.log(`Submitting payment`);
        let payment = await this.stripe.paymentIntents.confirm(paymentIntent.id, {
            payment_method: body.paymentMethodId
        });

        if (!payment) {
            Logger.error(`Payment failed`, payment);
            throw new Error(`Payment failed`);
        }

        if (payment.status != 'succeeded') {
            Logger.error(`Payment failed`, payment);
            throw new Error(`Payment failed`);
        }

        Logger.log(`Payment succeeded`, payment);
        return payment;
    }

    private getTotal(tithe, offerings, feeCovered) {
        let total = tithe;
        let offeringTotal = offerings.map(x => x.amount);
        offeringTotal.forEach(item => total += item);
        if (feeCovered) {
          let fee = ((total * 0.022) + 0.30).toFixed(2);
          total = +total + +fee;
        }
        return total;
      }
}
