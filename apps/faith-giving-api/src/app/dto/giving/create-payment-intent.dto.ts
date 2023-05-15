import { ValueLabel } from "../common-dto";

export interface CreatePaymentIntentDto {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    tithe: number;
    offerings: Offering[];
    feeCovered: boolean;
}

export interface Offering {
    amount: number;
    category: number;
}