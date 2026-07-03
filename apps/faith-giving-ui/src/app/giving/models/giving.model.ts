export interface PaymentIntent {
    id: string;
    clientSecret: string;
}

export interface PaymentMethod {
    id: string;
    paymentMethodId: string;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
}

export interface UserDetails {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    paymentMethods?: PaymentMethod[];
}