import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DataService } from '../services/data/data.service';
import { CreatePaymentIntentDto, Offering } from '../dto/giving/create-payment-intent.dto';
import { StripeService } from '../services/stripe.service';
import { CalulateTotalDto, GiveDetails, PaymentDTO } from '../dto/giving/payment.dto';
import { getDocs, where, query, addDoc } from 'firebase/firestore';
import { EmailService } from '../services/email/email.service';
import { EmailConstant } from '../services/email/email.constant';
import { AppService } from '../app.service';
import { ReferenceDto } from '../dto/reference.dto';
import { GivingReceipt, GivingReportDto } from '../dto/email/giving.model';
import * as Sentry from '@sentry/node';
import { AppConstants } from '../app.constant';
import { GivingEntity } from '../entities/giving';
import { TextingService } from '../services/texting/texting.service';

@Injectable()
export class GivingService {

    constructor(
        private dataService: DataService,
        private stripeService: StripeService,
        private emailService: EmailService,
        private appService: AppService,
        private textingService: TextingService
    ) {}

    async submitPayment(body: PaymentDTO) {
        let payment;
        let entity = this.mapDtoToEntity(body.giveDetails);
        let total = this.getTotal(entity.tithe, entity.offerings, entity.feeCovered);
        try {
            payment = await this.stripeService.submitPayment(body, total);
        } catch (error) {
            Sentry.captureException(`error submitting payment: ${error}, User: ${entity.firstName} ${entity.lastName}`);
            Logger.error(`ERROR - giving service: submit payment: ${error}`);
            let message = AppConstants.CARD_ERROR_MESSAGES[error?.code] ?? 'Oops, an error occurred';
            throw new BadRequestException('An error occurred', { cause: error, description: message });
        }
        
        if (payment.status == 'succeeded') {
            Logger.log('Begin transaction of giving information')
            let uploadResult = await this.uploadGivingInformation(entity);
            if (!uploadResult) {
                Logger.error(`Giving information upload failed`, uploadResult);
                Sentry.captureException(`Giving information upload failed: ${uploadResult}, Details: ${entity}`);
            } else {
                let refData = await this.appService.getReferenceData();
                let givingReportDTO = await this.generateGivingReport(entity, refData, total);
                let givingReceptDTO = await this.generateGivingRecept(entity, refData, total);
                let admins = await this.appService.getAdminUsers();

                //Send give report to admins
                Logger.log('Sending email to admins')
                admins.forEach(async user => {
                    await this.emailService.sendEmailToTemplate<any>(user.email, EmailConstant.GIVING_REPORT_SUBJECT, EmailConstant.GIVING_REPORT, givingReportDTO);
                });

                //Send give recept to giver
                Logger.log(`Sending email to giver: ${body.giveDetails.email} ${body.giveDetails.firstName} ${body.giveDetails.lastName}`);
                await this.emailService.sendEmailToTemplate<any>(body.giveDetails.email, EmailConstant.GIVING_RECIEPT_SUBJECT, EmailConstant.GIVING_RECIEPT_TEMPLATE, givingReceptDTO);
                await this.textingService.sendText(`+1${body.giveDetails.phone}`, 
                    `Thank you for giving $${total.toFixed(2)} to Faith Tabernacle. A reciept has been sent to your email. If you have trouble viewing it, it might be in your spam folder. God Bless!`);
            }
        }
        return payment;
    }

    async uploadGivingInformation(data: GiveDetails) {
        let result;
        let nData = {
            ...data,
            role: ['SYSTEM']
        }
        try {
            result = addDoc(this.dataService.collection('giving'), nData);
        } catch (error) {
            Logger.error(`Error uploading giving information: ${error}`);
            throw new BadRequestException('An error occurred', { cause: new Error(), description: 'error saving information' })
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

    calculateTotal(body: CalulateTotalDto) {
        return this.getTotal(body.tithe, body.offerings, body.feeCovered).toFixed(2);
    }

    private generateGivingRecept(data: GiveDetails, refData: Array<ReferenceDto>, total: number) {
        return new GivingReceipt(
            data.firstName,
            data.lastName,
            data.tithe.toFixed(2),
            this.remapOfferings(refData, data.offerings),   
            data.feeCovered,
           (total).toFixed(2)
        ); 
    }

    private async generateGivingReport(data: GiveDetails, refData: Array<ReferenceDto>, total: number) {
        return new GivingReportDto(
            data.firstName,
            data.lastName,
            data.email,
            data.phone,
            (data.tithe).toFixed(2),
            this.remapOfferings(refData, data.offerings),
            data.feeCovered,
            (total).toFixed(2)
        );
    }

    private remapOfferings(refData: ReferenceDto[], offerings: Offering[]) {
        let remappedOfferings = [];
        offerings.forEach(item => {
            let label = refData.find(o => o.id == item.category).label;
            remappedOfferings.push({label: label, amount: (item.amount).toFixed(2)});
        });

        return remappedOfferings;
    }

    private getTotal(tithe, offerings, feeCovered): number {
        let total = tithe;
        let offeringTotal = 0;

        offerings?.forEach(item => {
            offeringTotal += item.amount;
        });

        if (feeCovered) {
            const fee = (total + offeringTotal) * 0.022 + 0.30;
            return +(total + offeringTotal + fee).toFixed(2);
        }

        return total + offeringTotal;
    }

    private mapDtoToEntity(dto: GiveDetails) {
        return Object.assign({}, new GivingEntity(
            dto.email,
            dto.firstName,
            dto.lastName,
            dto.phone,
            dto.tithe,
            dto.offerings,
            dto.feeCovered
        ));
    }
}
