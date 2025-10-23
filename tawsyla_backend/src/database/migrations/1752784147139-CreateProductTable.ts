import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductTable1752784147139 implements MigrationInterface {
  name = 'CreateProductTable1752784147139';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."products_type_enum" AS ENUM('food', 'electronics', 'clothing', 'pharmacy', 'grocery', 'other')`,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nameEn" character varying(100) NOT NULL, "nameAr" character varying(100) NOT NULL, "type" "public"."products_type_enum" NOT NULL DEFAULT 'other', "descriptionEn" text, "descriptionAr" text, "price" numeric(10,2) NOT NULL, "stock" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "rating" numeric(3,2) NOT NULL DEFAULT '0', "companyId" uuid NOT NULL, "imageId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_e8c788030f2c88cbccf6965328" UNIQUE ("imageId"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_47942e65af8e4235d4045515f05" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_e8c788030f2c88cbccf6965328c" FOREIGN KEY ("imageId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_e8c788030f2c88cbccf6965328c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_47942e65af8e4235d4045515f05"`,
    );
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TYPE "public"."products_type_enum"`);
  }
}
