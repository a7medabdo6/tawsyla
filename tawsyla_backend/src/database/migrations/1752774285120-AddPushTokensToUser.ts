import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPushTokensToUser1752774285120 implements MigrationInterface {
  name = 'AddPushTokensToUser1752774285120';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user" 
      ADD COLUMN "pushTokens" text array NOT NULL DEFAULT '{}'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user" 
      DROP COLUMN "pushTokens"
    `);
  }
}
