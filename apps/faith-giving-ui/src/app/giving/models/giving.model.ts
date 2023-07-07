export interface PaymentIntent {
    id: string;
    clientSecret: string;
}

export interface UserDetails {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
}