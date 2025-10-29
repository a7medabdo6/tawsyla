import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOldPriceToProductVariantTable1761757635862
  implements MigrationInterface
{
  name = 'AddOldPriceToProductVariantTable1761757635862';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_variants" ADD "oldPrice" numeric(10,2)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product_variants" DROP COLUMN "oldPrice"`,
    );
  }
}
