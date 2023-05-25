export class GivingEntity {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    tithe: number;
    offerings: OfferingEntity[];
    feeCovered: boolean;
    createdAt: Date = new Date();
    updateAt: Date;

    constructor(
        email: string,
        firstName: string,
        lastName: string,
        phone: string,
        tithe: number,
        offerings: OfferingEntity[],
        feeCovered: boolean
    ) {
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.tithe = tithe;
        this.offerings = offerings;
        this.feeCovered = feeCovered;
    }
}

export interface OfferingEntity {
    amount: number;
    category: number; 
}