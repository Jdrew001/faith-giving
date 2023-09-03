import { CHLoginRequestModel, ListMemberRequest, Token, TokenData } from '@faith-giving/faith-giving.model';
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


@Injectable()
export class ChmeetingService {

    get email() { return this.configService.get<string>('CHMEETING_EMAIL'); }
    get password() { return this.configService.get<string>('CHMEETING_PASSWORD')}
    get churchId() { return this.configService.get<string>('CHMEETING_ID'); }

    private tokens: Token | null;

    constructor(
        private readonly configService: ConfigService,
        private httpService: HttpService,
        private emailService: EmailService,
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
    async getNewPeople(): Promise<Array<{CleanedFullName: string, Email: string, Phone: string}>> {
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

    //@Cron('30 21 * * 3')
    //@Cron('45 * * * * *') //every 45 seconds -- testing
    async sendGreetingToGuestsWednesday() {
        this.manageEmailToGuest();
    }

    //@Cron('0 14 * * 0')
    @Cron('45 * * * * *') //every 45 seconds -- testing
    async sendGreetingToGuestsSunday() {
       this.manageEmailToGuest();
    }

    private async manageEmailToGuest() {
        try {
            Logger.log('Sending Greeting to Guests', new Date(), new Date().getTime());
            const guests = await this.getNewPeople();
            guests.forEach(item => {
                Logger.log(item);
                //this.emailService.sendEmailToTemplate(item.Email, EmailConstant.GREETING_SUBJECT, EmailConstant.GREETING_TEMPLATE, {fullName: item.CleanedFullName});
            });
        } catch (err) {
            Logger.log('ERROR: Cron Job Send Greeting to Guests');
            Sentry.captureException('ERROR: Cron Job Send Greeting To Guests');
        }
    }

    private handleError(err: any, method: string) {
        Logger.log('ERROR: ', err);
        Sentry.captureException(`ERROR - ${method}: ${err}`);
        return EMPTY;
    }
}
