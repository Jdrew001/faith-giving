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

    async findIndividualByPhone(phone: string) {
        let result;
        try {
            const normalizedInput = phone.replace(/\D/g, '');
            const localInput = normalizedInput.length === 11 && normalizedInput.startsWith('1')
                ? normalizedInput.substring(1)
                : normalizedInput;

            result = await this.individualRepo
                .createQueryBuilder('individual')
                .where('individual.phone = :phone', { phone })
                .orWhere('regexp_replace(individual.phone, :pattern, :replacement, :flags) = :normalizedInput', {
                    pattern: '[^0-9]',
                    replacement: '',
                    flags: 'g',
                    normalizedInput
                })
                .orWhere('regexp_replace(individual.phone, :pattern, :replacement, :flags) = :localInput', {
                    pattern: '[^0-9]',
                    replacement: '',
                    flags: 'g',
                    localInput
                })
                .getOne();
        } catch (error) {
            Logger.error(`Find individual by phone error, ${error}`);
            Sentry.captureException(`Find Individual by phone failed: ${error}`);
            throw new BadRequestException('An error occurred', { cause: error, description: AppConstants.GENERIC_ERROR });
        }
        return result;
    }

    async updateProfile(id: string, data: { firstname: string; lastname: string; email: string; phone: string }) {
        let result;
        try {
            const individual = await this.individualRepo.findOneBy({ id });
            if (!individual) {
                throw new BadRequestException('Individual not found');
            }

            individual.firstname = data.firstname;
            individual.lastname = data.lastname;
            individual.email = data.email;
            individual.phone = data.phone;

            result = await this.individualRepo.save(individual);
        } catch (error) {
            Logger.error(`Update profile error, ${error}`);
            Sentry.captureException(`Update profile failed: ${error}`);
            throw new BadRequestException('An error occurred', { cause: error, description: AppConstants.GENERIC_ERROR });
        }
        return result;
    }
}
