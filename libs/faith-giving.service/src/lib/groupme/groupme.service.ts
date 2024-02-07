import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GroupMeConstant } from './groupme.constant';
import { v4 as uuidv4 } from 'uuid';
import { HttpService } from '@nestjs/axios';
import { EMPTY, catchError, lastValueFrom } from 'rxjs';
import * as Sentry from '@sentry/node';

@Injectable()
export class GroupmeService {

    get baseUrl() { return GroupMeConstant.GROUPME_BASE; }
    get groupUrl() { return GroupMeConstant.GROUP_URL; }
    get messageUrl() { return GroupMeConstant.MESSAGE_URL; }

    get groupmeToken() { return this.configService.get<string>('GROUPME_TOKEN'); }
    get groupId() { return this.configService.get<string>('GROUP_ID'); }

    constructor(
        private configService: ConfigService,
        private httpService: HttpService,
    ) {

    }

    async sendMessageToGroup(msg: string) {
        const url = `${this.baseUrl}${this.groupUrl}${this.groupId}/${this.messageUrl}?token=${this.groupmeToken}`;
        return await lastValueFrom(
            this.httpService.post(url, this.generateBody(msg)).pipe(
                catchError((error) => {
                    Sentry.captureException(error);
                    Logger.error(error);
                    return EMPTY;
                })
            )
        );
    }

    private generateBody(msg: string) {
        return {
            "message": {
              "source_guid": uuidv4(),
              "text": msg,
              "attachments": []
            }
          }
    }
}
