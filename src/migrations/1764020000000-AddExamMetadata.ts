import { MigrationInterface, QueryRunner } from "typeorm";

export class AddExamMetadata1764020000000 implements MigrationInterface {
    name = 'AddExamMetadata1764020000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exams" ADD "category" text NOT NULL DEFAULT 'general'`);
        await queryRunner.query(`ALTER TABLE "exams" ADD "version" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exams" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "exams" DROP COLUMN "category"`);
    }
}
