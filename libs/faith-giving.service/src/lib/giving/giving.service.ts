import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CalulateTotalDto, Giving, GivingReceipt, GivingReportDto, Offering, OfferingType, PaymentDTO, User } from '@faith-giving/faith-giving.model';
import { GivingMapperService } from '@faith-giving/faith-giving.mapper';
import { StripeService } from '../stripe/stripe.service';
import { EmailService } from '../email/email.service';
import { TextingService } from '../texting/texting.service';
import * as Sentry from '@sentry/node';
import { AppConstants } from '../app.constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReferenceService } from '../reference/reference.service';
import { UserService } from '../user/user.service';
import { EmailConstant } from '../email/email.constant';
import { IndividualService } from '../individual/individual.service';

@Injectable()
export class GivingService {

  constructor(
    private givingMapper: GivingMapperService,
    private stripeService: StripeService,
    private emailService: EmailService,
    private textingService: TextingService,
    private userService: UserService,
    @InjectRepository(Giving) private givingRepo: Repository<Giving>,
    @InjectRepository(Offering) private offeringRepo: Repository<Offering>,
    private referenceService: ReferenceService,
    private individualService: IndividualService
  ) {}

  async submitPayment(body: PaymentDTO) {
      let payment;
      let givingEntity = this.givingMapper.mapGivingToEntity(body.giveDetails);
      let total = this.getTotal(givingEntity.tithe, givingEntity.offerings, givingEntity.feeCovered);

      try {
        payment = await this.stripeService.submitPayment(body, total);
      } catch (error) {
        Sentry.captureException(`error submitting payment: ${error}, User: ${givingEntity.individual.firstname} ${givingEntity.individual.lastname}`);
        Logger.error(`ERROR - giving service: submit payment: ${error}`);
        let message = AppConstants.CARD_ERROR_MESSAGES[error?.code] ?? 'Oops, an error occurred';
        throw new BadRequestException('An error occurred', { cause: error, description: message });
      }

      if (payment.status != 'succeeded') return;
      Logger.log('Begin transaction of giving information');
      let uploadResult = await this.saveGivingInformation(givingEntity);

      if (!uploadResult) {
        Logger.error(`Giving information upload failed`, uploadResult);
        Sentry.captureException(`Giving information upload failed: ${uploadResult}, Details: ${givingEntity}`);
        return;
      }
      this.communicateGivingSuccess(givingEntity, body, total);

      return uploadResult;
  }

  async saveGivingInformation(giving: Giving) {
    try {
      const individual = await this.individualService.findIndividualByEmail(giving.individual.email);

      if (individual) {
        giving.individual = individual;
      }

      await this.givingRepo.save(giving);
    } catch(error) {
      Logger.error('Unable to save giving entity');
      Sentry.captureException('error saving giving entity');
      return null;
    }

    return giving;
  }

  calculateTotal(giving: CalulateTotalDto) {
    return this.getTotal(giving.tithe, giving.offerings, giving.feeCovered).toFixed(2);
  }

  private getTotal(tithe: number, offerings: {amount: number}[], feeCovered: boolean): number {
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

  private generateGivingRecept(data: Giving, refData: Array<OfferingType>, total: number) {
    return new GivingReceipt(
      data.individual.firstname,
      data.individual.lastname,
      data.tithe.toFixed(2),
      this.remapOfferings(refData, data.offerings),   
      data.feeCovered,
      (total).toFixed(2)
    ); 
}

private async generateGivingReport(data: Giving, refData: Array<OfferingType>, total: number) {
    return new GivingReportDto(
        data.individual.firstname,
        data.individual.lastname,
        data.individual.email,
        data.individual.phone,
        (data.tithe).toFixed(2),
        this.remapOfferings(refData, data.offerings),
        data.feeCovered,
        (total).toFixed(2)
    );
  }

  private remapOfferings(refData: OfferingType[], offerings: Offering[]) {
    let remappedOfferings: Array<any> = [];
    offerings.forEach(item => {
        let label = refData.find(o => o.id == item.type)?.label;
        remappedOfferings.push({label: label, amount: (item.amount).toFixed(2)});
    });

    return remappedOfferings;
  }

  private async communicateGivingSuccess(givingEntity: Giving, body: PaymentDTO, total: number) {
    let refData = await this.referenceService.findAll();
    let GivingReportDto = await this.generateGivingReport(givingEntity, refData, total);
    let givingReceptDTO = await this.generateGivingRecept(givingEntity, refData, total);
    let admins = await this.userService.findAdmins();

    //Send give report to admins
    Logger.log('Sending email to admins')
    admins.forEach(async user => {
        await this.emailService.sendEmailToTemplate<any>(user.email, EmailConstant.GIVING_REPORT_SUBJECT, EmailConstant.GIVING_REPORT, GivingReportDto);
    });

    //Send give recept to giver
    Logger.log(`Sending email to giver: ${body.giveDetails.email} ${body.giveDetails.firstName} ${body.giveDetails.lastName}`);
    await this.emailService.sendEmailToTemplate<any>(body.giveDetails.email, EmailConstant.GIVING_RECIEPT_SUBJECT, EmailConstant.GIVING_RECIEPT_TEMPLATE, givingReceptDTO);
    await this.textingService.sendText(`+1${body.giveDetails.phone}`, 
        `Thank you for giving $${total.toFixed(2)} to Faith Tabernacle. A reciept has been sent to your email. If you have trouble viewing it, it might be in your spam folder. God Bless!`);
  }
}
