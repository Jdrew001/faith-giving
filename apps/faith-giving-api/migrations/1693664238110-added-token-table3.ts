import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class AddedTokenTable31693664238110 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('token');
        await queryRunner.createTable(
            new Table({
                name: 'token',
                columns: [
                    {
                        name: 'accessToken',
                        type: "text",
                        isPrimary: true
                    },
                    {
                        name: 'refreshToken',
                        type: 'varchar'
                    }
                ]
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
