import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteprevStatus1757101319591 implements MigrationInterface {
  name = 'DeleteprevStatus1757101319591';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_status_history" DROP COLUMN "previousStatus"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."order_status_history_previousstatus_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."order_status_history_previousstatus_enum" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_status_history" ADD "previousStatus" "public"."order_status_history_previousstatus_enum" NOT NULL`,
    );
  }
}
