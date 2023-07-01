import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class UpdatedAtCreatedAt1688254236308 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'giving',
            new TableColumn({
              name: 'created_at',
              type: 'timestamp',
              precision: 6,
              default: 'CURRENT_TIMESTAMP(6)',
            })
        );
      
          // Add the updated_at column
        await queryRunner.addColumn(
            'giving',
            new TableColumn({
              name: 'updated_at',
              type: 'timestamp',
              precision: 6,
              default: 'CURRENT_TIMESTAMP(6)',
            })
        );

        await queryRunner.addColumn(
            'offering',
            new TableColumn({
              name: 'created_at',
              type: 'timestamp',
              precision: 6,
              default: 'CURRENT_TIMESTAMP(6)',
            })
        );
      
          // Add the updated_at column
        await queryRunner.addColumn(
            'offering',
            new TableColumn({
              name: 'updated_at',
              type: 'timestamp',
              precision: 6,
              default: 'CURRENT_TIMESTAMP(6)',
            })
        );

        await queryRunner.addColumn(
            'individual',
            new TableColumn({
              name: 'created_at',
              type: 'timestamp',
              precision: 6,
              default: 'CURRENT_TIMESTAMP(6)',
            })
        );
      
          // Add the updated_at column
        await queryRunner.addColumn(
            'individual',
            new TableColumn({
              name: 'updated_at',
              type: 'timestamp',
              precision: 6,
              default: 'CURRENT_TIMESTAMP(6)',
            })
        );

        await queryRunner.addColumn(
            'payment_method',
            new TableColumn({
              name: 'created_at',
              type: 'timestamp',
              precision: 6,
              default: 'CURRENT_TIMESTAMP(6)',
            })
        );
      
          // Add the updated_at column
        await queryRunner.addColumn(
            'payment_method',
            new TableColumn({
              name: 'updated_at',
              type: 'timestamp',
              precision: 6,
              default: 'CURRENT_TIMESTAMP(6)',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
