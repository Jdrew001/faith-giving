import { CHLoginRequestModel, ListMemberRequest, MessageModel, Token, TokenData } from '@faith-giving/faith-giving.model';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EMPTY, catchError, lastValueFrom, map } from 'rxjs';
import { CHMeetingConstant } from './chmeeting.constant';
import * as Sentry from '@sentry/node';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailService } from '../email/email.service';
import { EmailConstant } from '../email/email.constant';
import { Cron } from '@nestjs/schedule';
import { TextingService } from '../texting/texting.service';
import { GroupmeService } from '../groupme/groupme.service';
import moment from 'moment';


@Injectable()
export class ChmeetingService {

    get email() { return this.configService.get<string>('CHMEETING_EMAIL'); }
    get password() { return this.configService.get<string>('CHMEETING_PASSWORD')}
    get churchId() { return this.configService.get<string>('CHMEETING_ID'); }

    get adminNumber() { return this.configService.get<string>('ADMIN_NUMBER'); }

    private tokens: Token | null;

    constructor(
        private readonly configService: ConfigService,
        private httpService: HttpService,
        private emailService: EmailService,
        private readonly textService: TextingService,
        private readonly groupMeService: GroupmeService,
        @InjectRepository(Token) private tokenRepo: Repository<Token>
    ) {}

    async handleTokenFetch() {
        this.tokens = (await this.tokenRepo.find())[0];
        if (!this.tokens) {
            this.tokens = await this.loginChMeeting();
            return;
        }

        this.tokens = await this.refreshToken(this.tokens);
    }

    async saveNewToken(data: Token) {
        await this.tokenRepo.clear();
        await this.tokenRepo.save(data);
        return data;
    }

    //login
    async loginChMeeting() {
        const url = `${CHMeetingConstant.BASE_URL}${CHMeetingConstant.LOGIN_URL}`;
        const request: CHLoginRequestModel = {
            UserName: this.email,
            Password: this.password,
            RememberMe: true
        };

        let result = await lastValueFrom(
            this.httpService.post(url, request).pipe(
                map(o => {
                    Logger.log('testing', o.data.ResultData)
                    let jsonString = JSON.parse(o.data.ResultData?.Token);
                    return {
                        accessToken: jsonString['access_token'],
                        refreshToken: jsonString['refresh_token']
                    };
                }),
                catchError((err) => this.handleError(err, 'login chmeeting'))
            )
        );
        this.saveNewToken(result);
        return result;
    }

    async refreshToken(tokens: Token | null) {
        const url = `${CHMeetingConstant.BASE_URL}${this.churchId}/${CHMeetingConstant.REFRESH_TOKEN}`;
        const request = {
            key: tokens?.refreshToken,
            value: tokens?.accessToken
        };

        let result = await lastValueFrom(
            this.httpService.post(url, request).pipe(
                map(o => {
                    let jsonString = JSON.parse(o.data.ResultData);
                    return {
                        accessToken: jsonString['access_token'],
                        refreshToken: jsonString['refresh_token']
                    };
                }),
                catchError((err) => this.handleError(err, 'CHMeeting RefreshToken'))
            )
        );
        this.saveNewToken(result);
        return result;
    }

    // get new people added to system
    async getNewPeople(): Promise<Array<{CleanedFullName: string, Email: string, Mobile: string, Id: number}>> {
        await this.handleTokenFetch();
        const url = `${CHMeetingConstant.BASE_URL}${this.churchId}/${CHMeetingConstant.LIST_MEMBER}`;
        const request = new ListMemberRequest();
        let result = await lastValueFrom(
            this.httpService.post(url, request, {
                headers: {
                    Authorization: `Bearer ${this.tokens?.accessToken}`,
                    'Content-Type': 'application/json'
                }
            }).pipe(
                catchError((err) => this.handleError(err, 'CHMeeting getNewPeople'))
            )
        );

        return result.data['Data'];
    }

    async sendChMeetingText(message: string, numbers: number[]) {
        await this.handleTokenFetch();
        const url = `${CHMeetingConstant.BASE_URL}${this.churchId}/${CHMeetingConstant.SEND_SMS}`;
        const request = new MessageModel(message, numbers.map(o => ({MemberId: o})));
        return await lastValueFrom(
            this.httpService.post(url, request, {
                headers: {
                    Authorization: `Bearer ${this.tokens?.accessToken}`,
                    'Content-Type': 'application/json'
                }
            }).pipe(
                catchError((err) => this.handleError(err, 'CHMeeting Send CHMeeting Sms'))
            )
        ) as {Type: 'string', Message: 'string'};
    }

//     async getPeopleAddedTwoWeeks(): Promise<Array<{CleanedFullName: string, Email: string, Mobile: string}>> {
//         await this.handleTokenFetch();
//         const url = `${CHMeetingConstant.BASE_URL}${this.churchId}/${CHMeetingConstant.LIST_MEMBER}`;
//         const request = new ListMemberRequest();
//         request.CreatedSinceDays = null as any;
//         request.CreationDateTo =  

//         CreationDateFrom
// : 
// "2024-01-23T00:00"
// CreationDateTo
// : 
// "2024-01-29T00:00"
//     }

    @Cron('30 21 * * 3')
    //@Cron('45 * * * * *') //every 45 seconds -- testing
    async sendGreetingToGuestsWednesday() {
        const newPeople = await this.getNewPeople();
        Logger.log('sending', newPeople);
        newPeople.forEach(async item => {
            this.sendChMeetingText(`Hi ${this.capitalizeWords(item.CleanedFullName)}, ${CHMeetingConstant.WELCOME_TEXT}`, [item.Id]);
            await this.sendWelcomeEmail(item);
            await this.groupMeService.sendMessageToGroup(
                `Welcome Text/Email sent\n${this.capitalizeWords(item.CleanedFullName)}\n${item.Mobile}\n${item.Email}`
            );
        });
    }

    @Cron('35 14 * * 0')
    //@Cron('45 * * * * *') //every 45 seconds -- testing
    async sendGreetingToGuestsSunday() {
        const newPeople = await this.getNewPeople();
        Logger.log('sending for sunday', newPeople);
        newPeople.forEach(async item => {
            this.sendChMeetingText(`Hi ${this.capitalizeWords(item.CleanedFullName)}, ${CHMeetingConstant.WELCOME_TEXT}`, [item.Id]);
            await this.sendWelcomeEmail(item);
            await this.groupMeService.sendMessageToGroup(
                `Welcome Text/Email sent\n${this.capitalizeWords(item.CleanedFullName)}\n${item.Mobile}\n${item.Email}`
            );
        });
    }

    private async sendWelcomeEmail(data:{
        CleanedFullName: string;
        Email: string;
        Mobile: string;
    }) {
        try {
            if (data?.Email === null) return;
            Logger.log('Sending Greeting to Guests - Email', new Date(), new Date().getTime());
            this.emailService.sendEmailToTemplate(data.Email, EmailConstant.GREETING_SUBJECT, EmailConstant.GREETING_TEMPLATE, {fullName: this.capitalizeWords(data.CleanedFullName)});
        } catch (err) {
            Logger.log('ERROR: Cron Job Send Greeting Email to Guests');
            Sentry.captureException('ERROR: Cron Job Send Greeting Email To Guests');
            throw err;
        }
    }

    private capitalizeWords(str: string) {
        return str
            .split(' ') // Split the string into an array of words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word and make the rest lowercase
            .join(' '); // Join the words back into a string
    }

    private handleError(err: any, method: string) {
        Logger.log('ERROR: ', err);
        Sentry.captureException(`ERROR - ${method}: ${err}`);
        throw err;

        return EMPTY;
    }
}
