import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Role } from './role';

@Entity()
export class User {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    email: string;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column()
    phonenumber: string;

    @ManyToMany(() => Role, {
        cascade: true
    })
    @JoinTable()
    roles: Array<Role>;
}