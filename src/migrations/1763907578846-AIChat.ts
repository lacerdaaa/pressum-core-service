import { MigrationInterface, QueryRunner } from "typeorm";

export class AIChat1763907578846 implements MigrationInterface {
    name = 'AIChat1763907578846'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ai_chat_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "role" text NOT NULL, "content" text NOT NULL, "tokenCount" integer NOT NULL DEFAULT '0', "sessionId" uuid, CONSTRAINT "PK_68e330d1b2a3c5368bf6d2f67cb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ai_chat_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "title" text, "model" text NOT NULL, "contextType" text, "contextId" uuid, "tokensUsed" integer NOT NULL DEFAULT '0', "tokensLimit" integer NOT NULL DEFAULT '0', "messagesCount" integer NOT NULL DEFAULT '0', "status" text NOT NULL DEFAULT 'active', "userId" uuid, CONSTRAINT "PK_b4f4844c31ab277de498502d1cd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "ai_chat_messages" ADD CONSTRAINT "FK_c21b53eccf0eb35723bb10f549e" FOREIGN KEY ("sessionId") REFERENCES "ai_chat_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ai_chat_sessions" ADD CONSTRAINT "FK_2d02a651fbefaa506d31dba328f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ai_chat_sessions" DROP CONSTRAINT "FK_2d02a651fbefaa506d31dba328f"`);
        await queryRunner.query(`ALTER TABLE "ai_chat_messages" DROP CONSTRAINT "FK_c21b53eccf0eb35723bb10f549e"`);
        await queryRunner.query(`DROP TABLE "ai_chat_sessions"`);
        await queryRunner.query(`DROP TABLE "ai_chat_messages"`);
    }

}
