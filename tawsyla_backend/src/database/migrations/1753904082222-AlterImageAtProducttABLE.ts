import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterImageAtProducttABLE1753904082222
  implements MigrationInterface
{
  name = 'AlterImageAtProducttABLE1753904082222';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_variants" DROP CONSTRAINT "FK_product_variants_product"`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP CONSTRAINT "FK_addresses_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupons" DROP CONSTRAINT "FK_coupons_created_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_usages" DROP CONSTRAINT "FK_coupon_usages_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_usages" DROP CONSTRAINT "FK_coupon_usages_coupon"`,
    );
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
    await queryRunner.query(
      `ALTER TABLE "loyalty_user_tiers" DROP CONSTRAINT "FK_loyalty_user_tiers_tier"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_user_tiers" DROP CONSTRAINT "FK_loyalty_user_tiers_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" DROP CONSTRAINT "FK_offers_created_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_rewards" DROP CONSTRAINT "FK_loyalty_rewards_free_product_variant"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_rewards" DROP CONSTRAINT "FK_loyalty_rewards_free_product"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_cart_items_variant"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_cart_items_product"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_cart_items_cart"`,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" DROP CONSTRAINT "FK_carts_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_points" DROP CONSTRAINT "FK_loyalty_points_order"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_points" DROP CONSTRAINT "FK_loyalty_points_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favourites" DROP CONSTRAINT "FK_favourites_product"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favourites" DROP CONSTRAINT "FK_favourites_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_products" DROP CONSTRAINT "FK_offer_products_product"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_products" DROP CONSTRAINT "FK_offer_products_offer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_categories" DROP CONSTRAINT "FK_offer_categories_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_categories" DROP CONSTRAINT "FK_offer_categories_offer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_reward_tiers" DROP CONSTRAINT "FK_loyalty_reward_tiers_tier"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_reward_tiers" DROP CONSTRAINT "FK_loyalty_reward_tiers_reward"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_addresses_user_default"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_coupons_code"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_coupons_status"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_coupons_expires_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_coupon_usages_user"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_coupon_usages_coupon"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_order_items_order"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_order_items_product"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_order_items_variant"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_orders_user"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_orders_status"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_orders_payment_status"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_orders_created_at"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_loyalty_tiers_sort_order"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_loyalty_tiers_active"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_loyalty_user_tiers_user"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_loyalty_user_tiers_tier"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_loyalty_user_tiers_active"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_offers_status"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_offers_expires_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_loyalty_rewards_type"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_loyalty_rewards_status"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_loyalty_rewards_active"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_loyalty_rewards_sort_order"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_loyalty_points_user"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_loyalty_points_transaction_type"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_loyalty_points_source"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_loyalty_points_created_at"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_loyalty_points_expires_at"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_offer_products_offer"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_offer_products_product"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_offer_categories_category"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_offer_categories_offer"`);
    await queryRunner.query(
      `ALTER TABLE "favourites" DROP CONSTRAINT "UQ_favourites_user_product"`,
    );
    await queryRunner.query(`ALTER TABLE "coupons" ADD "createdBy" integer`);
    await queryRunner.query(`ALTER TABLE "orders" ADD "loyaltyRewardId" uuid`);
    await queryRunner.query(`ALTER TABLE "offers" ADD "createdBy" integer`);
    await queryRunner.query(
      `ALTER TYPE "public"."orders_payment_status_enum" RENAME TO "orders_payment_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_paymentstatus_enum" AS ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded')`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "paymentStatus" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "paymentStatus" TYPE "public"."orders_paymentstatus_enum" USING "paymentStatus"::"text"::"public"."orders_paymentstatus_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "paymentStatus" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."orders_payment_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."orders_payment_method_enum" RENAME TO "orders_payment_method_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_paymentmethod_enum" AS ENUM('cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'crypto')`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "paymentMethod" TYPE "public"."orders_paymentmethod_enum" USING "paymentMethod"::"text"::"public"."orders_paymentmethod_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."orders_payment_method_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "UQ_2b35cc7a3cc83f7b0cda5f638d4" UNIQUE ("couponUsageId")`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."loyalty_points_transaction_type_enum" RENAME TO "loyalty_points_transaction_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."loyalty_points_transactiontype_enum" AS ENUM('earned', 'redeemed', 'expired', 'adjusted', 'bonus')`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_points" ALTER COLUMN "transactionType" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_points" ALTER COLUMN "transactionType" TYPE "public"."loyalty_points_transactiontype_enum" USING "transactionType"::"text"::"public"."loyalty_points_transactiontype_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_points" ALTER COLUMN "transactionType" SET DEFAULT 'earned'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."loyalty_points_transaction_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_32274f21f8f705165ce89b6d27" ON "offer_products" ("offerId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b2c1d82865cf412e056962bf2e" ON "offer_products" ("productId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7c3505ff98bc374f03bed21b79" ON "offer_categories" ("offerId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_58442b709393c2a421dbb6196b" ON "offer_categories" ("categoryId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3217fbb4bc32b87bd475947bf5" ON "loyalty_reward_tiers" ("rewardId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a3b55097d473df3c7eea6ce565" ON "loyalty_reward_tiers" ("tierId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD CONSTRAINT "FK_f515690c571a03400a9876600b5" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD CONSTRAINT "FK_95c93a584de49f0b0e13f753630" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupons" ADD CONSTRAINT "FK_b8e8b137019c03c958da9b62a28" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_usages" ADD CONSTRAINT "FK_a7b422cc0dbf863671255eaad57" FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_usages" ADD CONSTRAINT "FK_f526503f2419217d16794648f29" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_cdb99c05982d5191ac8465ac010" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_516736b9807228bb17b2d0a3e2a" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_cc4e4adab232e8c05026b2f345d" FOREIGN KEY ("shippingAddressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_2b35cc7a3cc83f7b0cda5f638d4" FOREIGN KEY ("couponUsageId") REFERENCES "coupon_usages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_user_tiers" ADD CONSTRAINT "FK_ffabda3426a1e4300af8cbc58d1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_user_tiers" ADD CONSTRAINT "FK_29153edf7b5213115d1d24b666d" FOREIGN KEY ("tierId") REFERENCES "loyalty_tiers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" ADD CONSTRAINT "FK_967c99a695f54eb74a5cd20e53e" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_edd714311619a5ad09525045838" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_72679d98b31c737937b8932ebe6" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_5a27845bc2d79be6f1fa3d2c036" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" ADD CONSTRAINT "FK_69828a178f152f157dcf2f70a89" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_points" ADD CONSTRAINT "FK_c6a8538ebf55e3dc16f787fb488" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_points" ADD CONSTRAINT "FK_0abdfbb6778fd2f9640d09fdaa6" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "favourites" ADD CONSTRAINT "FK_b75b5e4a2475d03acfe11eac1d1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "favourites" ADD CONSTRAINT "FK_01f33e685427bbbc224dc552d6c" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_products" ADD CONSTRAINT "FK_32274f21f8f705165ce89b6d27a" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_products" ADD CONSTRAINT "FK_b2c1d82865cf412e056962bf2e3" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_categories" ADD CONSTRAINT "FK_7c3505ff98bc374f03bed21b79d" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_categories" ADD CONSTRAINT "FK_58442b709393c2a421dbb6196b7" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_reward_tiers" ADD CONSTRAINT "FK_3217fbb4bc32b87bd475947bf55" FOREIGN KEY ("rewardId") REFERENCES "loyalty_rewards"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_reward_tiers" ADD CONSTRAINT "FK_a3b55097d473df3c7eea6ce565f" FOREIGN KEY ("tierId") REFERENCES "loyalty_tiers"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "loyalty_reward_tiers" DROP CONSTRAINT "FK_a3b55097d473df3c7eea6ce565f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_reward_tiers" DROP CONSTRAINT "FK_3217fbb4bc32b87bd475947bf55"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_categories" DROP CONSTRAINT "FK_58442b709393c2a421dbb6196b7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_categories" DROP CONSTRAINT "FK_7c3505ff98bc374f03bed21b79d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_products" DROP CONSTRAINT "FK_b2c1d82865cf412e056962bf2e3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_products" DROP CONSTRAINT "FK_32274f21f8f705165ce89b6d27a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favourites" DROP CONSTRAINT "FK_01f33e685427bbbc224dc552d6c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favourites" DROP CONSTRAINT "FK_b75b5e4a2475d03acfe11eac1d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_points" DROP CONSTRAINT "FK_0abdfbb6778fd2f9640d09fdaa6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_points" DROP CONSTRAINT "FK_c6a8538ebf55e3dc16f787fb488"`,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" DROP CONSTRAINT "FK_69828a178f152f157dcf2f70a89"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_5a27845bc2d79be6f1fa3d2c036"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_72679d98b31c737937b8932ebe6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" DROP CONSTRAINT "FK_edd714311619a5ad09525045838"`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" DROP CONSTRAINT "FK_967c99a695f54eb74a5cd20e53e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_user_tiers" DROP CONSTRAINT "FK_29153edf7b5213115d1d24b666d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_user_tiers" DROP CONSTRAINT "FK_ffabda3426a1e4300af8cbc58d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_2b35cc7a3cc83f7b0cda5f638d4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_cc4e4adab232e8c05026b2f345d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_516736b9807228bb17b2d0a3e2a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_cdb99c05982d5191ac8465ac010"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_usages" DROP CONSTRAINT "FK_f526503f2419217d16794648f29"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_usages" DROP CONSTRAINT "FK_a7b422cc0dbf863671255eaad57"`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupons" DROP CONSTRAINT "FK_b8e8b137019c03c958da9b62a28"`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP CONSTRAINT "FK_95c93a584de49f0b0e13f753630"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" DROP CONSTRAINT "FK_f515690c571a03400a9876600b5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a3b55097d473df3c7eea6ce565"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3217fbb4bc32b87bd475947bf5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_58442b709393c2a421dbb6196b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7c3505ff98bc374f03bed21b79"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b2c1d82865cf412e056962bf2e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_32274f21f8f705165ce89b6d27"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."loyalty_points_transaction_type_enum_old" AS ENUM('earned', 'redeemed', 'expired', 'adjusted', 'bonus')`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_points" ALTER COLUMN "transactionType" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_points" ALTER COLUMN "transactionType" TYPE "public"."loyalty_points_transaction_type_enum_old" USING "transactionType"::"text"::"public"."loyalty_points_transaction_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_points" ALTER COLUMN "transactionType" SET DEFAULT 'earned'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."loyalty_points_transactiontype_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."loyalty_points_transaction_type_enum_old" RENAME TO "loyalty_points_transaction_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "UQ_2b35cc7a3cc83f7b0cda5f638d4"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_payment_method_enum_old" AS ENUM('cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'crypto')`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "paymentMethod" TYPE "public"."orders_payment_method_enum_old" USING "paymentMethod"::"text"::"public"."orders_payment_method_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."orders_paymentmethod_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."orders_payment_method_enum_old" RENAME TO "orders_payment_method_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_payment_status_enum_old" AS ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded')`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "paymentStatus" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "paymentStatus" TYPE "public"."orders_payment_status_enum_old" USING "paymentStatus"::"text"::"public"."orders_payment_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "paymentStatus" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(`DROP TYPE "public"."orders_paymentstatus_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."orders_payment_status_enum_old" RENAME TO "orders_payment_status_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "offers" DROP COLUMN "createdBy"`);
    await queryRunner.query(
      `ALTER TABLE "orders" DROP COLUMN "loyaltyRewardId"`,
    );
    await queryRunner.query(`ALTER TABLE "coupons" DROP COLUMN "createdBy"`);
    await queryRunner.query(
      `ALTER TABLE "favourites" ADD CONSTRAINT "UQ_favourites_user_product" UNIQUE ("userId", "productId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_offer_categories_offer" ON "offer_categories" ("offerId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_offer_categories_category" ON "offer_categories" ("categoryId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_offer_products_product" ON "offer_products" ("productId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_offer_products_offer" ON "offer_products" ("offerId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_points_expires_at" ON "loyalty_points" ("expiresAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_points_created_at" ON "loyalty_points" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_points_source" ON "loyalty_points" ("source") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_points_transaction_type" ON "loyalty_points" ("transactionType") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_points_user" ON "loyalty_points" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_rewards_sort_order" ON "loyalty_rewards" ("sortOrder") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_rewards_active" ON "loyalty_rewards" ("isActive") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_rewards_status" ON "loyalty_rewards" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_rewards_type" ON "loyalty_rewards" ("type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_offers_expires_at" ON "offers" ("expiresAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_offers_status" ON "offers" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_user_tiers_active" ON "loyalty_user_tiers" ("isActive") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_user_tiers_tier" ON "loyalty_user_tiers" ("tierId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_user_tiers_user" ON "loyalty_user_tiers" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_tiers_active" ON "loyalty_tiers" ("isActive") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_tiers_sort_order" ON "loyalty_tiers" ("sortOrder") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_orders_created_at" ON "orders" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_orders_payment_status" ON "orders" ("paymentStatus") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_orders_status" ON "orders" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_orders_user" ON "orders" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_order_items_variant" ON "order_items" ("variantId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_order_items_product" ON "order_items" ("productId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_order_items_order" ON "order_items" ("orderId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_coupon_usages_coupon" ON "coupon_usages" ("couponId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_coupon_usages_user" ON "coupon_usages" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_coupons_expires_at" ON "coupons" ("expiresAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_coupons_status" ON "coupons" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_coupons_code" ON "coupons" ("code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_addresses_user_default" ON "addresses" ("userId", "isDefault") `,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_reward_tiers" ADD CONSTRAINT "FK_loyalty_reward_tiers_reward" FOREIGN KEY ("rewardId") REFERENCES "loyalty_rewards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_reward_tiers" ADD CONSTRAINT "FK_loyalty_reward_tiers_tier" FOREIGN KEY ("tierId") REFERENCES "loyalty_tiers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_categories" ADD CONSTRAINT "FK_offer_categories_offer" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_categories" ADD CONSTRAINT "FK_offer_categories_category" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_products" ADD CONSTRAINT "FK_offer_products_offer" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offer_products" ADD CONSTRAINT "FK_offer_products_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "favourites" ADD CONSTRAINT "FK_favourites_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "favourites" ADD CONSTRAINT "FK_favourites_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_points" ADD CONSTRAINT "FK_loyalty_points_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_points" ADD CONSTRAINT "FK_loyalty_points_order" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "carts" ADD CONSTRAINT "FK_carts_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_cart_items_cart" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_cart_items_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cart_items" ADD CONSTRAINT "FK_cart_items_variant" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_rewards" ADD CONSTRAINT "FK_loyalty_rewards_free_product" FOREIGN KEY ("freeProductId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_rewards" ADD CONSTRAINT "FK_loyalty_rewards_free_product_variant" FOREIGN KEY ("freeProductVariantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "offers" ADD CONSTRAINT "FK_offers_created_by" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_user_tiers" ADD CONSTRAINT "FK_loyalty_user_tiers_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_user_tiers" ADD CONSTRAINT "FK_loyalty_user_tiers_tier" FOREIGN KEY ("tierId") REFERENCES "loyalty_tiers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
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
    await queryRunner.query(
      `ALTER TABLE "coupon_usages" ADD CONSTRAINT "FK_coupon_usages_coupon" FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupon_usages" ADD CONSTRAINT "FK_coupon_usages_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "coupons" ADD CONSTRAINT "FK_coupons_created_by" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD CONSTRAINT "FK_addresses_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD CONSTRAINT "FK_product_variants_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
