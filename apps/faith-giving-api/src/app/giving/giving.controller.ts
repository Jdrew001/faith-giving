import { Body, Controller, Post } from '@nestjs/common';
import { GivingService } from '@faith-giving/faith-giving.service';
import { CalulateTotalDto, PaymentDTO } from '@faith-giving/faith-giving.model';
import { ClientSessionService } from 'libs/faith-giving.service/src/lib/client-session/client-session.service';
import { ClientSessionMapperService } from '@faith-giving/faith-giving.mapper';

@Controller('giving')
export class GivingController {

    constructor(
        private givingService: GivingService,
        private clientSessionService: ClientSessionService,
        private clientSessionMapper: ClientSessionMapperService
    ) {}

    @Post("submitPayment")
    async submitPayment(@Body() body: PaymentDTO) {
        let givingResult = await this.givingService.submitPayment(body);
        let individual = givingResult.individual;

        let session = await this.clientSessionService.saveNewClientSession(individual.email);   
        return { success: true, message: "Payment submitted successfully", data: this.clientSessionMapper.mapEntityToDTO(session) ?? null }
    }

    @Post("calculateTotal")
    calculateTotal(@Body() body: CalulateTotalDto) {
        return { success: true, data: this.givingService.calculateTotal(body) }
    }
}
