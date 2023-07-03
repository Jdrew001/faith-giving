import { ClientSession, ClientSessionDTO } from '@faith-giving/faith-giving.model';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ClientSessionMapperService {
    mapEntityToDTO(clientSession: ClientSession): ClientSessionDTO {
        return {
            sessionId: clientSession.id,
            individualId: clientSession.individual.id,
            firstname: clientSession.individual.firstname,
            lastname: clientSession.individual.lastname,
            email: clientSession.individual.email,
            phone: clientSession.individual.phone
        }
    }
}
