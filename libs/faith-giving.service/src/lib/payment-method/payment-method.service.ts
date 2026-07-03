import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from '@faith-giving/faith-giving.model';
import * as Sentry from '@sentry/node';

@Injectable()
export class PaymentMethodService {

    constructor(
        @InjectRepository(PaymentMethod) private paymentMethodRepo: Repository<PaymentMethod>
    ) {}

    async savePaymentMethod(data: {
        paymentMethodId: string;
        brand: string;
        last4: string;
        expMonth: number;
        expYear: number;
        individualId: string;
    }) {
        try {
            const existingCard = await this.findByCardDetails(data.individualId, data.brand, data.last4, data.expMonth, data.expYear);
            if (existingCard) return existingCard;

            const paymentMethod = this.paymentMethodRepo.create({
                paymentMethodId: data.paymentMethodId,
                brand: data.brand,
                last4: data.last4,
                expMonth: data.expMonth,
                expYear: data.expYear,
                individual: { id: data.individualId } as any
            });
            return await this.paymentMethodRepo.save(paymentMethod);
        } catch (error) {
            Logger.error(`Error saving payment method: ${error}`);
            Sentry.captureException(`Error saving payment method: ${error}`);
            throw error;
        }
    }

    async findByIndividualId(individualId: string) {
        try {
            const paymentMethods = await this.paymentMethodRepo.find({
                where: { individual: { id: individualId } } as any,
                order: { created_at: 'DESC' }
            });

            const uniquePaymentMethods = new Map<string, PaymentMethod>();
            paymentMethods.forEach(paymentMethod => {
                const key = `${paymentMethod.brand}-${paymentMethod.last4}-${paymentMethod.expMonth}-${paymentMethod.expYear}`;
                if (!uniquePaymentMethods.has(key)) {
                    uniquePaymentMethods.set(key, paymentMethod);
                }
            });

            return Array.from(uniquePaymentMethods.values());
        } catch (error) {
            Logger.error(`Error finding payment methods: ${error}`);
            Sentry.captureException(`Error finding payment methods: ${error}`);
            throw error;
        }
    }

    async deletePaymentMethod(id: string) {
        try {
            const result = await this.paymentMethodRepo.delete(id);
            return (result.affected ?? 0) > 0;
        } catch (error) {
            Logger.error(`Error deleting payment method: ${error}`);
            Sentry.captureException(`Error deleting payment method: ${error}`);
            throw error;
        }
    }

    async findByPaymentMethodId(paymentMethodId: string) {
        try {
            return await this.paymentMethodRepo.findOneBy({ paymentMethodId });
        } catch (error) {
            Logger.error(`Error finding payment method by id: ${error}`);
            Sentry.captureException(`Error finding payment method by id: ${error}`);
            throw error;
        }
    }

    async findByCardDetails(individualId: string, brand: string, last4: string, expMonth: number, expYear: number) {
        try {
            return await this.paymentMethodRepo.findOne({
                where: {
                    individual: { id: individualId },
                    brand,
                    last4,
                    expMonth,
                    expYear
                } as any
            });
        } catch (error) {
            Logger.error(`Error finding payment method by card details: ${error}`);
            Sentry.captureException(`Error finding payment method by card details: ${error}`);
            throw error;
        }
    }
}
