import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Giving } from "./giving";

@Entity()
export class Individual {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column()
    email: string;

    @Column()
    phone: string;

    @OneToMany(() => Giving, (giving) => giving.individual)
    givings: Array<Giving>;
}