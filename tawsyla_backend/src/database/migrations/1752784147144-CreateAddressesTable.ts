import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAddressesTable1752784147144 implements MigrationInterface {
  name = 'CreateAddressesTable1752784147144';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create addresses table
    await queryRunner.query(
      `CREATE TABLE "addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" integer NOT NULL, "phone" character varying(20) NOT NULL, "city" character varying(100) NOT NULL, "state" character varying(100) NOT NULL, "additionalInfo" text, "isDefault" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_addresses" PRIMARY KEY ("id"))`,
    );

    // Add foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD CONSTRAINT "FK_addresses_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // Create index for faster queries
    await queryRunner.query(
      `CREATE INDEX "IDX_addresses_user_default" ON "addresses" ("userId", "isDefault")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`DROP INDEX "IDX_addresses_user_default"`);

    // Drop foreign key constraint
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP CONSTRAINT "FK_addresses_user"`,
    );

    // Drop addresses table
    await queryRunner.query(`DROP TABLE "addresses"`);
  }
}
