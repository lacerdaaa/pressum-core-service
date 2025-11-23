import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { Plan } from './entities/plan.entity';
import { Subscription } from './entities/subscription.entity';
import { PaymentTransaction } from './entities/payment-transaction.entity';
import { User } from '../users/entities/user.entity';
import { BillingSchedulerService } from './billing.scheduler';

@Module({
  imports: [TypeOrmModule.forFeature([Plan, Subscription, PaymentTransaction, User])],
  controllers: [BillingController],
  providers: [BillingService, BillingSchedulerService],
  exports: [BillingService],
})
export class BillingModule {}
