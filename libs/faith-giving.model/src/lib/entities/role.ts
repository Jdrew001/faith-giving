import { Column, Entity, ManyToMany, PrimaryColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class Role {

    @PrimaryColumn()
    id: RoleName;

    @ManyToMany(() => User, user => user.roles)
    users: Array<User>;
}

export enum RoleName {
    Admin,
    Viewer
}