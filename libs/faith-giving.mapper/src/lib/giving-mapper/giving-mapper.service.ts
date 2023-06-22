import { Injectable } from '@nestjs/common';
import { GiveDetails, Giving, Offering, OfferingDTO } from '@faith-giving/faith-giving.model';

@Injectable()
export class GivingMapperService {

    mapGivingToEntity(giving: GiveDetails): Giving {
        return {
            tithe: giving.tithe,
            individual: {
                firstname: giving.firstName,
                lastname: giving.lastName,
                email: giving.email,
                phone: giving.phone
            },
            feeCovered: giving.feeCovered,
            offerings: []
        }
    }

    mapOfferingToEntity(giving: GiveDetails): Array<Offering> {
        let offerings = giving.offerings;

        return offerings.map(({amount, category, other}) => ({
            amount: amount,
            type: category,
            other: other
        }));
    }
}
