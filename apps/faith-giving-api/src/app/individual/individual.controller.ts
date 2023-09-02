import { IndividualMapperService } from '@faith-giving/faith-giving.mapper';
import { ClientSessionDTO } from '@faith-giving/faith-giving.model';
import { Body, Controller, Get, Req } from '@nestjs/common';
import { ClientSessionService } from 'libs/faith-giving.service/src/lib/client-session/client-session.service';
import { IndividualService } from 'libs/faith-giving.service/src/lib/individual/individual.service';
import { Request } from 'express';
import { CryptService } from 'libs/faith-giving.service/src/lib/crypt/crypt.service';
import { ChmeetingService } from '@faith-giving/faith-giving.service';

@Controller('individual')
export class IndividualController {

    constructor(
        private sessionService: ClientSessionService,
        private individualMapper: IndividualMapperService,
        private individualService: IndividualService,
        private cryptService: CryptService,
        private chMeetingService: ChmeetingService
    ) {}

    @Get('individualBySession')
    async fetchIndividualWithSession(@Req() request: Request) {
        let data = this.cryptService.decrypt(request.cookies['client_data']) as ClientSessionDTO;
        
        let session = await this.sessionService.findClientSessionByIndividualId(data.individualId);
        if (!session) return { success: false, message: 'Session expired'}

        let individual = await this.individualService.findIndividualById(data.individualId);
        if (!individual) return { success: false, message: 'Unable to local individual' };
        return { success: true, data: this.individualMapper.entityToIndividualDTO(individual) }
    }

    @Get('getAllPeople')
    async fetchAllPeople(@Req() request: Request) {
        let data = await this.chMeetingService.getNewPeople();
        return {success: true, data: data};
    }
}
