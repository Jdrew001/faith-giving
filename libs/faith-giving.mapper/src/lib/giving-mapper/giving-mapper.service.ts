import { Injectable } from '@nestjs/common';
import { GiveDetails, Giving, Offering, OfferingDTO } from '@faith-giving/faith-giving.model';

@Injectable()
export class GivingMapperService {

    mapGivingToEntity(giving: GiveDetails): Giving {
        return {
            tithe: giving.tithe,
            individual: {
                firstname: giving.firstName.trimEnd(),
                lastname: giving.lastName.trimEnd(),
                email: giving.email.toLowerCase().trimEnd(),
                phone: giving.phone.replace(/[\s\-()]/g, "").trimEnd()
            },
            feeCovered: giving.feeCovered,
            offerings: this.mapOfferingToEntity(giving.offerings)
        }
    }

    mapOfferingToEntity(offerings: Array<OfferingDTO>): Array<Offering> {
        return offerings.map(({amount, category, other}) => ({
            amount: amount,
            type: category,
            other: other
        }));
    }
}
