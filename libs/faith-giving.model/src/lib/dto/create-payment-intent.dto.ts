import { Offering } from "../entities/offering";

export interface CreatePaymentIntentDto {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    tithe: number;
    offerings: Offering[];
    feeCovered: boolean;
}