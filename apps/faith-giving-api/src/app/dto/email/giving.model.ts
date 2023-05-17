export class GivingReportDto {

    private firstname: string;
    private lastname: string
    private email: string;
    private phone: string;
    private tithing: string;
    private offerings: Array<{label: string, amount: string}>;
    private feeCovered: boolean;
    private total: string;

    constructor(
        firstname: string,
        lastname: string,
        email: string,
        phone: string,
        tithing: string,
        offerings: Array<{label: string, amount: string}>,
        feeCovered: boolean,
        total: string
    ) {
        this.email = email;
        this.phone = phone;
        this.tithing = tithing;
        this.offerings = offerings;
        this.feeCovered = feeCovered;
        this.total = total;
    }
}