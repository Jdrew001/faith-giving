import { MigrationInterface, QueryRunner } from "typeorm"

export class TestingMigration1687816537934 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`
            INSERT into role (id)
            values (4);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
