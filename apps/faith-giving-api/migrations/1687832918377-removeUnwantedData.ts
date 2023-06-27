import { MigrationInterface, QueryRunner } from "typeorm"

export class RemoveUnwantedData1687832918377 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`
            DELETE FROM role
            WHERE id IN (2, 4);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
