import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrdersTables1752784147146 implements MigrationInterface {
  name = 'CreateOrdersTables1752784147146';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create order status enum
    await queryRunner.query(
      `CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')`,
    );

    // Create payment status enum
    await queryRunner.query(
      `CREATE TYPE "public"."orders_payment_status_enum" AS ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded')`,
    );

    // Create payment method enum
    await queryRunner.query(
      `CREATE TYPE "public"."orders_payment_method_enum" AS ENUM('cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'crypto')`,
    );

    // Create orders table
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderNumber" character varying(20) NOT NULL, "userId" integer NOT NULL, "shippingAddressId" uuid, "status" "public"."orders_status_enum" NOT NULL DEFAULT 'pending', "paymentStatus" "public"."orders_payment_status_enum" NOT NULL DEFAULT 'pending', "paymentMethod" "public"."orders_payment_method_enum", "subtotal" decimal(10,2) NOT NULL, "shippingCost" decimal(10,2) NOT NULL DEFAULT '0', "taxAmount" decimal(10,2) NOT NULL DEFAULT '0', "discountAmount" decimal(10,2) NOT NULL DEFAULT '0', "total" decimal(10,2) NOT NULL, "couponUsageId" uuid, "notes" text, "adminNotes" text, "confirmedAt" TIMESTAMP, "shippedAt" TIMESTAMP, "deliveredAt" TIMESTAMP, "cancelledAt" TIMESTAMP, "trackingNumber" character varying(100), "trackingUrl" character varying(200), "isActive" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_orders_order_number" UNIQUE ("orderNumber"), CONSTRAINT "PK_orders" PRIMARY KEY ("id"))`,
    );

    // Create order_items table
    await queryRunner.query(
      `CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderId" uuid NOT NULL, "productId" uuid NOT NULL, "variantId" uuid, "productName" character varying(100) NOT NULL, "variantName" character varying(100), "quantity" integer NOT NULL, "unitPrice" decimal(10,2) NOT NULL, "totalPrice" decimal(10,2) NOT NULL, "discountAmount" decimal(10,2) NOT NULL DEFAULT '0', "finalPrice" decimal(10,2) NOT NULL, "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_order_items" PRIMARY KEY ("id"))`,
    );

    // Add foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_shipping_address" FOREIGN KEY ("shippingAddressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_coupon_usage" FOREIGN KEY ("couponUsageId") REFERENCES "coupon_usages"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_order" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_variant" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_orders_user" ON "orders" ("userId")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_orders_status" ON "orders" ("status")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_orders_payment_status" ON "orders" ("paymentStatus")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_orders_created_at" ON "orders" ("createdAt")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_order_items_order" ON "order_items" ("orderId")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_order_items_product" ON "order_items" ("productId")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_order_items_variant" ON "order_items" ("variantId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_order_items_variant"`);
    await queryRunner.query(`DROP INDEX "IDX_order_items_product"`);
    await queryRunner.query(`DROP INDEX "IDX_order_items_order"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_payment_status"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_status"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_user"`);

    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_variant"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_product"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_order"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_coupon_usage"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_shipping_address"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_user"`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "public"."orders_payment_method_enum"`);
    await queryRunner.query(`DROP TYPE "public"."orders_payment_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
  }
}
