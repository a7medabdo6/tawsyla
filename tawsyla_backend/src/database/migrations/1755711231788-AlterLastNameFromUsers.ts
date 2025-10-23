import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterLastNameFromUsers1755711231788 implements MigrationInterface {
  name = 'AlterLastNameFromUsers1755711231788';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f0e1b4ecdca13b177e2e3a0613"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastName"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "lastName" character varying`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f0e1b4ecdca13b177e2e3a0613" ON "user" ("lastName") `,
    );
  }
}
