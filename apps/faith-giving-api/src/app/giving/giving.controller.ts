import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreatePaymentIntentDto } from '../dto/giving/create-payment-intent.dto';
import { GivingService } from './giving.service';
import { PaymentDTO } from '../dto/giving/payment.dto';
import { EmailService } from '../services/email/email.service';
import { EmailConstant } from '../services/email/email.constant';

@Controller('giving')
export class GivingController {

    constructor(
        private givingService: GivingService,
        private emailService: EmailService
    ) {}

    @Get("getGivingInformationForUser/:email")
    async getGivingInformationForUser(@Param('email') email: string) {
        if (!email) throw new BadRequestException('An error occurred', { cause: new Error(), description: 'email required' });
        return this.givingService.getGivingInformationForUser(email);
    }

    @Post("createPaymentIntent")
    createPaymentIntent(@Body() body: CreatePaymentIntentDto) {
        return this.givingService.createPaymentIntent(body);
    }

    @Post("submitPayment")
    async submitPayment(@Body() body: PaymentDTO) {
        await this.givingService.submitPayment(body);
        return {success: true, message: "Payment submitted successfully"}
    }

    @Get("test")
    async test() {
        const result = await this.emailService.sendEmailToTemplate<{name: string}>(
            'dtatkison@gmail.com',
            EmailConstant.HELLO_WORLD_TEMPLATE,
            {name: "Drew Atkison"})
        if (result?.status == 202) {
            return {success: true, message: "Email sent successfully"}
        } else {
            return {success: false, message: "Email failed to send"}
        }
    }
}
