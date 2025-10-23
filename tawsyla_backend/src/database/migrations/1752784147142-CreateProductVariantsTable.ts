import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductVariantsTable1752784147142
  implements MigrationInterface
{
  name = 'CreateProductVariantsTable1752784147142';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create size unit enum
    await queryRunner.query(
      `CREATE TYPE "public"."product_variants_sizeunit_enum" AS ENUM('small', 'medium', 'large', 'xl', 'xxl', 'custom')`,
    );

    // Create weight unit enum
    await queryRunner.query(
      `CREATE TYPE "public"."product_variants_weightunit_enum" AS ENUM('g', 'kg', 'lb', 'oz')`,
    );

    // Create product_variants table
    await queryRunner.query(
      `CREATE TABLE "product_variants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "productId" uuid NOT NULL, "size" character varying(50), "sizeUnit" "public"."product_variants_sizeunit_enum", "weight" numeric(8,2), "weightUnit" "public"."product_variants_weightunit_enum", "ean" character varying(50) NOT NULL, "price" numeric(10,2) NOT NULL, "stock" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "sku" character varying(100), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_product_variants_ean" UNIQUE ("ean"), CONSTRAINT "PK_product_variants" PRIMARY KEY ("id"))`,
    );

    // Add foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD CONSTRAINT "FK_product_variants_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // Remove price and stock columns from products table
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "price"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "stock"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back price and stock columns to products table
    await queryRunner.query(
      `ALTER TABLE "products" ADD "price" numeric(10,2) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD "stock" integer NOT NULL DEFAULT '0'`,
    );

    // Drop foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "product_variants" DROP CONSTRAINT "FK_product_variants_product"`,
    );

    // Drop product_variants table
    await queryRunner.query(`DROP TABLE "product_variants"`);

    // Drop enums
    await queryRunner.query(
      `DROP TYPE "public"."product_variants_weightunit_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."product_variants_sizeunit_enum"`,
    );
  }
}
