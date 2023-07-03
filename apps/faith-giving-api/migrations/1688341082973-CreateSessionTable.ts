import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm"

export class CreateSessionTable1688341082973 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create client_session table
        await queryRunner.createTable(
            new Table({
                name: "client_session",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP(6)",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP(6)",
                        onUpdate: "CURRENT_TIMESTAMP(6)",
                    },
                    {
                        name: "individualId",
                        type: "uuid",
                        isNullable: false,
                    },
                ],
            })
        );

        await queryRunner.createForeignKey(
            "client_session",
            new TableForeignKey({
                columnNames: ["individualId"],
                referencedTableName: "individual",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
