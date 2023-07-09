import { Individual, IndividualDTO } from '@faith-giving/faith-giving.model';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IndividualMapperService {

    entityToIndividualDTO(entity: Individual): IndividualDTO {
        return {
            firstname: entity.firstname,
            lastname: entity.lastname,
            email: entity.email,
            phone: this.formatPhoneNumber(entity.phone)
        }
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
