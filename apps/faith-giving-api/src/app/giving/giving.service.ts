import { Injectable, Logger } from '@nestjs/common';
import { DataService } from '../services/data/data.service';
import { CreatePaymentIntentDto } from '../dto/giving/create-payment-intent.dto';
import { StripeService } from '../services/stripe.service';
import { GiveDetails, PaymentDTO } from '../dto/giving/payment.dto';
import { get, ref, set } from 'firebase/database';
import { AppConstants } from '../app.constant';
const { v4: uuidv4 } = require('uuid');

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

        if (payment.status == 'succeeded') {
            let uploadResult = await this.uploadGivingInformation(body.giveDetails);
            if (!uploadResult) {
                Logger.error(`Giving information upload failed`);
            }
        }
        return payment;
    }

    async uploadGivingInformation(data: GiveDetails) {
        let refDb = ref(this.dataService.getDatabase(), `${this.dataService.dbPath}/${AppConstants.OFFERINGS_PATH}/${uuidv4()}`);
        try {
            await set(refDb, data);
            Logger.log(`Giving information uploaded successfully`);
        } catch (error) {
            Logger.error(`Error uploading giving information: ${error}`);
            return false;
        }

        return true;
    }

    async getGivingInformationForUser() {
        let refDb = ref(this.dataService.getDatabase(), `${this.dataService.dbPath}/${AppConstants.OFFERINGS_PATH}`);
        let data = await get(refDb);
        Logger.log(`Giving information retrieved successfully`, data.val());
        let result = data.val().filter(d => d.email == 'dtatkison@gmail.com');
        return data.exists() ? result : [];
    }
}
