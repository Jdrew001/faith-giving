import { IndividualMapperService } from '@faith-giving/faith-giving.mapper';
import { ClientSessionDTO } from '@faith-giving/faith-giving.model';
import { Body, Controller, Delete, Get, Param, Put, Req } from '@nestjs/common';
import { ClientSessionService } from 'libs/faith-giving.service/src/lib/client-session/client-session.service';
import { IndividualService } from 'libs/faith-giving.service/src/lib/individual/individual.service';
import { PaymentMethodService } from 'libs/faith-giving.service/src/lib/payment-method/payment-method.service';
import { StripeService } from 'libs/faith-giving.service/src/lib/stripe/stripe.service';
import { Request } from 'express';
import { CryptService } from 'libs/faith-giving.service/src/lib/crypt/crypt.service';

@Controller('individual')
export class IndividualController {

    constructor(
        private sessionService: ClientSessionService,
        private individualMapper: IndividualMapperService,
        private individualService: IndividualService,
        private cryptService: CryptService,
        private paymentMethodService: PaymentMethodService,
        private stripeService: StripeService
    ) {}

    @Get('individualBySession')
    async fetchIndividualWithSession(@Req() request: Request) {
        if (!request.cookies['client_data']) return { success: false, message: 'Session expired' }
        let data = this.cryptService.decrypt(request.cookies['client_data']) as ClientSessionDTO;

        let session = await this.sessionService.findClientSessionByIndividualId(data.individualId);
        if (!session) return { success: false, message: 'Session expired'}

        let individual = await this.individualService.findIndividualById(data.individualId);
        if (!individual) return { success: false, message: 'Unable to local individual' };
        return { success: true, data: this.individualMapper.entityToIndividualDTO(individual) }
    }

    @Put('profile')
    async updateProfile(@Req() request: Request, @Body() body: { firstname: string; lastname: string; email: string; phone: string }) {
        if (!request.cookies['client_data']) return { success: false, message: 'Session expired' }
        let data = this.cryptService.decrypt(request.cookies['client_data']) as ClientSessionDTO;

        let session = await this.sessionService.findClientSessionByIndividualId(data.individualId);
        if (!session) return { success: false, message: 'Session expired' }

        const individual = await this.individualService.updateProfile(data.individualId, body);
        return { success: true, data: this.individualMapper.entityToIndividualDTO(individual) };
    }

    @Get('paymentMethods')
    async getPaymentMethods(@Req() request: Request) {
        if (!request.cookies['client_data']) return { success: false, message: 'Session expired' }
        let data = this.cryptService.decrypt(request.cookies['client_data']) as ClientSessionDTO;

        let session = await this.sessionService.findClientSessionByIndividualId(data.individualId);
        if (!session) return { success: false, message: 'Session expired' }

        const individual = await this.individualService.findIndividualById(data.individualId);
        if (!individual) return { success: false, message: 'Unable to locate individual' };

        let paymentMethods = await this.paymentMethodService.findByIndividualId(data.individualId);

        if (individual.stripeCustomerId) {
            const stripePaymentMethods = await this.stripeService.listPaymentMethods(individual.stripeCustomerId);

            for (const stripePaymentMethod of stripePaymentMethods) {
                const card = stripePaymentMethod.card;
                if (!card) continue;

                await this.paymentMethodService.savePaymentMethod({
                    paymentMethodId: stripePaymentMethod.id,
                    brand: card.brand,
                    last4: card.last4,
                    expMonth: card.exp_month,
                    expYear: card.exp_year,
                    individualId: data.individualId
                });
            }

            paymentMethods = await this.paymentMethodService.findByIndividualId(data.individualId);
        }

        const mappedMethods = paymentMethods.map(pm => this.individualMapper.entityToPaymentMethodDTO(pm));
        return { success: true, data: mappedMethods };
    }

    @Delete('paymentMethods/:id')
    async deletePaymentMethod(@Req() request: Request, @Param('id') id: string) {
        if (!request.cookies['client_data']) return { success: false, message: 'Session expired' }
        let data = this.cryptService.decrypt(request.cookies['client_data']) as ClientSessionDTO;

        let session = await this.sessionService.findClientSessionByIndividualId(data.individualId);
        if (!session) return { success: false, message: 'Session expired' }

        const paymentMethod = await this.paymentMethodService.findByPaymentMethodId(id);
        if (!paymentMethod) return { success: false, message: 'Payment method not found' }

        await this.stripeService.detachPaymentMethod(paymentMethod.paymentMethodId);
        await this.paymentMethodService.deletePaymentMethod(id);

        return { success: true, message: 'Payment method deleted' };
    }
}
