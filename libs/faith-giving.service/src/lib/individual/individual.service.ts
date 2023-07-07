import { Individual } from '@faith-giving/faith-giving.model';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as Sentry from '@sentry/node';
import { AppConstants } from '../app.constants';

@Injectable()
export class IndividualService {

    constructor(
        @InjectRepository(Individual) private individualRepo: Repository<Individual>
    ) {}

    async findIndividualByEmail(email: string) {
        let result;
        try {
            result = await this.individualRepo.findOneBy({email: email});
        } catch (error) {
            Logger.error(`Find individual by email error, ${error}`);
            Sentry.captureException(`Find Individual by email failed: ${error}`);
            throw new BadRequestException('An error occurred', { cause: error, description: AppConstants.GENERIC_ERROR });
        }
        return result;
    }

    async findIndividualByNameEmailPhone(data: {firstname: string, lastname: string, email: string, phone: string}) {
        let result;
        try {
            result = await this.individualRepo.findOneBy({
                firstname: data.firstname,
                lastname: data.lastname,
                email: data.email,
                phone: data.phone
            });
        } catch (error) {
            Logger.error(`Find individual by email error, ${error}`);
            Sentry.captureException(`Find Individual by email failed: ${error}`);
            throw new BadRequestException('An error occurred', { cause: error, description: AppConstants.GENERIC_ERROR });
        }
        return result;
    }

    async findIndividualById(id: string) {
        let result;
        try {
            result = await this.individualRepo.findOneBy({id: id});
        } catch (error) {
            Logger.error(`Find individual by id error, ${error}`);
            Sentry.captureException(`Find Individual by id failed: ${error}`);
            throw new BadRequestException('An error occurred', { cause: error, description: AppConstants.GENERIC_ERROR });
        }
        return result;
    }
}
