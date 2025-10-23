import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderHistory1756669543025 implements MigrationInterface {
  name = 'AddOrderHistory1756669543025';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."order_status_history_previousstatus_enum" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."order_status_history_newstatus_enum" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_status_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderId" uuid NOT NULL, "previousStatus" "public"."order_status_history_previousstatus_enum" NOT NULL, "newStatus" "public"."order_status_history_newstatus_enum" NOT NULL, "notes" text, "changedByUserId" uuid, "changedByUserRole" character varying(100), "changeReason" character varying(50), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e6c66d853f155531985fc4f6ec8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_status_history" ADD CONSTRAINT "FK_689db3835e5550e68d26ca32676" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "order_status_history" DROP CONSTRAINT "FK_689db3835e5550e68d26ca32676"`,
    );
    await queryRunner.query(`DROP TABLE "order_status_history"`);
    await queryRunner.query(
      `DROP TYPE "public"."order_status_history_newstatus_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."order_status_history_previousstatus_enum"`,
    );
  }
}
