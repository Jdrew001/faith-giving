import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Offering {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    amount: number;

    @Column()
    type: string;

    @Column({
        nullable: true
    })
    other: string;
}