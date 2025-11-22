/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHmac, timingSafeEqual } from 'crypto';
import { Plan } from './entities/plan.entity';
import { Subscription } from './entities/subscription.entity';
import { PaymentTransaction } from './entities/payment-transaction.entity';
import { User } from '../users/entities/user.entity';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { PaymentMethod, PaymentStatus, SubscriptionStatus } from '../../common/enums/billing.enum';
import { PlanStatus, UserPlan } from '../../common/enums/plan.enum';
import AbacatePay from 'abacatepay-nodejs-sdk';
import type {
  CreateBillingData,
  CreateBillingResponse,
  CreateCustomerResponse,
  IBilling,
} from 'abacatepay-nodejs-sdk/dist/types';

type IBillingWithPix = IBilling & { pixCode?: string };
type BillingExtracted = { id?: string; url?: string; pixCode?: string; error?: string };
type CustomerExtracted = { id?: string; error?: string | null };

@Injectable()
export class BillingService {
  private readonly client: ReturnType<typeof AbacatePay> | null;
  private readonly logger = new Logger(BillingService.name);

  private extractBillingData(response: CreateBillingResponse): BillingExtracted {
    const respObj = response as Record<string, unknown>;
    const hasData = typeof respObj.data === 'object' && respObj.data !== null;
    const data = hasData ? (respObj.data as Partial<IBillingWithPix>) : undefined;
    const error = typeof respObj.error === 'string' ? respObj.error : undefined;

    if (data) {
      return {
        id: typeof data.id === 'string' ? data.id : undefined,
        url: typeof data.url === 'string' ? data.url : undefined,
        pixCode: typeof data.pixCode === 'string' ? data.pixCode : undefined,
        error,
      };
    }

    return {
      id: typeof respObj.id === 'string' ? (respObj.id) : undefined,
      url: typeof respObj.url === 'string' ? (respObj.url) : undefined,
      pixCode: typeof respObj.pixCode === 'string' ? (respObj.pixCode) : undefined,
      error,
    };
  }

  private extractCustomerData(response: CreateCustomerResponse | unknown): CustomerExtracted {
    if (response && typeof response === 'object') {
      const respObj = response as Record<string, unknown>;
      const data = respObj.data as Record<string, unknown> | undefined;
      const error = typeof respObj.error === 'string' ? respObj.error : undefined;
      if (data && typeof data.id === 'string') {
        return { id: data.id, error: error ?? null };
      }
      if (error) {
        return { error };
      }
    }
    return {};
  }

  constructor(
    @InjectRepository(Plan) private readonly planRepo: Repository<Plan>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(PaymentTransaction)
    private readonly txRepo: Repository<PaymentTransaction>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {
    const apiKey = process.env.ABACATEPAY_API_KEY;
    if (!apiKey) {
      this.logger.warn('ABACATEPAY_API_KEY not set; billing client will be disabled');
      this.client = null;
    } else {
      this.client = AbacatePay(apiKey);
    }
  }

  async createCheckout(dto: CreateCheckoutDto) {
    if (!this.client) {
      throw new BadRequestException('Billing client not configured');
    }

    const plan = await this.planRepo.findOne({ where: { code: dto.planCode, active: true } });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!dto.taxId) {
      throw new BadRequestException('taxId is required');
    }

    if (!user.name || !user.email) {
      throw new BadRequestException('User name and email are required to create a billing');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const customerId = await this.ensureCustomer(user, dto.taxId, dto.cellphone);

    const subscription = this.subscriptionRepo.create({
      status: SubscriptionStatus.PENDING,
      user,
      plan,
      gatewayCustomerId: customerId,
    });
    await this.subscriptionRepo.save(subscription);

    const cleanedTaxId = dto.taxId.replace(/\D/g, '');
    if (cleanedTaxId.length < 11) {
      throw new BadRequestException('Invalid taxId');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const cleanedPhone = dto.cellphone ? dto.cellphone.replace(/\D/g, '') : undefined;

    const billingPayload: CreateBillingData = {
      frequency: 'MULTIPLE_PAYMENTS',
      methods: ['PIX'],
      products: [
        {
          externalId: plan.code,
          name: plan.name,
          description: plan.description ?? '',
          quantity: 1,
          price: plan.priceCents,
        },
      ],
      returnUrl: dto.returnUrl ?? '',
      completionUrl: dto.completionUrl ?? '',
      customer: {
        name: user.name,
        email: user.email,
        taxId: cleanedTaxId,
        cellphone: cleanedPhone,
      },
    };

    let response: CreateBillingResponse;
    try {
      response = await this.client.billing.create(billingPayload);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to call AbacatePay billing.create';
      this.logger.error(`AbacatePay billing.create threw: ${message}`);
      throw new BadRequestException(message);
    }

    const billingData = this.extractBillingData(response);
    if (billingData.error) {
      this.logger.error(`AbacatePay billing.create failed: ${billingData.error}`, billingData);
      throw new BadRequestException(billingData.error ?? 'Failed to create billing');
    }

    if (!billingData.id && !billingData.url) {
      this.logger.error('AbacatePay billing.create missing id/url', billingData);
      throw new BadRequestException('Failed to create billing');
    }

    const tx = this.txRepo.create({
      amountCents: plan.priceCents,
      currency: plan.currency,
      status: PaymentStatus.PENDING,
      method: PaymentMethod.PIX,
      gatewayRef: billingData.id ?? billingData.url ?? null,
      description: `${plan.name} subscription`,
      user,
      plan,
      subscription,
      rawPayload: billingData,
    });
    await this.txRepo.save(tx);

    const maybePix = (billingData as IBillingWithPix)?.pixCode;

    return {
      checkoutUrl: billingData.url,
      pixCode: maybePix,
      transactionId: tx.id,
      status: tx.status,
    };
  }

  async handleWebhook(
    signature: string | undefined,
    rawBody: Buffer,
    payload: unknown,
    secretFromRequest?: string,
  ) {
    if (!this.client) {
      throw new BadRequestException('Billing client not configured');
    }

    const secret = process.env.ABACATE_WEBHOOK_SECRET ?? process.env.ABACATEPAY_API_KEY;
    const publicKey = process.env.ABACATEPAY_PUBLIC_KEY ?? secret;

    // 1) valida secret simples (query/header)
    if (secretFromRequest && secret && secretFromRequest !== secret) {
      this.logger.warn('Invalid webhook secret (query/header)');
      throw new BadRequestException('Invalid signature');
    }

    // 2) valida assinatura HMAC (base64) usando chave pública
    if (!signature) {
      this.logger.warn('Missing webhook signature header');
      throw new BadRequestException('Missing signature');
    }

    const expected = createHmac('sha256', publicKey ?? '').update(rawBody).digest('base64');
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
      this.logger.warn('Invalid webhook signature');
      throw new BadRequestException('Invalid signature');
    }

    const parsedPayload = payload as {
      id?: string; // event id
      status?: string;
      data?: {
        id?: string;
        status?: string;
        billing?: { id?: string; status?: string };
      };
    };

    const gatewayRef: string | undefined =
      parsedPayload.data?.billing?.id ?? parsedPayload.data?.id ?? parsedPayload.id;
    if (!gatewayRef) {
      this.logger.warn('Webhook without gateway reference');
      return { ok: true };
    }

    const tx = await this.txRepo.findOne({
      where: { gatewayRef },
      relations: { subscription: { plan: true, user: true }, user: true, plan: true },
    });

    if (!tx) {
      this.logger.warn(`Transaction not found for gatewayRef ${gatewayRef}`);
      return { ok: true };
    }

    const status: string =
      parsedPayload.data?.billing?.status ??
      parsedPayload.data?.status ??
      parsedPayload.status ??
      '';
    const normalized = status ? status.toUpperCase() : '';

    if (normalized === 'PAID' || normalized === 'ACTIVE') {
      tx.status = PaymentStatus.PAID;
      tx.rawPayload = parsedPayload as Record<string, unknown>;
      await this.txRepo.save(tx);

      if (tx.subscription) {
        tx.subscription.status = SubscriptionStatus.ACTIVE;
        tx.subscription.startedAt = new Date();
        tx.subscription.externalId = gatewayRef;
        await this.subscriptionRepo.save(tx.subscription);
      }

      const plan = tx.plan ?? tx.subscription?.plan;
      if (plan && tx.user) {
        tx.user.plan = plan.code as UserPlan;
        tx.user.planStatus = PlanStatus.ACTIVE;
        tx.user.planStartDate = new Date();
        tx.user.planEndDate = null;
        await this.userRepo.save(tx.user);
      }
    } else if (normalized === 'EXPIRED' || normalized === 'CANCELLED') {
      tx.status = PaymentStatus.FAILED;
      tx.rawPayload = parsedPayload as Record<string, unknown>;
      await this.txRepo.save(tx);

      if (tx.subscription) {
        tx.subscription.status =
          normalized === 'EXPIRED' ? SubscriptionStatus.EXPIRED : SubscriptionStatus.CANCELED;
        tx.subscription.canceledAt = new Date();
        await this.subscriptionRepo.save(tx.subscription);
      }
    } else if (normalized === 'REFUNDED') {
      tx.status = PaymentStatus.REFUNDED;
      tx.rawPayload = parsedPayload as Record<string, unknown>;
      await this.txRepo.save(tx);

      if (tx.subscription) {
        tx.subscription.status = SubscriptionStatus.CANCELED;
        tx.subscription.canceledAt = new Date();
        await this.subscriptionRepo.save(tx.subscription);
      }
    } else {
      tx.rawPayload = parsedPayload as Record<string, unknown>;
      await this.txRepo.save(tx);
    }

    return { ok: true };
  }

  private async ensureCustomer(user: User, taxId: string, cellphone?: string): Promise<string> {
    if (user.abacateCustomerId) return user.abacateCustomerId;

    let customer: CreateCustomerResponse | unknown;
    try {
      customer = await this.client!.customer.create({
        name: user.name,
        email: user.email,
        taxId,
        cellphone: cellphone ? cellphone.replace(/\D/g, '') : undefined,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to call AbacatePay customer.create';
      this.logger.error(`AbacatePay customer.create threw: ${message}`);
      throw new BadRequestException(message);
    }

    const customerParsed = this.extractCustomerData(customer);
    const customerId = customerParsed.id;
    if (!customerId) {
      this.logger.error(
        `AbacatePay customer.create failed: ${customerParsed.error ?? 'unknown error'}`,
        customer,
      );
      throw new BadRequestException(customerParsed.error ?? 'Failed to create customer at AbacatePay');
    }

    user.abacateCustomerId = customerId;
    await this.userRepo.save(user);
    return customerId;
  }

  async getLatestSubscriptionForUser(userId: string) {
    return this.subscriptionRepo.findOne({
      where: { user: { id: userId } },
      relations: { plan: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getPaymentsForUser(userId: string) {
    return this.txRepo.find({
      where: { user: { id: userId } },
      relations: { plan: true, subscription: true },
      order: { createdAt: 'DESC' },
    });
  }

  async cancelSubscription(subscriptionId: string, userId?: string) {
    const subscription = await this.subscriptionRepo.findOne({
      where: { id: subscriptionId, ...(userId ? { user: { id: userId } } : {}) },
      relations: { user: true },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    subscription.status = SubscriptionStatus.CANCELED;
    subscription.canceledAt = new Date();
    await this.subscriptionRepo.save(subscription);

    if (subscription.user) {
      subscription.user.planStatus = PlanStatus.CANCELED;
      subscription.user.planEndDate = subscription.canceledAt;
      await this.userRepo.save(subscription.user);
    }

    return subscription;
  }
}
