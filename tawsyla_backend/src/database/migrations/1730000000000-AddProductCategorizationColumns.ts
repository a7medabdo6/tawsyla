import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddProductCategorizationColumns1730000000000
  implements MigrationInterface
{
  name = 'AddProductCategorizationColumns1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add salesCount column
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'salesCount',
        type: 'int',
        default: 0,
      }),
    );

    // Add viewCount column
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'viewCount',
        type: 'int',
        default: 0,
      }),
    );

    // Add isTopSelling column
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'isTopSelling',
        type: 'boolean',
        default: false,
      }),
    );

    // Add isTrending column
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'isTrending',
        type: 'boolean',
        default: false,
      }),
    );

    // Add isRecentlyAdded column
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'isRecentlyAdded',
        type: 'boolean',
        default: false,
      }),
    );

    // Add isTopRated column
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'isTopRated',
        type: 'boolean',
        default: false,
      }),
    );

    // Update existing products to set isRecentlyAdded for products created in the last 7 days
    await queryRunner.query(`
      UPDATE products 
      SET "isRecentlyAdded" = true 
      WHERE "createdAt" >= NOW() - INTERVAL '7 days'
    `);

    // Update existing products to set isTopRated for products with rating >= 4.0
    await queryRunner.query(`
      UPDATE products 
      SET "isTopRated" = true 
      WHERE rating >= 4.0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the added columns in reverse order
    await queryRunner.dropColumn('products', 'isTopRated');
    await queryRunner.dropColumn('products', 'isRecentlyAdded');
    await queryRunner.dropColumn('products', 'isTrending');
    await queryRunner.dropColumn('products', 'isTopSelling');
    await queryRunner.dropColumn('products', 'viewCount');
    await queryRunner.dropColumn('products', 'salesCount');
  }
}
