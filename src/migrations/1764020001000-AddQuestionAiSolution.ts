import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQuestionAiSolution1764020001000 implements MigrationInterface {
    name = 'AddQuestionAiSolution1764020001000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" ADD "aiSolution" jsonb`);
        await queryRunner.query(`ALTER TABLE "questions" ADD "aiSolutionGeneratedAt" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN "aiSolutionGeneratedAt"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN "aiSolution"`);
    }
}
