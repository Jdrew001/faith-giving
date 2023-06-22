import { Injectable } from '@nestjs/common';
import { Giving, Offering, PaymentDTO } from '@faith-giving/faith-giving.model';
import { GivingMapperService } from '@faith-giving/faith-giving.mapper';

@Injectable()
export class GivingService {

  constructor(
    private givingMapper: GivingMapperService
  ) {}

  async submitPayment(body: PaymentDTO) {
      let payment;
      let givingEntity = this.givingMapper.mapGivingToEntity(body.giveDetails);
      let offeringEntity = this.givingMapper.mapOfferingToEntity(body.giveDetails);
      let total = this.getTotal(givingEntity.tithe, offeringEntity, givingEntity.feeCovered);

      
  }

  calculateTotal(giving: Giving) {
    return this.getTotal(giving.tithe, giving.offerings, giving.feeCovered).toFixed(2);
  }

  private getTotal(tithe: number, offerings: Array<Offering>, feeCovered: boolean): number {
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
}
