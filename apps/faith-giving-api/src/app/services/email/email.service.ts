import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConstants } from '../../app.constant';
import { EmailTemplate } from './email.model';
import { HttpService } from '@nestjs/axios';
import { EMPTY, catchError, lastValueFrom } from 'rxjs';
import { EmailConstant } from './email.constant';

@Injectable()
export class EmailService {

    constructor(
        private readonly configService: ConfigService,
        private httpService: HttpService
    ) {}

    async sendEmailToTemplate<T extends { [key: string]: string; }>(to: string, subject: string, template: string, templateData?: T) {
        const mail: EmailTemplate = {
            personalizations: [{
                to: [{email: to}],
                dynamic_template_data: templateData ? {...templateData}: null
            }],
            subject: 'Hello World',
            from: AppConstants.SENDGRID_EMAIL_SENDER,
            template_id: template
        }

        return await lastValueFrom(this.httpService.post(EmailConstant.SEND_GRID_URL, mail, {
            headers: {
                Authorization: `Bearer ${this.configService.get<string>('SENDGRID_API_KEY')}`,
                'Content-Type': 'application/json'
            }
        }).pipe(catchError(err => this.handleError(err))));
    }

    private handleError(err: any) {
        Logger.error('Unable to send an email to template', err, new Date());
        return EMPTY;
    }
}
