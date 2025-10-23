import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCompanyTable1752774285089 implements MigrationInterface {
  name = 'CreateCompanyTable1752774285089';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."companies_type_enum" AS ENUM('restaurant', 'grocery', 'pharmacy', 'electronics', 'clothing', 'general_store', 'other')`,
    );
    await queryRunner.query(
      `CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nameEn" character varying(100) NOT NULL, "nameAr" character varying(100) NOT NULL, "type" "public"."companies_type_enum" NOT NULL DEFAULT 'general_store', "descriptionEn" text, "descriptionAr" text, "phone" character varying(20), "email" character varying(255), "addressEn" text, "addressAr" text, "latitude" numeric(10,7), "longitude" numeric(10,7), "logo" character varying(255), "isActive" boolean NOT NULL DEFAULT false, "isVerified" boolean NOT NULL DEFAULT false, "openingTime" TIME, "closingTime" TIME, "rating" numeric(3,2) NOT NULL DEFAULT '0', "totalOrders" integer NOT NULL DEFAULT '0', "userId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_6d64e8c7527a9e4af83cc66cbf" UNIQUE ("userId"), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "isTrader" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "FK_6d64e8c7527a9e4af83cc66cbf7" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "companies" DROP CONSTRAINT "FK_6d64e8c7527a9e4af83cc66cbf7"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isTrader"`);
    await queryRunner.query(`DROP TABLE "companies"`);
    await queryRunner.query(`DROP TYPE "public"."companies_type_enum"`);
  }
}
