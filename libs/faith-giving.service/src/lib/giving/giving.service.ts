import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CalulateTotalDto, Giving, GivingReceipt, GivingReportDto, Individual, Offering, OfferingType, PaymentDTO, User } from '@faith-giving/faith-giving.model';
import { GivingMapperService } from '@faith-giving/faith-giving.mapper';
import { StripeService } from '../stripe/stripe.service';
import { EmailService } from '../email/email.service';
import * as Sentry from '@sentry/node';
import { AppConstants } from '../app.constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReferenceService } from '../reference/reference.service';
import { UserService } from '../user/user.service';
import { EmailConstant } from '../email/email.constant';
import { IndividualService } from '../individual/individual.service';
import { PaymentMethodService } from '../payment-method/payment-method.service';

@Injectable()
export class GivingService {

  get isDevelopment() { return process.env['NODE_ENV'] == 'development' }

  constructor(
    private givingMapper: GivingMapperService,
    private stripeService: StripeService,
    private emailService: EmailService,
    private userService: UserService,
    @InjectRepository(Giving) private givingRepo: Repository<Giving>,
    @InjectRepository(Offering) private offeringRepo: Repository<Offering>,
    @InjectRepository(Individual) private individualRepo: Repository<Individual>,
    private referenceService: ReferenceService,
    private individualService: IndividualService,
    private paymentMethodService: PaymentMethodService
  ) {}

  async submitPayment(body: PaymentDTO) {
      let payment;
      let givingEntity = this.givingMapper.mapGivingToEntity(body.giveDetails);
      let total = this.getTotal(givingEntity.tithe, givingEntity.offerings, givingEntity.feeCovered);

      let customerId: string | undefined;
      let individual = await this.individualService.findIndividualByPhone(givingEntity.individual.phone);
      
      if (!individual) {
          individual = await this.individualRepo.save(givingEntity.individual);
      }

      customerId = await this.stripeService.getOrCreateCustomer(
          individual.email,
          `${individual.firstname} ${individual.lastname}`,
          individual.phone,
          individual.stripeCustomerId || undefined
      );

      if (customerId !== individual.stripeCustomerId) {
          individual.stripeCustomerId = customerId;
          await this.individualRepo.save(individual);
      }

      if (!body.savePaymentMethod) {
          const paymentMethodCustomerId = await this.stripeService.getPaymentMethodCustomerId(body.paymentMethodId);
          if (paymentMethodCustomerId && paymentMethodCustomerId !== customerId) {
              customerId = paymentMethodCustomerId;
              individual.stripeCustomerId = customerId;
              await this.individualRepo.save(individual);
          }
      }

      givingEntity.individual = individual;

      try {
        payment = await this.stripeService.submitPayment(body, total, customerId, body.savePaymentMethod);
      } catch (error) {
        Sentry.captureException(`error submitting payment: ${error}, User: ${givingEntity.individual.firstname} ${givingEntity.individual.lastname}`);
        Logger.error(`ERROR - giving service: submit payment: ${error}`);
        let message = AppConstants.CARD_ERROR_MESSAGES[error?.code] ?? 'Oops, an error occurred';
        throw new BadRequestException('An error occurred', { cause: error, description: message });
      }

      if (payment.status != 'succeeded') return null;
      Logger.log('Begin transaction of giving information');
      let uploadResult = await this.saveGivingInformation(givingEntity);

      if (!uploadResult) {
        Logger.error(`Giving information upload failed`, uploadResult);
        Sentry.captureException(`Giving information upload failed: ${uploadResult}, Details: ${givingEntity}`);
        return null;
      }

      const savedGiving = uploadResult as Giving;

      if (payment.payment_method && savedGiving.individual && savedGiving.individual.id) {
          try {
              const individual = savedGiving.individual as Individual;
              const individualId = individual.id as string;
              const paymentMethodId = payment.payment_method as string;
              const existingPaymentMethod = await this.paymentMethodService.findByPaymentMethodId(paymentMethodId);

              if (!existingPaymentMethod) {
                  Logger.log(`Saving payment method - customerId: ${customerId}, paymentMethodId: ${paymentMethodId}, individualId: ${individual.id}`);
                  const pm = await this.stripeService.stripe.paymentMethods.retrieve(paymentMethodId);
                  const card = pm.card;
                  if (card) {
                      await this.paymentMethodService.savePaymentMethod({
                          paymentMethodId: paymentMethodId,
                          brand: card.brand,
                          last4: card.last4,
                          expMonth: card.exp_month,
                          expYear: card.exp_year,
                          individualId: individualId
                      });
                      Logger.log(`Payment method saved successfully for individual ${individualId}`);
                  }
              }
          } catch (error) {
              Logger.error(`Error saving payment method: ${error}`);
              Sentry.captureException(`Error saving payment method: ${error}`);
          }
      } else {
          Logger.log(`Payment method not saved - payment.payment_method: ${!!payment.payment_method}, uploadResult.individual: ${!!savedGiving.individual}`);
      }

      this.communicateGivingSuccess(givingEntity, body, total);

      return uploadResult;
  }

  async saveGivingInformation(giving: Giving) {
    try {
      const individual = await this.individualService.findIndividualByNameEmailPhone(giving.individual);

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
        let name = label == 'Other' ? `${label} - ${item.other}` : `${label}`;

        remappedOfferings.push({label: name, amount: (item.amount).toFixed(2)});
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
  }
}
