import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Giving } from "./giving";

@Entity()
export class Offering {

    @PrimaryGeneratedColumn("uuid")
    id?: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column()
    type: number;

    @Column({
        nullable: true
    })
    other?: string;

    @ManyToOne(() => Giving, (giving) => giving.offerings)
    giving?: Giving;
}