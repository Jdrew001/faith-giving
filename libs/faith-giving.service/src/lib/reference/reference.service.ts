import { OfferingType } from '@faith-giving/faith-giving.model';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ReferenceService {

    constructor(
        @InjectRepository(OfferingType) private offeringTypeRepo: Repository<OfferingType>
    ) {}

    async findAll(): Promise<Array<OfferingType>> {
        let offeringTypes;
        try {
            offeringTypes = await this.offeringTypeRepo.find();
        } catch (error) {
            Logger.error(`Error getting documents: ${error}`);
            throw new BadRequestException('An error occurred', { cause: new Error(), description: 'error retrieving reference data' })
        }
        return offeringTypes.sort((a, b) => a.id - b.id);
    }
}
