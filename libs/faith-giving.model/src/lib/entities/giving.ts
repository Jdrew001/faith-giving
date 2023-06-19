import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Individual } from "./individual";
import { Offering } from "./offering";

@Entity()
export class Giving {
    
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    tithe: number;

    @ManyToOne(() => Individual, (individual) => individual.givings)
    individual: Individual;

    @OneToMany(() => Offering, (offering) => offering.giving)
    offerings: Array<Offering>;
}