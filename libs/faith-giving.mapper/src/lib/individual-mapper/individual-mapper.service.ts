import { Individual, IndividualDTO } from '@faith-giving/faith-giving.model';
import { Injectable } from '@nestjs/common';

@Injectable()
export class IndividualMapperService {

    entityToIndividualDTO(entity: Individual): IndividualDTO {
        return {
            firstname: entity.firstname,
            lastname: entity.lastname,
            email: entity.email,
            phone: entity.phone
        }
    }
}
