import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Role {

    @PrimaryColumn()
    id: RoleName;
}

export enum RoleName {
    Admin,
    Viewer
}