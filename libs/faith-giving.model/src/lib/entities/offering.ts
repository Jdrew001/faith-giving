import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
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

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    public created_at?: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    public updated_at?: Date;


    @ManyToOne(() => Giving, (giving) => giving.offerings)
    giving?: Giving;
}