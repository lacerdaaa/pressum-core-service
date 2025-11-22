import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { PaymentMethod, PaymentStatus } from '../../../common/enums/billing.enum';
import { User } from '../../users/entities/user.entity';
import { Subscription } from './subscription.entity';
import { Plan } from './plan.entity';

@Entity('payment_transactions')
export class PaymentTransaction extends BaseEntity {
  @Column({ type: 'int' })
  amountCents: number;

  @Column({ default: 'BRL' })
  currency: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.PIX })
  method: PaymentMethod;

  @Column({ type: 'varchar', nullable: true })
  gatewayRef?: string | null;

  @Column({ type: 'varchar', nullable: true })
  description?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  rawPayload?: Record<string, any>;

  @ManyToOne(() => User, (user) => user.paymentTransactions, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Subscription, (subscription) => subscription.transactions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  subscription?: Subscription | null;

  @ManyToOne(() => Plan, (plan) => plan.transactions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  plan?: Plan | null;
}
