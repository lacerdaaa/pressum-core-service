import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAttemptResultMetadata1764020004000 implements MigrationInterface {
    name = 'AddAttemptResultMetadata1764020004000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "attempt_results" ADD COLUMN IF NOT EXISTS "aiInsights" jsonb`,
        );
        await queryRunner.query(
            `ALTER TABLE "attempt_results" ADD COLUMN IF NOT EXISTS "aiInsightsGeneratedAt" TIMESTAMP WITH TIME ZONE`,
        );
        await queryRunner.query(
            `ALTER TABLE "attempt_results" ADD COLUMN IF NOT EXISTS "examCategory" text`,
        );
        await queryRunner.query(
            `ALTER TABLE "attempt_results" ADD COLUMN IF NOT EXISTS "examVersion" text`,
        );
        await queryRunner.query(
            `ALTER TABLE "attempt_results" ADD COLUMN IF NOT EXISTS "examTitle" text`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "attempt_results" DROP COLUMN IF EXISTS "examTitle"`,
        );
        await queryRunner.query(
            `ALTER TABLE "attempt_results" DROP COLUMN IF EXISTS "examVersion"`,
        );
        await queryRunner.query(
            `ALTER TABLE "attempt_results" DROP COLUMN IF EXISTS "examCategory"`,
        );
        await queryRunner.query(
            `ALTER TABLE "attempt_results" DROP COLUMN IF EXISTS "aiInsightsGeneratedAt"`,
        );
        await queryRunner.query(
            `ALTER TABLE "attempt_results" DROP COLUMN IF EXISTS "aiInsights"`,
        );
    }
}
