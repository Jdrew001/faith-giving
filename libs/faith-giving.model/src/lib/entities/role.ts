import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Role {

    @PrimaryColumn()
    id: number;

    @Column()
    name: RoleName;
}

export enum RoleName {
    Admin,
    Viewer
}