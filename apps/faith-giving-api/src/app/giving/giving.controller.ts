import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GivingService } from './giving.service';
import { CalulateTotalDto, PaymentDTO } from '../dto/giving/payment.dto';
import { EmailService } from '../services/email/email.service';

@Controller('giving')
export class GivingController {

    constructor(
        private givingService: GivingService
    ) {}

    @Get("getGivingInformationForUser/:email")
    async getGivingInformationForUser(@Param('email') email: string) {
        if (!email) throw new BadRequestException('An error occurred', { cause: new Error(), description: 'email required' });
        return this.givingService.getGivingInformationForUser(email);
    }

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
