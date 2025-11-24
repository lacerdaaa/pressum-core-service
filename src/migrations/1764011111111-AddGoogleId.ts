import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGoogleId1764011111111 implements MigrationInterface {
    name = 'AddGoogleId1764011111111'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "googleId" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_7ec522c9b71abaaf3e04ac6946d" UNIQUE ("googleId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_7ec522c9b71abaaf3e04ac6946d"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "googleId"`);
    }

}
