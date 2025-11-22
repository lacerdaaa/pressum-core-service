import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHmac } from 'crypto';
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

@Injectable()
export class BillingService {
  private readonly client: ReturnType<typeof AbacatePay> | null;
  private readonly logger = new Logger(BillingService.name);

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

    const customerId = await this.ensureCustomer(user, dto.taxId);

    const subscription = this.subscriptionRepo.create({
      status: SubscriptionStatus.PENDING,
      user,
      plan,
      gatewayCustomerId: customerId,
    });
    await this.subscriptionRepo.save(subscription);

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
        taxId: dto.taxId,
      },
    };

    const response: CreateBillingResponse = await this.client.billing.create(billingPayload);
    if (response.error || !response.data) {
      throw new BadRequestException(response.error ?? 'Failed to create billing');
    }
    const billingData = response.data;

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

  async handleWebhook(signature: string | undefined, rawBody: Buffer, payload: unknown) {
    if (!this.client) {
      throw new BadRequestException('Billing client not configured');
    }

    if (!signature) {
      this.logger.warn('Missing webhook signature header');
      throw new BadRequestException('Missing signature');
    }

    const secret = process.env.ABACATEPAY_API_KEY;
    const computed = createHmac('sha256', secret ?? '').update(rawBody).digest('hex');

    if (computed !== signature) {
      this.logger.warn('Invalid webhook signature');
      throw new BadRequestException('Invalid signature');
    }

    const parsedPayload = payload as {
      id?: string;
      status?: string;
      data?: { id?: string; status?: string };
    };

    const gatewayRef: string | undefined = parsedPayload.id ?? parsedPayload.data?.id;
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

    const status: string = parsedPayload.status ?? parsedPayload.data?.status ?? '';
    const normalized = status ? status.toUpperCase() : '';

    if (normalized === 'PAID') {
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
      // PENDING or unknown
      tx.rawPayload = parsedPayload as Record<string, unknown>;
      await this.txRepo.save(tx);
    }

    return { ok: true };
  }

  private async ensureCustomer(user: User, taxId: string): Promise<string> {
    if (user.abacateCustomerId) return user.abacateCustomerId;

    const customer: CreateCustomerResponse = await this.client!.customer.create({
      name: user.name,
      email: user.email,
      taxId,
    });

    if (customer.error || !customer.data?.id) {
      throw new BadRequestException(customer.error ?? 'Failed to create customer at AbacatePay');
    }

    const customerId = customer.data.id;
    user.abacateCustomerId = customerId;
    await this.userRepo.save(user);
    return customerId;
  }
}
