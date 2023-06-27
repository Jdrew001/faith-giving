import { MigrationInterface, QueryRunner } from "typeorm"

export class AddRoleName1687833339946 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`
            ALTER TABLE role
            ADD COLUMN name VARCHAR(255);        
        `);

        queryRunner.query(`
            UPDATE role
            SET name = 'ADMIN'
            WHERE id = 0;     
        `);

        queryRunner.query(`
            UPDATE role
            SET name = 'VIEWER'
            WHERE id = 1;     
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
