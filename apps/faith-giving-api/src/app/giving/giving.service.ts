import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DataService } from '../services/data/data.service';
import { CreatePaymentIntentDto } from '../dto/giving/create-payment-intent.dto';
import { StripeService } from '../services/stripe.service';
import { GiveDetails, PaymentDTO } from '../dto/giving/payment.dto';
import { getDocs, where, query, addDoc } from 'firebase/firestore';

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
        let payment;
        try {
            payment = await this.stripeService.submitPayment(body);
        } catch (error) {
            throw new BadRequestException('An error occurred', { cause: new Error(), description: 'error submitting payment' });
        }
       

        if (payment.status == 'succeeded') {
            let uploadResult = await this.uploadGivingInformation(body.giveDetails);
            if (!uploadResult) {
                Logger.error(`Giving information upload failed`);
            }
        }
        return payment;
    }

    async uploadGivingInformation(data: GiveDetails) {
        let result;
        try {
            result = addDoc(this.dataService.collection('giving'), data);
        } catch (error) {
            Logger.error(`Error uploading giving information: ${error}`);
            return false;
        }

        return result;
    }

    async getGivingInformationForUser(email: string) {
        let data;
        try {
            let col = query(this.dataService.collection('giving'), where('email', '==', email));
            data = await getDocs(col);
        } catch (error) {
            Logger.error(`Error getting documents: ${error}`);
            throw new BadRequestException('An error occurred', { cause: new Error(), description: 'error retrieving giving information' })
        }

        return {data: data.docs.map(doc => doc.data()) as GiveDetails[], length: data.docs.length};
    }
}
