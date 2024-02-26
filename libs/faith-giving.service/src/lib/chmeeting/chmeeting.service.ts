import { CHLoginRequestModel, ListMemberRequest, MessageModel, PeopleModel, Token, TokenData } from '@faith-giving/faith-giving.model';
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
    get ApiKey() { return this.configService.get<string>('API_KEY'); }

    private tokens: Token | null;
    private page: number = 1;
    private pageSize: number = 500;

    constructor(
        private readonly configService: ConfigService,
        private httpService: HttpService,
        private emailService: EmailService,
        private readonly textService: TextingService,
        private readonly groupMeService: GroupmeService,
        @InjectRepository(Token) private tokenRepo: Repository<Token>
    ) {}

    async handleTokenFetch() {
        if (!this.tokens) {
            this.tokens = await this.loginChMeeting();
        }
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
                    let jsonString = JSON.parse(o.data.ResultData?.Token);
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
    async getNewPeople(): Promise<Array<PeopleModel>> {
        const url = `${CHMeetingConstant.BASE_URL}api/v1/people?page=${this.page}&page_size=${this.pageSize}`;
        let result = await lastValueFrom(
            this.httpService.get(url, {
                headers: {
                    ApiKey: this.ApiKey,
                    'Content-Type': 'application/json'
                }
            }).pipe(
                catchError((err) => this.handleError(err, 'CHMeeting getNewPeople'))
            )
        );

        return result.data.data as Array<PeopleModel>;
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

    @Cron('30 21 * * 3')
    //@Cron('45 * * * * *') //every 45 seconds -- testing
    async sendGreetingToGuestsWednesday() {
        const newPeople = (await this.getNewPeople()).filter(o => this.filterNewPeople(o.created_on));
        Logger.log('sending', newPeople);
        newPeople.forEach(async item => {
            this.sendChMeetingText(`Hi ${item.first_name}, ${CHMeetingConstant.WELCOME_TEXT}`, [item.id]);
            await this.sendWelcomeEmail(item);
            await this.groupMeService.sendMessageToGroup(
                `Welcome Text/Email sent\n${item.first_name}\n${item.mobile}\n${item.email}`
            );
        });
    }

    @Cron('35 14 * * 0')
    //@Cron('45 * * * * *') //every 45 seconds -- testing
    async sendGreetingToGuestsSunday() {
        const newPeople = (await this.getNewPeople()).filter(o => this.filterNewPeople(o.created_on));
        Logger.log('sending for sunday', newPeople);
        newPeople.forEach(async item => {
            this.sendChMeetingText(`Hi ${item.first_name}, ${CHMeetingConstant.WELCOME_TEXT}`, [item.id]);
            await this.sendWelcomeEmail(item);
            await this.groupMeService.sendMessageToGroup(
                `Welcome Text/Email sent\n${item.first_name}\n${item.mobile}\n${item.email}`
            );
        });
    }

    private async sendWelcomeEmail(data: PeopleModel) {
        try {
            if (data?.email === null) return;
            Logger.log('Sending Greeting to Guests - Email', new Date(), new Date().getTime());
            this.emailService.sendEmailToTemplate(data.email, EmailConstant.GREETING_SUBJECT, EmailConstant.GREETING_TEMPLATE, {fullName: data.first_name});
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

    private filterNewPeople(date: string) {

        // Create Moment objects
        const currentDate = moment(); // Moment object for the current date and time
        const dateToCompare = moment(date); // Moment object for your date variable, parsed including timezone
        const formattedCurrentDate = currentDate.format('YYYY-MM-DD');
        const formattedDateToCompare = dateToCompare.format('YYYY-MM-DD');

        return formattedDateToCompare == formattedCurrentDate;
    }
}
