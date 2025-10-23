import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeHistoryTable1756670780050 implements MigrationInterface {
  name = 'ChangeHistoryTable1756670780050';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_status_history" DROP COLUMN "changedByUserId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_status_history" ADD "changedByUserId" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_status_history" DROP COLUMN "changedByUserId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_status_history" ADD "changedByUserId" uuid`,
    );
  }
}
