import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAttemptMetadata1764020003000 implements MigrationInterface {
    name = 'AddAttemptMetadata1764020003000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "attempts" ADD COLUMN IF NOT EXISTS "attemptSequence" integer NOT NULL DEFAULT 1`,
        );
        await queryRunner.query(
            `ALTER TABLE "attempts" ADD COLUMN IF NOT EXISTS "examVersion" text`,
        );
        await queryRunner.query(
            `ALTER TABLE "attempts" ADD COLUMN IF NOT EXISTS "examCategory" text`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "attempts" DROP COLUMN IF EXISTS "examCategory"`,
        );
        await queryRunner.query(
            `ALTER TABLE "attempts" DROP COLUMN IF EXISTS "examVersion"`,
        );
        await queryRunner.query(
            `ALTER TABLE "attempts" DROP COLUMN IF EXISTS "attemptSequence"`,
        );
    }
}
