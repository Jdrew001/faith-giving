import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientSession } from '@faith-giving/faith-giving.model';
import { IndividualService } from '../individual/individual.service';

@Injectable()
export class ClientSessionService {

    constructor(
        @InjectRepository(ClientSession) private clientSessionRepo: Repository<ClientSession>,
        private individualService: IndividualService
    ) {
    }

    async findClientSessionByIndividualId(id: string | undefined) {
        return id ? await this.clientSessionRepo.findOneBy({individual: { id: id }}): null;
    }

    async saveNewClientSession(data: {firstname: string, lastname: string, email: string, phone: string}): Promise<ClientSession | null> {
        let result;
        try {
            let individualData = await this.individualService.findIndividualByNameEmailPhone(data);
            let existingClientSession = await this.findClientSessionByIndividualId(individualData?.id);
            Logger.log('Setting up individual client session');
            if (!individualData) return null;
    
            //If an existing session exists, then we want to return because we don't need to update it..
            if (existingClientSession) {
                existingClientSession.individual = individualData;
                return existingClientSession;
            };
            let newClientSession = new ClientSession();
            newClientSession.individual = individualData;
    
            Logger.log('Saving new client session for individual', individualData.id);
            result = await this.clientSessionRepo.save(newClientSession);
    
        } catch (error) {
            Logger.error(`ERROR - client session service: ${error}`);
            throw new BadRequestException('An error occurred', { cause: error, description: 'Oops, an error occurred'});
        }
        
        return result;
    }
}
