import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhoneToUserTable1755882894198 implements MigrationInterface {
  name = 'AddPhoneToUserTable1755882894198';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "phone" character varying`);
    await queryRunner.query(
      `CREATE INDEX "IDX_8e1f623798118e629b46a9e629" ON "user" ("phone") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8e1f623798118e629b46a9e629"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phone"`);
  }
}
