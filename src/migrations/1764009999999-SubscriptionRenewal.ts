import { MigrationInterface, QueryRunner } from "typeorm";

export class SubscriptionRenewal1764009999999 implements MigrationInterface {
    name = 'SubscriptionRenewal1764009999999'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "billingTaxId" character varying`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "billingCellphone" character varying`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "checkoutReturnUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD "checkoutCompletionUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "payment_transactions" ADD "checkoutUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "payment_transactions" ADD "pixCode" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_transactions" DROP COLUMN "pixCode"`);
        await queryRunner.query(`ALTER TABLE "payment_transactions" DROP COLUMN "checkoutUrl"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "checkoutCompletionUrl"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "checkoutReturnUrl"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "billingCellphone"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP COLUMN "billingTaxId"`);
    }

}
