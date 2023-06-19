import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Individual } from "./individual";

@Entity()
export class Giving {
    
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    tithe: number;

    @ManyToOne(() => Individual, (individual) => individual.givings)
    individual: Individual;
}