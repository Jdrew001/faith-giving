import { Body, Controller, Post } from '@nestjs/common';
import { GivingService } from '@faith-giving/faith-giving.service';
import { CalulateTotalDto, PaymentDTO } from '@faith-giving/faith-giving.model';

@Controller('giving')
export class GivingController {

    constructor(
        private givingService: GivingService
    ) {}

    @Post("submitPayment")
    async submitPayment(@Body() body: PaymentDTO) {
        await this.givingService.submitPayment(body);
        return {success: true, message: "Payment submitted successfully"}
    }

    @Post("calculateTotal")
    calculateTotal(@Body() body: CalulateTotalDto) {
        return { success: true, data: this.givingService.calculateTotal(body) }
    }
}
