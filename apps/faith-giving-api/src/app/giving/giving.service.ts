import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DataService } from '../services/data/data.service';
import { CreatePaymentIntentDto } from '../dto/giving/create-payment-intent.dto';
import { StripeService } from '../services/stripe.service';
import { GiveDetails, PaymentDTO } from '../dto/giving/payment.dto';
import { getDocs, where, query, addDoc } from 'firebase/firestore';
import { EmailService } from '../services/email/email.service';
import { EmailConstant } from '../services/email/email.constant';
import { AppService } from '../app.service';
import { ReferenceDto } from '../dto/reference.dto';
import { GivingReportDto } from '../dto/email/giving.model';

@Injectable()
export class GivingService {

    constructor(
        private dataService: DataService,
        private stripeService: StripeService,
        private emailService: EmailService,
        private appService: AppService
    ) {}

    async submitPayment(body: PaymentDTO) {
        let payment;
        let total = this.getTotal(body.giveDetails.tithe, body.giveDetails.offerings, body.giveDetails.feeCovered);
        try {
            payment = await this.stripeService.submitPayment(body, total);
        } catch (error) {
            throw new BadRequestException('An error occurred', { cause: new Error(), description: 'error submitting payment' });
        }
        
        if (payment.status == 'succeeded') {
            Logger.log('Begin transaction of giving information')
            let uploadResult = await this.uploadGivingInformation(body.giveDetails);
            if (!uploadResult) {
                Logger.error(`Giving information upload failed`);
            } else {
                let refData = await this.appService.getReferenceData();
                let givingReportDTO = await this.generateGivingReport(body.giveDetails, refData, total);

                //Send give report to pastor
                Logger.log('Sending email to admins')
                await this.emailService.sendEmailToTemplate<any>("dtatkison@gmail.com", EmailConstant.GIVING_REPORT_SUBJECT, EmailConstant.GIVING_REPORT, givingReportDTO);

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

    private async generateGivingReport(data: GiveDetails, refData: Array<ReferenceDto>, total: number) {
        let remappedOfferings = [];

        data.offerings.forEach(item => {
            let label = refData.find(o => o.id == item.category).label;
            remappedOfferings.push({label: label, amount: item.amount});
        });
        
        return new GivingReportDto(
            data.firstName,
            data.lastName,
            data.email,
            data.phone,
            data.tithe.toString(),
            remappedOfferings,
            data.feeCovered,
            parseFloat((total).toFixed(2)).toString()
        );
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
