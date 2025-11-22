import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBillingTables1763744542000 implements MigrationInterface {
    name = 'AddBillingTables1763744542000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."plan_period_enum" AS ENUM('one_time', 'monthly', 'yearly')`);
        await queryRunner.query(`CREATE TYPE "public"."subscription_status_enum" AS ENUM('pending', 'active', 'canceled', 'expired')`);
        await queryRunner.query(`CREATE TYPE "public"."payment_status_enum" AS ENUM('pending', 'paid', 'failed', 'refunded')`);
        await queryRunner.query(`CREATE TYPE "public"."payment_method_enum" AS ENUM('pix', 'card')`);
        await queryRunner.query(`CREATE TABLE "plans" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "code" character varying NOT NULL, "name" character varying NOT NULL, "description" text, "priceCents" integer NOT NULL DEFAULT '0', "currency" character varying NOT NULL DEFAULT 'BRL', "period" "public"."plan_period_enum" NOT NULL DEFAULT 'monthly', "active" boolean NOT NULL DEFAULT true, "entitlements" jsonb, CONSTRAINT "UQ_9aeaa45fe2e0fe2ccbb93382504" UNIQUE ("code"), CONSTRAINT "PK_c129b9256d8f5a44c9c54a40ae6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "status" "public"."subscription_status_enum" NOT NULL DEFAULT 'pending', "startedAt" TIMESTAMP WITH TIME ZONE, "endsAt" TIMESTAMP WITH TIME ZONE, "canceledAt" TIMESTAMP WITH TIME ZONE, "externalId" character varying, "gatewayCustomerId" character varying, "userId" uuid, "planId" uuid, CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "payment_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "amountCents" integer NOT NULL, "currency" character varying NOT NULL DEFAULT 'BRL', "status" "public"."payment_status_enum" NOT NULL DEFAULT 'pending', "method" "public"."payment_method_enum" NOT NULL DEFAULT 'pix', "gatewayRef" character varying, "description" character varying, "rawPayload" jsonb, "userId" uuid, "subscriptionId" uuid, "planId" uuid, CONSTRAINT "PK_2a4b7ba450e6a2a4c62404a1d66" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TYPE "public"."users_planstatus_enum" RENAME TO "users_planstatus_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_planstatus_enum" AS ENUM('pending', 'active', 'canceled', 'expired')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "planStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "planStatus" TYPE "public"."users_planstatus_enum" USING "planStatus"::text::"public"."users_planstatus_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "planStatus" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."users_planstatus_enum_old"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "planEndDate" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "users" ADD "abacateCustomerId" character varying`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_8f6f1ac93fd9d5c9965e05c0bcb" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_3ab8888d18eb0f95d1e0b29a166" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_transactions" ADD CONSTRAINT "FK_eca4359dbe270c4db14f47a44c2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_transactions" ADD CONSTRAINT "FK_471c0c3a7bc2e6935963210ba58" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_transactions" ADD CONSTRAINT "FK_ee604e03b5973de822db1f44c13" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_transactions" DROP CONSTRAINT "FK_ee604e03b5973de822db1f44c13"`);
        await queryRunner.query(`ALTER TABLE "payment_transactions" DROP CONSTRAINT "FK_471c0c3a7bc2e6935963210ba58"`);
        await queryRunner.query(`ALTER TABLE "payment_transactions" DROP CONSTRAINT "FK_eca4359dbe270c4db14f47a44c2"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_3ab8888d18eb0f95d1e0b29a166"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_8f6f1ac93fd9d5c9965e05c0bcb"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "abacateCustomerId"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "planEndDate"`);
        await queryRunner.query(`CREATE TYPE "public"."users_planstatus_enum_old" AS ENUM('pending', 'active', 'canceled')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "planStatus" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "planStatus" TYPE "public"."users_planstatus_enum_old" USING "planStatus"::text::"public"."users_planstatus_enum_old"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "planStatus" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."users_planstatus_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_planstatus_enum_old" RENAME TO "users_planstatus_enum"`);
        await queryRunner.query(`DROP TABLE "payment_transactions"`);
        await queryRunner.query(`DROP TABLE "subscriptions"`);
        await queryRunner.query(`DROP TABLE "plans"`);
        await queryRunner.query(`DROP TYPE "public"."payment_method_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payment_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."subscription_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."plan_period_enum"`);
    }

}
