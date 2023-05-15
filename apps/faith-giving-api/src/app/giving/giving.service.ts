import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DataService } from '../services/data/data.service';
import { CreatePaymentIntentDto } from '../dto/giving/create-payment-intent.dto';
import { StripeService } from '../services/stripe.service';
import { GiveDetails, PaymentDTO } from '../dto/giving/payment.dto';
import { getDocs, where, query, addDoc } from 'firebase/firestore';
import { EmailService } from '../services/email/email.service';
import { EmailConstant } from '../services/email/email.constant';
import { AppService } from '../app.service';

@Injectable()
export class GivingService {

    constructor(
        private dataService: DataService,
        private stripeService: StripeService,
        private emailService: EmailService,
        private appService: AppService
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
                let admins = (await this.appService.getAdminUsers()).map(o => o.email);
                //Send give report to pastor
                Logger.log('Sending email to admins');
                admins.forEach(async user => await this.emailService.sendEmailToTemplate<any>(user, 
                    EmailConstant.GIVING_REPORT_SUBJECT, 
                    EmailConstant.GIVING_REPORT, 
                    await this.generateGivingReport(body.giveDetails)));

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

    private async generateGivingReport(data: GiveDetails) {
        let offeringRef = await this.appService.getReferenceData();
        let offerings = '';
        data.offerings.forEach(item => {
            let offeringType = offeringRef.find(o => o.id == item.category)
            offerings += `${offeringType.label}: $${item.amount}\n`
        });
        return {
            fullName: `${data.firstName} ${data.lastName}`,
            email: data.email,
            tithe: data.tithe,
            offerings: offerings
        }
    }
}
