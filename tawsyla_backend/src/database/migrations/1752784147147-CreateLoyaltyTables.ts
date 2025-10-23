import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLoyaltyTables1752784147147 implements MigrationInterface {
  name = 'CreateLoyaltyTables1752784147147';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create points transaction type enum
    await queryRunner.query(
      `CREATE TYPE "public"."loyalty_points_transaction_type_enum" AS ENUM('earned', 'redeemed', 'expired', 'adjusted', 'bonus')`,
    );

    // Create points source enum
    await queryRunner.query(
      `CREATE TYPE "public"."loyalty_points_source_enum" AS ENUM('order', 'referral', 'birthday', 'promotion', 'admin_adjustment', 'redemption')`,
    );

    // Create tier name enum
    await queryRunner.query(
      `CREATE TYPE "public"."loyalty_tiers_name_enum" AS ENUM('bronze', 'silver', 'gold', 'platinum', 'diamond')`,
    );

    // Create reward type enum
    await queryRunner.query(
      `CREATE TYPE "public"."loyalty_rewards_type_enum" AS ENUM('discount', 'free_shipping', 'free_product', 'cashback', 'birthday_gift', 'early_access', 'vip_event')`,
    );

    // Create reward status enum
    await queryRunner.query(
      `CREATE TYPE "public"."loyalty_rewards_status_enum" AS ENUM('active', 'inactive', 'expired')`,
    );

    // Create loyalty_tiers table
    await queryRunner.query(
      `CREATE TABLE "loyalty_tiers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" "public"."loyalty_tiers_name_enum" NOT NULL, "displayName" character varying(100) NOT NULL, "description" text, "minPoints" integer NOT NULL, "maxPoints" integer NOT NULL, "pointsEarningRate" decimal(5,2) NOT NULL, "pointsRedemptionRate" decimal(5,2) NOT NULL, "discountPercentage" decimal(5,2) NOT NULL DEFAULT '0', "freeShipping" boolean NOT NULL DEFAULT false, "prioritySupport" boolean NOT NULL DEFAULT false, "pointsExpiryMonths" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "sortOrder" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_loyalty_tiers_name" UNIQUE ("name"), CONSTRAINT "PK_loyalty_tiers" PRIMARY KEY ("id"))`,
    );

    // Create loyalty_points table
    await queryRunner.query(
      `CREATE TABLE "loyalty_points" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" integer NOT NULL, "transactionType" "public"."loyalty_points_transaction_type_enum" NOT NULL DEFAULT 'earned', "source" "public"."loyalty_points_source_enum" NOT NULL DEFAULT 'order', "points" integer NOT NULL, "balanceAfter" integer NOT NULL, "orderAmount" decimal(10,2), "orderId" uuid, "description" character varying(200), "expiresAt" TIMESTAMP, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_loyalty_points" PRIMARY KEY ("id"))`,
    );

    // Create loyalty_user_tiers table
    await queryRunner.query(
      `CREATE TABLE "loyalty_user_tiers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" integer NOT NULL, "tierId" uuid NOT NULL, "currentPoints" integer NOT NULL, "lifetimePoints" integer NOT NULL, "tierStartDate" TIMESTAMP NOT NULL, "tierEndDate" TIMESTAMP, "isActive" boolean NOT NULL DEFAULT true, "lastActivityDate" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_loyalty_user_tiers" PRIMARY KEY ("id"))`,
    );

    // Create loyalty_rewards table
    await queryRunner.query(
      `CREATE TABLE "loyalty_rewards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "type" "public"."loyalty_rewards_type_enum" NOT NULL DEFAULT 'discount', "pointsCost" integer NOT NULL, "discountAmount" decimal(10,2), "discountPercentage" decimal(5,2), "minimumOrderAmount" decimal(10,2), "maximumDiscountAmount" decimal(10,2), "usageLimit" integer NOT NULL DEFAULT '-1', "usageCount" integer NOT NULL DEFAULT '0', "usageLimitPerUser" integer NOT NULL DEFAULT '1', "validFrom" TIMESTAMP, "validUntil" TIMESTAMP, "status" "public"."loyalty_rewards_status_enum" NOT NULL DEFAULT 'active', "isActive" boolean NOT NULL DEFAULT true, "sortOrder" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_loyalty_rewards" PRIMARY KEY ("id"))`,
    );

    // Create loyalty_reward_tiers junction table
    await queryRunner.query(
      `CREATE TABLE "loyalty_reward_tiers" ("rewardId" uuid NOT NULL, "tierId" uuid NOT NULL, CONSTRAINT "PK_loyalty_reward_tiers" PRIMARY KEY ("rewardId", "tierId"))`,
    );

    // Add foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "loyalty_points" ADD CONSTRAINT "FK_loyalty_points_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "loyalty_points" ADD CONSTRAINT "FK_loyalty_points_order" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "loyalty_user_tiers" ADD CONSTRAINT "FK_loyalty_user_tiers_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "loyalty_user_tiers" ADD CONSTRAINT "FK_loyalty_user_tiers_tier" FOREIGN KEY ("tierId") REFERENCES "loyalty_tiers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "loyalty_reward_tiers" ADD CONSTRAINT "FK_loyalty_reward_tiers_reward" FOREIGN KEY ("rewardId") REFERENCES "loyalty_rewards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "loyalty_reward_tiers" ADD CONSTRAINT "FK_loyalty_reward_tiers_tier" FOREIGN KEY ("tierId") REFERENCES "loyalty_tiers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_points_user" ON "loyalty_points" ("userId")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_points_transaction_type" ON "loyalty_points" ("transactionType")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_points_source" ON "loyalty_points" ("source")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_points_created_at" ON "loyalty_points" ("createdAt")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_points_expires_at" ON "loyalty_points" ("expiresAt")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_user_tiers_user" ON "loyalty_user_tiers" ("userId")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_user_tiers_tier" ON "loyalty_user_tiers" ("tierId")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_user_tiers_active" ON "loyalty_user_tiers" ("isActive")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_rewards_type" ON "loyalty_rewards" ("type")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_rewards_status" ON "loyalty_rewards" ("status")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_rewards_active" ON "loyalty_rewards" ("isActive")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_rewards_sort_order" ON "loyalty_rewards" ("sortOrder")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_tiers_sort_order" ON "loyalty_tiers" ("sortOrder")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_loyalty_tiers_active" ON "loyalty_tiers" ("isActive")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_loyalty_tiers_active"`);
    await queryRunner.query(`DROP INDEX "IDX_loyalty_tiers_sort_order"`);
    await queryRunner.query(`DROP INDEX "IDX_loyalty_rewards_sort_order"`);
    await queryRunner.query(`DROP INDEX "IDX_loyalty_rewards_active"`);
    await queryRunner.query(`DROP INDEX "IDX_loyalty_rewards_status"`);
    await queryRunner.query(`DROP INDEX "IDX_loyalty_rewards_type"`);
    await queryRunner.query(`DROP INDEX "IDX_loyalty_user_tiers_active"`);
    await queryRunner.query(`DROP INDEX "IDX_loyalty_user_tiers_tier"`);
    await queryRunner.query(`DROP INDEX "IDX_loyalty_user_tiers_user"`);
    await queryRunner.query(`DROP INDEX "IDX_loyalty_points_expires_at"`);
    await queryRunner.query(`DROP INDEX "IDX_loyalty_points_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_loyalty_points_source"`);
    await queryRunner.query(`DROP INDEX "IDX_loyalty_points_transaction_type"`);
    await queryRunner.query(`DROP INDEX "IDX_loyalty_points_user"`);

    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "loyalty_reward_tiers" DROP CONSTRAINT "FK_loyalty_reward_tiers_tier"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_reward_tiers" DROP CONSTRAINT "FK_loyalty_reward_tiers_reward"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_user_tiers" DROP CONSTRAINT "FK_loyalty_user_tiers_tier"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_user_tiers" DROP CONSTRAINT "FK_loyalty_user_tiers_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_points" DROP CONSTRAINT "FK_loyalty_points_order"`,
    );
    await queryRunner.query(
      `ALTER TABLE "loyalty_points" DROP CONSTRAINT "FK_loyalty_points_user"`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "loyalty_reward_tiers"`);
    await queryRunner.query(`DROP TABLE "loyalty_rewards"`);
    await queryRunner.query(`DROP TABLE "loyalty_user_tiers"`);
    await queryRunner.query(`DROP TABLE "loyalty_points"`);
    await queryRunner.query(`DROP TABLE "loyalty_tiers"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "public"."loyalty_rewards_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."loyalty_rewards_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."loyalty_tiers_name_enum"`);
    await queryRunner.query(`DROP TYPE "public"."loyalty_points_source_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."loyalty_points_transaction_type_enum"`,
    );
  }
}
