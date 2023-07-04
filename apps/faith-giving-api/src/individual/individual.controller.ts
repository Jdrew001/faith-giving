import { IndividualMapperService } from '@faith-giving/faith-giving.mapper';
import { ClientSessionDTO } from '@faith-giving/faith-giving.model';
import { Body, Controller, Post } from '@nestjs/common';
import { ClientSessionService } from 'libs/faith-giving.service/src/lib/client-session/client-session.service';
import { IndividualService } from 'libs/faith-giving.service/src/lib/individual/individual.service';

@Controller('individual')
export class IndividualController {

    constructor(
        private sessionService: ClientSessionService,
        private individualMapper: IndividualMapperService,
        private individualService: IndividualService
    ) {}

    @Post('individualBySession')
    async fetchIndividualWithSession(@Body() body: ClientSessionDTO) {
        let session = await this.sessionService.findClientSessionByIndividualId(body.individualId);
        if (!session) return { success: false, message: 'Session expired'}

        let individual = await this.individualService.findIndividualById(body.individualId);
        if (!individual) return { success: false, message: 'Unable to local individual' };
        return { success: true, data: this.individualMapper.entityToIndividualDTO(individual) }
    }
}
