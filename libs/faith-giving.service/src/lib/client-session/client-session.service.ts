import { Individual } from '@faith-giving/faith-giving.model';
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

    async findClientSessionByIndividualEmail(email: string) {
        return await this.clientSessionRepo.findBy({individual: { email: email }});
    }

    async saveNewClientSession(individualEmail: string): Promise<ClientSession | null> {
        let result;
        try {
            let existingClientSession = await this.findClientSessionByIndividualEmail(individualEmail);
            let individualData = await this.individualService.findIndividualByEmail(individualEmail);
            Logger.log('Setting up individual client session');
            if (!individualData) return null;
    
            //If an existing session exists, then we want to return because we don't need to update it..
            if (existingClientSession) return null;
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
