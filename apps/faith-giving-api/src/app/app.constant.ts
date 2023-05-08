import { EmailJSON } from "./services/email/email.model";

export class AppConstants {
    public static OFFERINGS_REFERENCE_PATH = 'reference/offeringCategories';
    public static GIVING_PATH = 'giving';
    public static APP_PATH = 'app';
    public static SENDGRID_EMAIL_SENDER: EmailJSON = {name: 'Admin', email: 'faithtabernacleupcarlington@gmail.com'} 
}