import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveLevelAndParentFromCategoryTable1762028259784
  implements MigrationInterface
{
  name = 'RemoveLevelAndParentFromCategoryTable1762028259784';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_9a6f051e66982b5f0318981bcaa"`,
    );
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "parentId"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "level"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "level" integer NOT NULL DEFAULT '1'`,
    );
    await queryRunner.query(`ALTER TABLE "categories" ADD "parentId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_9a6f051e66982b5f0318981bcaa" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
