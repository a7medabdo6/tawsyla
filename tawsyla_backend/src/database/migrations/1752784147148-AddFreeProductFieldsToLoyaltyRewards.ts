import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFreeProductFieldsToLoyaltyRewards1752784147148
  implements MigrationInterface
{
  name = 'AddFreeProductFieldsToLoyaltyRewards1752784147148';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "loyalty_rewards" 
      ADD COLUMN "freeProductId" uuid,
      ADD COLUMN "freeProductVariantId" uuid,
      ADD COLUMN "freeProductQuantity" integer NOT NULL DEFAULT 1
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "loyalty_rewards" 
      ADD CONSTRAINT "FK_loyalty_rewards_free_product" 
      FOREIGN KEY ("freeProductId") REFERENCES "products"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "loyalty_rewards" 
      ADD CONSTRAINT "FK_loyalty_rewards_free_product_variant" 
      FOREIGN KEY ("freeProductVariantId") REFERENCES "product_variants"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "loyalty_rewards" 
      DROP CONSTRAINT "FK_loyalty_rewards_free_product_variant"
    `);

    await queryRunner.query(`
      ALTER TABLE "loyalty_rewards" 
      DROP CONSTRAINT "FK_loyalty_rewards_free_product"
    `);

    // Drop columns
    await queryRunner.query(`
      ALTER TABLE "loyalty_rewards" 
      DROP COLUMN "freeProductQuantity",
      DROP COLUMN "freeProductVariantId",
      DROP COLUMN "freeProductId"
    `);
  }
}
