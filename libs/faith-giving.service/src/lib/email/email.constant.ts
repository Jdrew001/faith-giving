import { EmailJSON } from "@faith-giving/faith-giving.model";

export class EmailConstant {
    public static HELLO_WORLD_TEMPLATE = 'd-dd683b51061d43bdbff208fd08b91428';
    public static SEND_GRID_URL = 'https://api.sendgrid.com/v3/mail/send';
    public static GIVING_REPORT = 'd-cfb29777cf724dbd830bc304cf00b803';
    public static GREETING_TEMPLATE = 'd-dd2115bd57084abd9282b86b937e154b';
    public static GIVING_REPORT_SUBJECT = 'New Giving Report';
    public static GIVING_RECIEPT_SUBJECT = 'Thank you for Giving';
    public static GREETING_SUBJECT = 'Welcome! We are so glad you joined us';
    public static GIVING_RECIEPT_TEMPLATE = 'd-c1ac8bb281e64c97b73d1bc38394b3b5';
    public static SENDGRID_EMAIL_SENDER: EmailJSON = {name: 'Faith Tabernacle', email: 'faithtabernacle@discoverfaitharlington.org'} 
}