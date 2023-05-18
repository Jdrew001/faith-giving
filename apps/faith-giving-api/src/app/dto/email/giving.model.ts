export class GivingReportDto {

    firstname: string;
    lastname: string
    email: string;
    phone: string;
    tithing: string;
    offerings: Array<{label: string, amount: number}>;
    feeCovered: boolean;
    total: string;

    constructor(
        firstname: string,
        lastname: string,
        email: string,
        phone: string,
        tithing: string,
        offerings: Array<{label: string, amount: number}>,
        feeCovered: boolean,
        total: string
    ) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.phone = phone;
        this.tithing = tithing;
        this.offerings = offerings;
        this.feeCovered = feeCovered;
        this.total = total;
    }
}