import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCategoryTable1761250935881 implements MigrationInterface {
  name = 'UpdateCategoryTable1761250935881';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "settings" DROP CONSTRAINT "FK_settings_logo"`,
    );

    // Add new columns to categories table only if they don't exist
    const hasDescriptionEn = await queryRunner.hasColumn(
      'categories',
      'descriptionEn',
    );
    if (!hasDescriptionEn) {
      await queryRunner.query(
        `ALTER TABLE "categories" ADD "descriptionEn" text`,
      );
    }

    const hasDescriptionAr = await queryRunner.hasColumn(
      'categories',
      'descriptionAr',
    );
    if (!hasDescriptionAr) {
      await queryRunner.query(
        `ALTER TABLE "categories" ADD "descriptionAr" text`,
      );
    }

    const hasImageId = await queryRunner.hasColumn('categories', 'imageId');
    if (!hasImageId) {
      await queryRunner.query(`ALTER TABLE "categories" ADD "imageId" uuid`);
    }

    const hasParentId = await queryRunner.hasColumn('categories', 'parentId');
    if (!hasParentId) {
      await queryRunner.query(`ALTER TABLE "categories" ADD "parentId" uuid`);
    }

    const hasLevel = await queryRunner.hasColumn('categories', 'level');
    if (!hasLevel) {
      await queryRunner.query(
        `ALTER TABLE "categories" ADD "level" integer NOT NULL DEFAULT '1'`,
      );
    }

    const hasFullPath = await queryRunner.hasColumn('categories', 'fullPath');
    if (!hasFullPath) {
      await queryRunner.query(
        `ALTER TABLE "categories" ADD "fullPath" character varying(500)`,
      );
    }

    // Migrate old description column to descriptionEn if it exists
    const hasDescription = await queryRunner.hasColumn(
      'categories',
      'description',
    );
    if (hasDescription) {
      await queryRunner.query(
        `UPDATE "categories" SET "descriptionEn" = "description" WHERE "description" IS NOT NULL`,
      );
      await queryRunner.query(
        `ALTER TABLE "categories" DROP COLUMN "description"`,
      );
    }

    await queryRunner.query(
      `ALTER TABLE "settings" ADD CONSTRAINT "UQ_4a1ed558ac2e80947a8d30d563e" UNIQUE ("logoId")`,
    );

    // Add foreign key constraints only if they don't exist
    if (hasImageId) {
      const hasImageFK = await queryRunner.query(
        `SELECT 1 FROM pg_constraint WHERE conname = 'FK_categories_image'`,
      );
      if (hasImageFK.length === 0) {
        await queryRunner.query(
          `ALTER TABLE "categories" ADD CONSTRAINT "FK_categories_image" FOREIGN KEY ("imageId") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
        );
      }
    } else {
      await queryRunner.query(
        `ALTER TABLE "categories" ADD CONSTRAINT "FK_categories_image" FOREIGN KEY ("imageId") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
      );
    }

    if (hasParentId) {
      const hasParentFK = await queryRunner.query(
        `SELECT 1 FROM pg_constraint WHERE conname = 'FK_9a6f051e66982b5f0318981bcaa'`,
      );
      if (hasParentFK.length === 0) {
        await queryRunner.query(
          `ALTER TABLE "categories" ADD CONSTRAINT "FK_9a6f051e66982b5f0318981bcaa" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
      }
    } else {
      await queryRunner.query(
        `ALTER TABLE "categories" ADD CONSTRAINT "FK_9a6f051e66982b5f0318981bcaa" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      );
    }

    await queryRunner.query(
      `ALTER TABLE "settings" ADD CONSTRAINT "FK_4a1ed558ac2e80947a8d30d563e" FOREIGN KEY ("logoId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "settings" DROP CONSTRAINT "FK_4a1ed558ac2e80947a8d30d563e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_9a6f051e66982b5f0318981bcaa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_categories_image"`,
    );
    await queryRunner.query(
      `ALTER TABLE "settings" DROP CONSTRAINT "UQ_4a1ed558ac2e80947a8d30d563e"`,
    );
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "fullPath"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "level"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "parentId"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "imageId"`);
    await queryRunner.query(
      `ALTER TABLE "categories" DROP COLUMN "descriptionAr"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP COLUMN "descriptionEn"`,
    );
    await queryRunner.query(
      `ALTER TABLE "settings" ADD CONSTRAINT "FK_settings_logo" FOREIGN KEY ("logoId") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
