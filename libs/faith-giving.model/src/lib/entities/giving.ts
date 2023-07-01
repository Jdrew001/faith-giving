import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
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

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at: Date;

    @OneToMany(() => Offering, (offering) => offering.giving, {
        cascade: true
    })
    offerings: Array<Offering>;
}