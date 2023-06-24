import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Individual } from "./individual";
import { Offering } from "./offering";

@Entity()
export class Giving {
    
    @PrimaryGeneratedColumn("uuid")
    id?: string;

    @Column('decimal', { precision: 10, scale: 2 })
    tithe: number;

    @Column()
    feeCovered: boolean;

    @ManyToOne(() => Individual, (individual) => individual.givings, {
        cascade: true
    })
    individual: Individual;

    @OneToMany(() => Offering, (offering) => offering.giving, {
        cascade: true
    })
    offerings: Array<Offering>;
}