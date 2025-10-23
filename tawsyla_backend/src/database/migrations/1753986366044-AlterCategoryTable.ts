import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterCategoryTable1753986366044 implements MigrationInterface {
  name = 'AlterCategoryTable1753986366044';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" DROP COLUMN "description"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "descriptionEn" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "descriptionAr" text`,
    );
    await queryRunner.query(`ALTER TABLE "categories" ADD "imageId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "UQ_fcb2e05575ea73809a8ff82fa1d" UNIQUE ("imageId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_fcb2e05575ea73809a8ff82fa1d" FOREIGN KEY ("imageId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_fcb2e05575ea73809a8ff82fa1d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "UQ_fcb2e05575ea73809a8ff82fa1d"`,
    );
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "imageId"`);
    await queryRunner.query(
      `ALTER TABLE "categories" DROP COLUMN "descriptionAr"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP COLUMN "descriptionEn"`,
    );
    await queryRunner.query(`ALTER TABLE "categories" ADD "description" text`);
  }
}
