import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
}