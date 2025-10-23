import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSettingsTable1752774285121 implements MigrationInterface {
  name = 'CreateSettingsTable1752774285121';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "appName" character varying(255) NOT NULL,
        "logoId" uuid,
        "description" text,
        "whatsappNumber1" character varying(20),
        "whatsappNumber2" character varying(20),
        "facebookPageLink" character varying(255),
        "instagramLink" character varying(255),
        "tiktokLink" character varying(255),
        "phone1" character varying(20),
        "phone2" character varying(20),
        "email" character varying(255),
        "address" character varying(255),
        "city" character varying(100),
        "country" character varying(100),
        "postalCode" character varying(20),
        "website" character varying(255),
        "twitterLink" character varying(255),
        "linkedinLink" character varying(255),
        "youtubeLink" character varying(255),
        "aboutUs" text,
        "termsAndConditions" text,
        "privacyPolicy" text,
        "refundPolicy" text,
        "shippingPolicy" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_settings" PRIMARY KEY ("id"),
        CONSTRAINT "FK_settings_logo" FOREIGN KEY ("logoId") REFERENCES "file"("id") ON DELETE SET NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "settings"`);
  }
}
