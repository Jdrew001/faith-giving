import { MigrationInterface, QueryRunner, Table } from "typeorm"

export class CreateOtpCodeTable1751500000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "otp_code",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "phone",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "code",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "expiresAt",
                        type: "timestamp",
                        isNullable: false,
                    },
                    {
                        name: "used",
                        type: "boolean",
                        default: false,
                        isNullable: false,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP(6)",
                    },
                ],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("otp_code");
    }
}
