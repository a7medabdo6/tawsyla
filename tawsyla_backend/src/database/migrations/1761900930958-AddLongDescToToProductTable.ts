import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLongDescToToProductTable1761900930958
  implements MigrationInterface
{
  name = 'AddLongDescToToProductTable1761900930958';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" ADD "longDescriptionEn" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "longDescriptionAr" text`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "nameEn"`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD "nameEn" character varying(150)`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "nameAr"`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD "nameAr" character varying(150)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "nameAr"`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD "nameAr" character varying(100) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "nameEn"`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD "nameEn" character varying(100) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "longDescriptionAr"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP COLUMN "longDescriptionEn"`,
    );
  }
}
