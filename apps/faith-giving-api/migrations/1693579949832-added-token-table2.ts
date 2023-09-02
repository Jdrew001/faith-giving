import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class AddedTokenTable21693579949832 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "token",
                columns: [
                    {
                        name: "accessToken",
                        type: "text"
                    },
                    {
                        name: "refreshToken",
                        type: "varchar"
                    }
                ]
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
