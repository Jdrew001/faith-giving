import { MigrationInterface, QueryRunner, Table, TableColumn } from "typeorm"

export class AddPaymentMethodsSupport1751500000001 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add stripeCustomerId to individual table
        await queryRunner.addColumn(
            "individual",
            new TableColumn({
                name: "stripeCustomerId",
                type: "varchar",
                isNullable: true,
            })
        );

        // Add paymentMethodId column to payment_method table if it doesn't exist
        const table = await queryRunner.getTable("payment_method");
        if (table) {
            const paymentIdColumn = table.findColumnByName("paymentId");
            const paymentMethodIdColumn = table.findColumnByName("paymentMethodId");

            if (paymentIdColumn && !paymentMethodIdColumn) {
                // Rename existing paymentId to paymentMethodId
                await queryRunner.renameColumn("payment_method", "paymentId", "paymentMethodId");
            } else if (!paymentIdColumn && !paymentMethodIdColumn) {
                // Add paymentMethodId column if neither exists
                await queryRunner.addColumn(
                    "payment_method",
                    new TableColumn({
                        name: "paymentMethodId",
                        type: "varchar",
                        isNullable: true,
                    })
                );
            }
        }

        // Add new columns to payment_method table
        await queryRunner.addColumn(
            "payment_method",
            new TableColumn({
                name: "brand",
                type: "varchar",
                isNullable: true,
            })
        );

        await queryRunner.addColumn(
            "payment_method",
            new TableColumn({
                name: "last4",
                type: "varchar",
                isNullable: true,
            })
        );

        await queryRunner.addColumn(
            "payment_method",
            new TableColumn({
                name: "expMonth",
                type: "integer",
                isNullable: true,
            })
        );

        await queryRunner.addColumn(
            "payment_method",
            new TableColumn({
                name: "expYear",
                type: "integer",
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove columns from payment_method table
        await queryRunner.dropColumn("payment_method", "expYear");
        await queryRunner.dropColumn("payment_method", "expMonth");
        await queryRunner.dropColumn("payment_method", "last4");
        await queryRunner.dropColumn("payment_method", "brand");

        // Rename paymentMethodId back to paymentId (if paymentMethodId exists)
        const table = await queryRunner.getTable("payment_method");
        if (table) {
            const paymentMethodIdColumn = table.findColumnByName("paymentMethodId");
            if (paymentMethodIdColumn) {
                await queryRunner.renameColumn("payment_method", "paymentMethodId", "paymentId");
            }
        }

        // Remove stripeCustomerId from individual table
        await queryRunner.dropColumn("individual", "stripeCustomerId");
    }
}
