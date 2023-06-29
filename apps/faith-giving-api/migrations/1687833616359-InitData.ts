import { MigrationInterface, QueryRunner } from "typeorm"

export class InitData1687833616359 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`
            -- Ref Data --
            insert into offering_type (id, label, disabled, "activeInd")
                values (1, 'General Offering', false, 'A');
        
            insert into offering_type (id, label, disabled, "activeInd")
                values (2, 'Move the Mission', false, 'A');
            
            insert into offering_type (id, label, disabled, "activeInd")
                values (3, 'Foreign Missions', false, 'A');
            
            insert into offering_type (id, label, disabled, "activeInd")
                values (4, 'Building Fund', false, 'A');
            
            insert into offering_type (id, label, disabled, "activeInd")
                values (5, 'Home Missions', false, 'A');
            
            insert into offering_type (id, label, disabled, "activeInd")
                values (6, 'Youth Ministry', false, 'A');
            
            insert into offering_type (id, label, disabled, "activeInd")
                values (7, 'Other', false, 'A');

            -- Role Data Additions
            insert into role (id, name)
                values (0, 'ADMIN');
            
            insert into role (id, name)
                values (1, 'VIEWER');

            insert into "user" (id, email, firstname, lastname, phonenumber)
                values ('be7b7910-0e52-11ee-be56-0242ac120002', 'dtatkison@gmail.com', 'Drew', 'Atkison', '6824140386');
            
            insert into "user" (id, email, firstname, lastname, phonenumber)
                values ('39ba9030-9859-4621-803c-c3ebac4feb29', 'elatkison@gmail.com', 'Elizabeth', 'Atkison', '8177186462');
            
            insert into user_roles_role ("userId", "roleId")
                values ('be7b7910-0e52-11ee-be56-0242ac120002', 0);
            
            insert into user_roles_role ("userId", "roleId")
                values ('39ba9030-9859-4621-803c-c3ebac4feb29', 1);
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
