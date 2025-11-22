import { Column, Entity, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { PlanPeriod } from '../../../common/enums/billing.enum';
import { Subscription } from './subscription.entity';
import { PaymentTransaction } from './payment-transaction.entity';

@Entity('plans')
@Unique(['code'])
export class Plan extends BaseEntity {
  @Column()
  code: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'int', default: 0 })
  priceCents: number;

  @Column({ default: 'BRL' })
  currency: string;

  @Column({ type: 'enum', enum: PlanPeriod, default: PlanPeriod.MONTHLY })
  period: PlanPeriod;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'jsonb', nullable: true })
  entitlements?: Record<string, any>;

  @OneToMany(() => Subscription, (subscription) => subscription.plan)
  subscriptions: Subscription[];

  @OneToMany(() => PaymentTransaction, (transaction) => transaction.plan)
  transactions: PaymentTransaction[];
}
