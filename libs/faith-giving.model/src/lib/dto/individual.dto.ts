export class PaymentMethodDTO {
    id: string;
    paymentMethodId: string;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
}

export class IndividualDTO {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    paymentMethods?: PaymentMethodDTO[];
}