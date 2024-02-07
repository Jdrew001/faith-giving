export interface SelectedId {
    MemberId: number;
}

export class MessageModel {
    CreationDate: string;
    IsScheduled: boolean;
    Message: string;
    SelectedIds: SelectedId[];
    SendDate: string;
    SendFromMobile: boolean;
    Type: number;
    VoiceLength: number;
    RecipientNumbers: string[] | null;
    RecipientNumbersString: string;
    ChurchServiceName: string;
    MemberName: string;
    MembersPasswords: string[] | null;
    Id: number;
    RecipientCount: number;
    SMSTotalCount: number;
    SMSTotalCountString: string;
    Status: number;
    sendTime: string;
    Replies: number;
    Attachment: any | null; // Consider defining a more specific type if possible
    UsersToNotify: number[];

    constructor(
        message: string,
        numbers: SelectedId[]
    ) {
        // Initialize all properties with default values
        this.CreationDate = new Date().toISOString();
        this.IsScheduled = false;
        this.Message = message;
        this.SelectedIds = numbers;
        this.SendDate = this.getSendDate();
        this.SendFromMobile = false;
        this.Type = 1;
        this.VoiceLength = 0;
        this.RecipientNumbers = null;
        this.RecipientNumbersString = "";
        this.ChurchServiceName = "";
        this.MemberName = "";
        this.MembersPasswords = null;
        this.Id = 0;
        this.RecipientCount = 0;
        this.SMSTotalCount = 0;
        this.SMSTotalCountString = "";
        this.Status = 0;
        this.sendTime = new Date().toISOString();
        this.Replies = 0;
        this.Attachment = null;
        this.UsersToNotify = [550517, 550518];
    }

    // Add any methods you need for this class

    getSendDate() {
        // Create a new Date object for the current date and time
        const now = new Date();

        // Extract the year, month, and day from the Date object
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // getMonth() returns 0 for January, 1 for February, etc.
        const day = now.getDate();

        // Format the month and day with leading zeros if necessary
        const formattedMonth = month < 10 ? `0${month}` : month;
        const formattedDay = day < 10 ? `0${day}` : day;

        // Concatenate the components into the desired format
        return `${year}-${formattedMonth}-${formattedDay}`;
    }
}