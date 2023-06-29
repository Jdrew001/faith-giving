import { Individual } from '@faith-giving/faith-giving.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class IndividualService {

    constructor(
        @InjectRepository(Individual) private individualRepo: Repository<Individual>
    ) {}

    findIndividualByEmail(email: string) {
        return this.individualRepo.findOneBy({email: email});
    }
}
