import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBannerTable1755880976103 implements MigrationInterface {
  name = 'CreateBannerTable1755880976103';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "banners" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nameEn" character varying(100) NOT NULL, "nameAr" character varying(100) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "imageId" uuid, CONSTRAINT "REL_b03e36e12f64dc9d6612446aef" UNIQUE ("imageId"), CONSTRAINT "PK_e9b186b959296fcb940790d31c3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "banners" ADD CONSTRAINT "FK_b03e36e12f64dc9d6612446aef1" FOREIGN KEY ("imageId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "banners" DROP CONSTRAINT "FK_b03e36e12f64dc9d6612446aef1"`,
    );
    await queryRunner.query(`DROP TABLE "banners"`);
  }
}
