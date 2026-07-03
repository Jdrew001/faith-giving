import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import * as Sentry from '@sentry/node';
import { GiveDetails, PaymentDTO } from '@faith-giving/faith-giving.model';

@Injectable()
export class StripeService {

    stripe: Stripe;
    get stripeKey(): string { return (process.env['NODE_ENV'] == 'development' ? process.env['STRIPE_TEST_KEY']: process.env['STRIPE_KEY']) as string; }

    constructor() {
        if (!this.stripeKey) {
            throw new Error('Stripe key not found');
        }

        this.initStripe();
    }

    initStripe() {
        this.stripe = new Stripe(this.stripeKey, {
            apiVersion: '2022-11-15',
            maxNetworkRetries: 2
        });
    }

    async getOrCreateCustomer(email: string, name: string, phone: string, existingCustomerId?: string): Promise<string> {
        if (existingCustomerId) {
            try {
                const customer = await this.stripe.customers.retrieve(existingCustomerId);
                if (customer && !customer.deleted) {
                    return existingCustomerId;
                }
            } catch (error) {
                Logger.warn(`Existing customer ${existingCustomerId} not found, creating new one`);
            }
        }

        try {
            const customer = await this.stripe.customers.create({
                email,
                name,
                phone,
                metadata: { phone }
            });
            return customer.id;
        } catch (error) {
            Logger.error(`ERROR: creating Stripe customer: ${error}`);
            Sentry.captureException(`error creating Stripe customer: ${error}`);
            throw new BadRequestException('An error occurred', { cause: error, description: 'error creating Stripe customer' });
        }
    }

    async attachPaymentMethodToCustomer(paymentMethodId: string, customerId: string): Promise<void> {
        try {
            await this.stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
        } catch (error) {
            Logger.error(`ERROR: attaching payment method to customer: ${error}`);
            Sentry.captureException(`error attaching payment method: ${error}`);
            throw new BadRequestException('An error occurred', { cause: error, description: 'error attaching payment method' });
        }
    }

    async listPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
        try {
            const paymentMethods = await this.stripe.paymentMethods.list({
                customer: customerId,
                type: 'card'
            });
            return paymentMethods.data;
        } catch (error) {
            Logger.error(`ERROR: listing payment methods: ${error}`);
            Sentry.captureException(`error listing payment methods: ${error}`);
            throw new BadRequestException('An error occurred', { cause: error, description: 'error listing payment methods' });
        }
    }

    async getPaymentMethodCustomerId(paymentMethodId: string): Promise<string | undefined> {
        const paymentMethod = await this.stripe.paymentMethods.retrieve(paymentMethodId);
        if (!paymentMethod.customer || typeof paymentMethod.customer !== 'string') return undefined;
        return paymentMethod.customer;
    }

    async detachPaymentMethod(paymentMethodId: string): Promise<void> {
        try {
            await this.stripe.paymentMethods.detach(paymentMethodId);
        } catch (error) {
            Logger.error(`ERROR: detaching payment method: ${error}`);
            Sentry.captureException(`error detaching payment method: ${error}`);
            throw new BadRequestException('An error occurred', { cause: error, description: 'error detaching payment method' });
        }
    }

    async createPaymentIntent(data: GiveDetails, total: number, customerId?: string, savePaymentMethod?: boolean) {
        Logger.log(`Creating payment intent`);
        let paymentIntent;
        Logger.log(`Total: ${total}`);
        try {
            const intentParams: Stripe.PaymentIntentCreateParams = {
                amount: parseFloat((total * 100).toFixed(2)),
                currency: 'usd',
                payment_method_types: ['card'],
            };

            if (customerId) {
                intentParams.customer = customerId;
            }

            if (customerId) {
                intentParams.setup_future_usage = 'off_session';
            }

            paymentIntent = await this.stripe.paymentIntents.create(intentParams);
        } catch (error) {
            Logger.error(`ERROR: creating payment intent: ${error}`);
            Sentry.captureException(`error creating payment intent: ${error}`);
            throw new BadRequestException('An error occurred', { cause: new Error(), description: 'error creating payment intent' });
        }
        return {id: paymentIntent.id, clientSecret: paymentIntent.client_secret };
    }

    async submitPayment(body: PaymentDTO, total: number, customerId?: string, savePaymentMethod?: boolean) {
        let paymentIntent = await this.createPaymentIntent(body.giveDetails, total, customerId, savePaymentMethod);
        Logger.log(`Submitting payment`);
        let payment = await this.stripe.paymentIntents.confirm(paymentIntent.id, {
            payment_method: body.paymentMethodId
        });

        if (!payment) {
            Logger.error(`Payment failed: ${payment}`);
            Sentry.captureException(`error submitting payment (submit payment) failed: ${payment}`);
            throw new BadRequestException('An error occurred', { cause: new Error(), description: 'error submitting payment' });
        }

        if (payment.status != 'succeeded') {
            Logger.error(`Payment failed: ${payment}`);
            Sentry.captureException(`error submitting payment (submit payment) failed: ${payment}`);
            throw new BadRequestException('An error occurred', { cause: new Error(), description: 'error submitting payment' });
        }

        Logger.log(`Payment succeeded`);
        return payment;
    }
}
