import { Offering } from "./create-payment-intent.dto";

export interface PaymentDTO {
    paymentMethodId: string;
    giveDetails: GiveDetails;
}

export class GiveDetails {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    tithe: number;
    offerings: Offering[];
    feeCovered: boolean;
}

export class CalulateTotalDto {
    tithe: number;
    offerings: {amount: number}[];
    feeCovered: boolean;
}