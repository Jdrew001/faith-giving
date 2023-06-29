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
    offerings: OfferingDTO[];
    feeCovered: boolean;
}

export class CalulateTotalDto {
    tithe: number;
    offerings: {amount: number}[];
    feeCovered: boolean;
}

export interface OfferingDTO {
    amount: number;
    category: number;
    other: string;
}