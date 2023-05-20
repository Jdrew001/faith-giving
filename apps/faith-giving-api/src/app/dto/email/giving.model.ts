import { Utils } from "../../utils/util";

export class GivingReportDto {

    firstname: string;
    lastname: string;
    date: string;
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
        this.date = Utils.formatDate(new Date());
    }
}

export class GivingReceipt {
    firstname: string;
    lastname: string;
    tithing: string;
    offerings: Array<{label: string, amount: number}>;
    feeCovered: boolean;
    total: string;
    date: string;

    constructor(
        firstname: string,
        lastname: string,
        tithing: string,
        offerings: Array<{label: string, amount: number}>,
        feeCovered: boolean,
        total: string
    ) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.tithing = tithing;
        this.offerings = offerings;
        this.feeCovered = feeCovered;
        this.total = total;
        this.date = Utils.formatDate(new Date());
    }
}