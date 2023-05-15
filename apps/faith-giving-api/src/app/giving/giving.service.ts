import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DataService } from '../services/data/data.service';
import { CreatePaymentIntentDto } from '../dto/giving/create-payment-intent.dto';
import { StripeService } from '../services/stripe.service';
import { GiveDetails, PaymentDTO } from '../dto/giving/payment.dto';
import { getDocs, where, query, addDoc } from 'firebase/firestore';
import { EmailService } from '../services/email/email.service';
import { EmailConstant } from '../services/email/email.constant';

@Injectable()
export class GivingService {

    constructor(
        private dataService: DataService,
        private stripeService: StripeService,
        private emailService: EmailService
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
            Logger.log('Begin transaction of giving information')
            let uploadResult = await this.uploadGivingInformation(body.giveDetails);
            if (!uploadResult) {
                Logger.error(`Giving information upload failed`);
            } else {
                //Send give report to pastor
                Logger.log('Sending email to admins')
                await this.emailService.sendEmailToTemplate<any>("dtatkison@gmail.com", EmailConstant.GIVING_REPORT, this.generateGivingReport(body.giveDetails));

                //Send give recept to giver
                
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

    private generateGivingReport(data: GiveDetails) {
        let offerings = '';
        data.offerings.forEach(item => {
            offerings += `${item.category}: $${item.amount}\n`
        });
        return {
            fullName: `${data.firstName} ${data.lastName}`,
            email: data.email,
            tithe: data.tithe,
            offerings: offerings
        }
    }
}
