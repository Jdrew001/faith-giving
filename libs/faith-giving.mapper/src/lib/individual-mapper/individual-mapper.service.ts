import { Individual, IndividualDTO, PaymentMethodDTO } from '@faith-giving/faith-giving.model';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IndividualMapperService {

    entityToIndividualDTO(entity: Individual): IndividualDTO {
        return {
            id: entity.id || '',
            firstname: entity.firstname,
            lastname: entity.lastname,
            email: entity.email,
            phone: this.formatPhoneNumber(entity.phone),
            paymentMethods: entity.paymentMethods?.map(pm => this.entityToPaymentMethodDTO(pm))
        }
    }

    entityToPaymentMethodDTO(entity: any): PaymentMethodDTO {
        return {
            id: entity.id,
            paymentMethodId: entity.paymentMethodId,
            brand: entity.brand,
            last4: entity.last4,
            expMonth: entity.expMonth,
            expYear: entity.expYear
        };
    }

    formatPhoneNumber(number: string) {
        const cleanedNumber = String(number).replace(/\D/g, ''); // Remove non-digit characters
        const match = cleanedNumber.match(/^(\d{3})(\d{3})(\d{4})$/); // Match digits into groups

        if (match) {
          return `(${match[1]}) ${match[2]}-${match[3]}`; // Format into (XXX) XXX-XXXX
        }

        return number; // Return the original number if it doesn't match the expected format
      }
}
