import { ClientSession, ClientSessionDTO } from '@faith-giving/faith-giving.model';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ClientSessionMapperService {
    mapEntityToDTO(clientSession: ClientSession): ClientSessionDTO {
        return {
            sessionId: clientSession.id,
            individualId: clientSession.individual.id
        }
    }
}
