import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOffersAndCouponsTables1752784147145
  implements MigrationInterface
{
  name = 'CreateOffersAndCouponsTables1752784147145';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create coupon type enum
    await queryRunner.query(
      `CREATE TYPE "public"."coupons_type_enum" AS ENUM('fixed', 'percentage')`,
    );

    // Create coupon status enum
    await queryRunner.query(
      `CREATE TYPE "public"."coupons_status_enum" AS ENUM('active', 'expired', 'disabled')`,
    );

    // Create offer type enum
    await queryRunner.query(
      `CREATE TYPE "public"."offers_type_enum" AS ENUM('discount', 'buy_one_get_one', 'free_shipping', 'cashback')`,
    );

    // Create offer status enum
    await queryRunner.query(
      `CREATE TYPE "public"."offers_status_enum" AS ENUM('active', 'inactive', 'expired')`,
    );

    // Create coupons table
    await queryRunner.query(
      `CREATE TABLE "coupons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(50) NOT NULL, "name" character varying(100) NOT NULL, "description" text, "type" "public"."coupons_type_enum" NOT NULL DEFAULT 'fixed', "value" decimal(10,2) NOT NULL, "minimumOrderAmount" decimal(10,2), "maximumDiscountAmount" decimal(10,2), "usageLimit" integer NOT NULL DEFAULT '1', "usageCount" integer NOT NULL DEFAULT '0', "usageLimitPerUser" integer NOT NULL DEFAULT '1', "expiresAt" TIMESTAMP NOT NULL, "status" "public"."coupons_status_enum" NOT NULL DEFAULT 'active', "isActive" boolean NOT NULL DEFAULT true, "createdById" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_coupons_code" UNIQUE ("code"), CONSTRAINT "PK_coupons" PRIMARY KEY ("id"))`,
    );

    // Create coupon_usages table
    await queryRunner.query(
      `CREATE TABLE "coupon_usages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "couponId" uuid NOT NULL, "userId" integer NOT NULL, "orderAmount" decimal(10,2) NOT NULL, "discountAmount" decimal(10,2) NOT NULL, "orderId" character varying(100), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_coupon_usages" PRIMARY KEY ("id"))`,
    );

    // Create offers table
    await queryRunner.query(
      `CREATE TABLE "offers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "type" "public"."offers_type_enum" NOT NULL DEFAULT 'discount', "discountPercentage" decimal(5,2), "discountAmount" decimal(10,2), "minimumOrderAmount" decimal(10,2), "maximumDiscountAmount" decimal(10,2), "startsAt" TIMESTAMP NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "status" "public"."offers_status_enum" NOT NULL DEFAULT 'active', "isActive" boolean NOT NULL DEFAULT true, "createdById" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_offers" PRIMARY KEY ("id"))`,
    );

    // Create offer_products junction table
    await queryRunner.query(
      `CREATE TABLE "offer_products" ("offerId" uuid NOT NULL, "productId" uuid NOT NULL, CONSTRAINT "PK_offer_products" PRIMARY KEY ("offerId", "productId"))`,
    );

    // Create offer_categories junction table
    await queryRunner.query(
      `CREATE TABLE "offer_categories" ("offerId" uuid NOT NULL, "categoryId" uuid NOT NULL, CONSTRAINT "PK_offer_categories" PRIMARY KEY ("offerId", "categoryId"))`,
    );

    // Add foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "coupons" ADD CONSTRAINT "FK_coupons_created_by" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "coupon_usages" ADD CONSTRAINT "FK_coupon_usages_coupon" FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "coupon_usages" ADD CONSTRAINT "FK_coupon_usages_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "offers" ADD CONSTRAINT "FK_offers_created_by" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "offer_products" ADD CONSTRAINT "FK_offer_products_offer" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "offer_products" ADD CONSTRAINT "FK_offer_products_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "offer_categories" ADD CONSTRAINT "FK_offer_categories_offer" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "offer_categories" ADD CONSTRAINT "FK_offer_categories_category" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_coupons_code" ON "coupons" ("code")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_coupons_status" ON "coupons" ("status")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_coupons_expires_at" ON "coupons" ("expiresAt")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_coupon_usages_user" ON "coupon_usages" ("userId")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_coupon_usages_coupon" ON "coupon_usages" ("couponId")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_offers_status" ON "offers" ("status")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_offers_expires_at" ON "offers" ("expiresAt")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_offer_products_offer" ON "offer_products" ("offerId")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_offer_products_product" ON "offer_products" ("productId")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_offer_categories_offer" ON "offer_categories" ("offerId")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_offer_categories_category" ON "offer_categories" ("categoryId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_offer_categories_category"`);
    await queryRunner.query(`DROP INDEX "IDX_offer_categories_offer"`);
    await queryRunner.query(`DROP INDEX "IDX_offer_products_product"`);
    await queryRunner.query(`DROP INDEX "IDX_offer_products_offer"`);
    await queryRunner.query(`DROP INDEX "IDX_offers_expires_at"`);
    await queryRunner.query(`DROP INDEX "IDX_offers_status"`);
    await queryRunner.query(`DROP INDEX "IDX_coupon_usages_coupon"`);
    await queryRunner.query(`DROP INDEX "IDX_coupon_usages_user"`);
    await queryRunner.query(`DROP INDEX "IDX_coupons_expires_at"`);
    await queryRunner.query(`DROP INDEX "IDX_coupons_status"`);
    await queryRunner.query(`DROP INDEX "IDX_coupons_code"`);

    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "offer_categories" DROP CONSTRAINT "FK_offer_categories_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_categories" DROP CONSTRAINT "FK_offer_categories_offer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_products" DROP CONSTRAINT "FK_offer_products_product"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_products" DROP CONSTRAINT "FK_offer_products_offer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" DROP CONSTRAINT "FK_offers_created_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_usages" DROP CONSTRAINT "FK_coupon_usages_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_usages" DROP CONSTRAINT "FK_coupon_usages_coupon"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupons" DROP CONSTRAINT "FK_coupons_created_by"`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "offer_categories"`);
    await queryRunner.query(`DROP TABLE "offer_products"`);
    await queryRunner.query(`DROP TABLE "offers"`);
    await queryRunner.query(`DROP TABLE "coupon_usages"`);
    await queryRunner.query(`DROP TABLE "coupons"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "public"."offers_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."offers_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."coupons_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."coupons_type_enum"`);
  }
}
