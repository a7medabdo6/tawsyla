import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFavouritesTable1752784147141 implements MigrationInterface {
  name = 'CreateFavouritesTable1752784147141';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create favourites table
    await queryRunner.query(
      `CREATE TABLE "favourites" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" integer NOT NULL, "productId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_favourites" PRIMARY KEY ("id"))`,
    );

    // Add unique constraint to prevent duplicate favourites
    await queryRunner.query(
      `ALTER TABLE "favourites" ADD CONSTRAINT "UQ_favourites_user_product" UNIQUE ("userId", "productId")`,
    );

    // Add foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "favourites" ADD CONSTRAINT "FK_favourites_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "favourites" ADD CONSTRAINT "FK_favourites_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    await queryRunner.query(
      `ALTER TABLE "favourites" DROP CONSTRAINT "FK_favourites_product"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favourites" DROP CONSTRAINT "FK_favourites_user"`,
    );

    // Drop unique constraint
    await queryRunner.query(
      `ALTER TABLE "favourites" DROP CONSTRAINT "UQ_favourites_user_product"`,
    );

    // Drop table
    await queryRunner.query(`DROP TABLE "favourites"`);
  }
}
