import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionStatus } from '../../common/enums/billing.enum';
import { User } from '../users/entities/user.entity';
import { PlanStatus, UserPlan } from '../../common/enums/plan.enum';
import { BillingService } from './billing.service';

const BATCH_SIZE = 50;

@Injectable()
export class BillingSchedulerService {
  private readonly logger = new Logger(BillingSchedulerService.name);

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly billingService: BillingService,
  ) {}
  //revisar essa disgraça aq dps da release do abacate pay!!
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async expireOverdueSubscriptions() {
    const now = new Date();
    let processed = 0;

    while (true) {
      const overdue = await this.subscriptionRepo.find({
        where: {
          status: SubscriptionStatus.ACTIVE,
          endsAt: LessThanOrEqual(now),
        },
        relations: { user: true, plan: true },
        take: BATCH_SIZE,
      });

      if (!overdue.length) {
        break;
      }

      for (const subscription of overdue) {
        await this.handleExpiration(subscription, now);
        processed += 1;
      }
    }

    if (processed > 0) {
      this.logger.log(`Expired ${processed} subscription(s) with overdue period`);
    }
  }

  private async handleExpiration(subscription: Subscription, now: Date) {
    subscription.status = SubscriptionStatus.EXPIRED;
    subscription.canceledAt = now;
    if (!subscription.endsAt) {
      subscription.endsAt = now;
    }
    await this.subscriptionRepo.save(subscription);

    const user = subscription.user;
    if (!user) {
      return;
    }

    const stillActive = await this.subscriptionRepo.exist({
      where: {
        user: { id: user.id },
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (!stillActive) {
      user.plan = UserPlan.FREE;
      user.planStatus = PlanStatus.EXPIRED;
      user.planEndDate = subscription.endsAt ?? now;
      await this.userRepo.save(user);

      await this.billingService.queueRenewalCheckout(subscription);
    }
  }
}
