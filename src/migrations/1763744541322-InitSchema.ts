import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1763744541322 implements MigrationInterface {
    name = 'InitSchema1763744541322'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "question_options" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "label" character varying NOT NULL, "text" text NOT NULL, "isCorrect" boolean NOT NULL DEFAULT false, "questionId" uuid, CONSTRAINT "PK_13be20e51c0738def32f00cf7d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "essay_supporting_texts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "title" character varying NOT NULL, "content" text NOT NULL, "source" character varying, "questionId" uuid, CONSTRAINT "PK_a0f04700899daecf2355037a4a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comment_replies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "text" text NOT NULL, "commentId" uuid, "userId" uuid, CONSTRAINT "PK_54d32d12fc82246d821c1752f30" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "question_comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "text" text NOT NULL, "questionId" uuid, "userId" uuid, CONSTRAINT "PK_e54aa5420c6241328d4f5f28fe2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."questions_type_enum" AS ENUM('multiple-choice', 'essay')`);
        await queryRunner.query(`CREATE TABLE "questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "type" "public"."questions_type_enum" NOT NULL DEFAULT 'multiple-choice', "text" text NOT NULL, "area" character varying NOT NULL, "subarea" character varying, "supportImage" text, "supportText" text, "explanation" text, "essayTopic" text, "essayGuidelines" text, "examId" uuid, CONSTRAINT "PK_08a6d4b0f49ff300bf3a0ca60ac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."exams_difficulty_enum" AS ENUM('Fácil', 'Médio', 'Difícil')`);
        await queryRunner.query(`CREATE TABLE "exams" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "title" character varying NOT NULL, "description" text, "durationMinutes" integer NOT NULL DEFAULT '0', "timeLimitMinutes" integer NOT NULL DEFAULT '0', "totalQuestions" integer NOT NULL DEFAULT '0', "difficulty" "public"."exams_difficulty_enum" NOT NULL DEFAULT 'Médio', "areas" text array NOT NULL DEFAULT '{}', "imageUrl" text, "hasEssay" boolean NOT NULL DEFAULT false, "createdBy" character varying, CONSTRAINT "PK_b43159ee3efa440952794b4f53e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "attempt_responses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "selectedOptionId" character varying, "isCorrect" boolean NOT NULL DEFAULT false, "timeSpentSeconds" integer NOT NULL DEFAULT '0', "attemptId" uuid, "questionId" uuid, CONSTRAINT "PK_40f17514f66c57e0dea8d112598" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "essay_submissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "content" text NOT NULL, "wordCount" integer NOT NULL DEFAULT '0', "savedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "attemptId" uuid, "questionId" uuid, CONSTRAINT "PK_3306f6674264c9f520fbbb50f86" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "attempt_results" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "totalScore" integer NOT NULL, "totalQuestions" integer NOT NULL, "percentage" double precision NOT NULL, "totalTimeSeconds" integer NOT NULL, "averageTimePerQuestion" integer NOT NULL, "subjects" jsonb NOT NULL, "strengths" jsonb NOT NULL, "weaknesses" jsonb NOT NULL, "attemptId" uuid, CONSTRAINT "REL_0f067995e848eefe5941db7dc9" UNIQUE ("attemptId"), CONSTRAINT "PK_89d45d10d76ef04811402cedcc9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."attempts_status_enum" AS ENUM('in_progress', 'completed', 'expired', 'abandoned')`);
        await queryRunner.query(`CREATE TABLE "attempts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "status" "public"."attempts_status_enum" NOT NULL DEFAULT 'in_progress', "startedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "submittedAt" TIMESTAMP WITH TIME ZONE, "totalTimeSeconds" integer NOT NULL DEFAULT '0', "timeRemainingSeconds" integer NOT NULL DEFAULT '0', "bookmarkedQuestionIds" text array NOT NULL DEFAULT '{}', "userId" uuid, "examId" uuid, "resultId" uuid, CONSTRAINT "REL_be32413162449c14ddc46d3933" UNIQUE ("resultId"), CONSTRAINT "PK_295ca261e361fd2fd217754dcac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_plan_enum" AS ENUM('free', 'premium', 'intensive')`);
        await queryRunner.query(`CREATE TYPE "public"."users_planstatus_enum" AS ENUM('pending', 'active', 'canceled')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "email" character varying NOT NULL, "name" character varying NOT NULL, "passwordHash" character varying NOT NULL, "plan" "public"."users_plan_enum" NOT NULL DEFAULT 'free', "planStatus" "public"."users_planstatus_enum" NOT NULL DEFAULT 'pending', "planStartDate" TIMESTAMP WITH TIME ZONE, "lastLoginAt" TIMESTAMP WITH TIME ZONE, "metrics" jsonb, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "question_options" ADD CONSTRAINT "FK_c654af7759a681f1b1addbe35bf" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "essay_supporting_texts" ADD CONSTRAINT "FK_c124fe7f1fa11e6ce3298fcd459" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment_replies" ADD CONSTRAINT "FK_29410afaeb4a6c96205ed70ec1a" FOREIGN KEY ("commentId") REFERENCES "question_comments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment_replies" ADD CONSTRAINT "FK_eb86dd7a3c84b4f5836423b19b3" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "question_comments" ADD CONSTRAINT "FK_3dcc886352b51edb93835a59e18" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "question_comments" ADD CONSTRAINT "FK_588fff2db6c1df3430a2569571e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_32cd92f2cd6b9438d6425bff0b8" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attempt_responses" ADD CONSTRAINT "FK_1394ddbdda58dad6cf1b6b91959" FOREIGN KEY ("attemptId") REFERENCES "attempts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attempt_responses" ADD CONSTRAINT "FK_288b3e2e4d57b5954a239aaa9ce" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "essay_submissions" ADD CONSTRAINT "FK_c2db75c3e5c8f90a944c57c4851" FOREIGN KEY ("attemptId") REFERENCES "attempts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "essay_submissions" ADD CONSTRAINT "FK_c8a4d1f497a2a6d4293c9890fb3" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attempt_results" ADD CONSTRAINT "FK_0f067995e848eefe5941db7dc92" FOREIGN KEY ("attemptId") REFERENCES "attempts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attempts" ADD CONSTRAINT "FK_a6abb83b4ea66267571e4315a9c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attempts" ADD CONSTRAINT "FK_ecbc6da13dc8956e9ebb313e874" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attempts" ADD CONSTRAINT "FK_be32413162449c14ddc46d39336" FOREIGN KEY ("resultId") REFERENCES "attempt_results"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attempts" DROP CONSTRAINT "FK_be32413162449c14ddc46d39336"`);
        await queryRunner.query(`ALTER TABLE "attempts" DROP CONSTRAINT "FK_ecbc6da13dc8956e9ebb313e874"`);
        await queryRunner.query(`ALTER TABLE "attempts" DROP CONSTRAINT "FK_a6abb83b4ea66267571e4315a9c"`);
        await queryRunner.query(`ALTER TABLE "attempt_results" DROP CONSTRAINT "FK_0f067995e848eefe5941db7dc92"`);
        await queryRunner.query(`ALTER TABLE "essay_submissions" DROP CONSTRAINT "FK_c8a4d1f497a2a6d4293c9890fb3"`);
        await queryRunner.query(`ALTER TABLE "essay_submissions" DROP CONSTRAINT "FK_c2db75c3e5c8f90a944c57c4851"`);
        await queryRunner.query(`ALTER TABLE "attempt_responses" DROP CONSTRAINT "FK_288b3e2e4d57b5954a239aaa9ce"`);
        await queryRunner.query(`ALTER TABLE "attempt_responses" DROP CONSTRAINT "FK_1394ddbdda58dad6cf1b6b91959"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_32cd92f2cd6b9438d6425bff0b8"`);
        await queryRunner.query(`ALTER TABLE "question_comments" DROP CONSTRAINT "FK_588fff2db6c1df3430a2569571e"`);
        await queryRunner.query(`ALTER TABLE "question_comments" DROP CONSTRAINT "FK_3dcc886352b51edb93835a59e18"`);
        await queryRunner.query(`ALTER TABLE "comment_replies" DROP CONSTRAINT "FK_eb86dd7a3c84b4f5836423b19b3"`);
        await queryRunner.query(`ALTER TABLE "comment_replies" DROP CONSTRAINT "FK_29410afaeb4a6c96205ed70ec1a"`);
        await queryRunner.query(`ALTER TABLE "essay_supporting_texts" DROP CONSTRAINT "FK_c124fe7f1fa11e6ce3298fcd459"`);
        await queryRunner.query(`ALTER TABLE "question_options" DROP CONSTRAINT "FK_c654af7759a681f1b1addbe35bf"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_planstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_plan_enum"`);
        await queryRunner.query(`DROP TABLE "attempts"`);
        await queryRunner.query(`DROP TYPE "public"."attempts_status_enum"`);
        await queryRunner.query(`DROP TABLE "attempt_results"`);
        await queryRunner.query(`DROP TABLE "essay_submissions"`);
        await queryRunner.query(`DROP TABLE "attempt_responses"`);
        await queryRunner.query(`DROP TABLE "exams"`);
        await queryRunner.query(`DROP TYPE "public"."exams_difficulty_enum"`);
        await queryRunner.query(`DROP TABLE "questions"`);
        await queryRunner.query(`DROP TYPE "public"."questions_type_enum"`);
        await queryRunner.query(`DROP TABLE "question_comments"`);
        await queryRunner.query(`DROP TABLE "comment_replies"`);
        await queryRunner.query(`DROP TABLE "essay_supporting_texts"`);
        await queryRunner.query(`DROP TABLE "question_options"`);
    }

}
