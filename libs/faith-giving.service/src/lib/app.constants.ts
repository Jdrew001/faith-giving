import { EmailJSON } from "@faith-giving/faith-giving.model";

export class AppConstants {
    public static OFFERINGS_REFERENCE_PATH = 'reference/offeringCategories';
    public static GIVING_PATH = 'giving';
    public static APP_PATH = 'app';
    public static SENDGRID_EMAIL_SENDER: EmailJSON = {name: 'Faith Giving', email: 'faithgiving@discoverfaitharlington.org'} 

    public static CARD_ERROR_MESSAGES: ErrorMessages = {
        "card_declined": "Oops, looks like your card was declined",
        "expired_card": "Oops, looks like your card is expired",
        "incorrect_cvc": "Oops, looks like your CVC is incorrect",
        "processing_error": "Oops, there was an error processing your card",
        "incorrect_number": "Oops, looks like your card number was incorrect"
    }
}

interface ErrorMessages {
    [key: string]: string;
}