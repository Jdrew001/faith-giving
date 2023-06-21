import { Injectable } from '@nestjs/common';
import { PaymentDTO } from '@faith-giving/faith-giving.model';
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
  }
}
