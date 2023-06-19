import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class OfferingType {

    @PrimaryColumn()
    id: number;

    @Column()
    label: string;

    @Column()
    disabled: boolean;

    @Column()
    activeInd: string;
}