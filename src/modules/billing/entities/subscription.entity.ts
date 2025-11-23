import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SubscriptionStatus } from '../../../common/enums/billing.enum';
import { User } from '../../users/entities/user.entity';
import { Plan } from './plan.entity';
import { PaymentTransaction } from './payment-transaction.entity';

@Entity('subscriptions')
export class Subscription extends BaseEntity {
  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.PENDING })
  status: SubscriptionStatus;

  @Column({ type: 'timestamptz', nullable: true })
  startedAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  endsAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  canceledAt?: Date | null;

  @Column({ type: 'varchar', nullable: true })
  externalId?: string | null;

  @Column({ type: 'varchar', nullable: true })
  gatewayCustomerId?: string | null;

  @Column({ type: 'varchar', nullable: true })
  billingTaxId?: string | null;

  @Column({ type: 'varchar', nullable: true })
  billingCellphone?: string | null;

  @Column({ type: 'varchar', nullable: true })
  checkoutReturnUrl?: string | null;

  @Column({ type: 'varchar', nullable: true })
  checkoutCompletionUrl?: string | null;

  @ManyToOne(() => User, (user) => user.subscriptions, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Plan, (plan) => plan.subscriptions, { onDelete: 'SET NULL' })
  plan: Plan;

  @OneToMany(() => PaymentTransaction, (transaction) => transaction.subscription)
  transactions: PaymentTransaction[];
}
