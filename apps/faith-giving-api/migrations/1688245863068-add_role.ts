import { MigrationInterface, QueryRunner } from "typeorm"

export class AddRole1688245863068 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`
        insert into role (id, name)
            values (3, 'TESTER');
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
