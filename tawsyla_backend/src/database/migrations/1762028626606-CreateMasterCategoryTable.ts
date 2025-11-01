import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMasterCategoryTable1762028626606
  implements MigrationInterface
{
  name = 'CreateMasterCategoryTable1762028626606';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "master_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nameEn" character varying(255) NOT NULL, "nameAr" character varying(255) NOT NULL, "descriptionEn" text, "descriptionAr" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "imageId" uuid, CONSTRAINT "REL_f9275cd1aa3784ecf342c8d92b" UNIQUE ("imageId"), CONSTRAINT "PK_1febc7cec6abad976b21995a32e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "masterCategoryId" uuid`,
    );
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "fullPath"`);
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "fullPath" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_categories" ADD CONSTRAINT "FK_f9275cd1aa3784ecf342c8d92b3" FOREIGN KEY ("imageId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_fb99c508f927712d5e2fe627eac" FOREIGN KEY ("masterCategoryId") REFERENCES "master_categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_fb99c508f927712d5e2fe627eac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "master_categories" DROP CONSTRAINT "FK_f9275cd1aa3784ecf342c8d92b3"`,
    );
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "fullPath"`);
    await queryRunner.query(
      `ALTER TABLE "categories" ADD "fullPath" character varying(500)`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP COLUMN "masterCategoryId"`,
    );
    await queryRunner.query(`DROP TABLE "master_categories"`);
  }
}
