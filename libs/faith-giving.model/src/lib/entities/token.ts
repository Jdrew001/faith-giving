import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Token {

    @Column('text')
    @PrimaryColumn()
    accessToken: string;

    @Column('varchar')
    refreshToken: string;
}