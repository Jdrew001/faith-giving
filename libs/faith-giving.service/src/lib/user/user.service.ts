import { User } from '@faith-giving/faith-giving.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
    
    constructor(
        @InjectRepository(User) private usersRepository: Repository<User>
    ) {}

    findAll(): Promise<Array<User>> {
        return this.usersRepository.find();
    }

    findAdmins(): Promise<Array<User>> {
        return this.usersRepository
            .createQueryBuilder('user')
            .innerJoin('user.roles', 'role')
            .where('role.id = :roleId', { roleId: 0 })
            .getMany();
    }
}
