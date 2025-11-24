import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { PlanStatus, UserPlan } from '../../../common/enums/plan.enum';
import { UserRole } from '../../../common/enums/role.enum';
import { Attempt } from '../../attempts/entities/attempt.entity';
import { QuestionComment } from '../../comments/entities/question-comment.entity';
import { CommentReply } from '../../comments/entities/comment-reply.entity';
import { type UserMetrics } from '../interfaces/user-metrics.interface';
import { Subscription } from '../../billing/entities/subscription.entity';
import { PaymentTransaction } from '../../billing/entities/payment-transaction.entity';
import { UserMetric } from '../../metrics/entities/user-metric.entity';
import { UserSubjectMetric } from '../../metrics/entities/user-subject-metric.entity';
import { UserMistakeLog } from '../../metrics/entities/user-mistake-log.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: UserPlan, default: UserPlan.FREE })
  plan: UserPlan;

  @Column({ type: 'enum', enum: PlanStatus, default: PlanStatus.PENDING })
  planStatus: PlanStatus;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'timestamptz', nullable: true })
  planStartDate?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  planEndDate?: Date | null;

  @Column({ type: 'varchar', nullable: true })
  abacateCustomerId?: string | null;

  @Column({ type: 'varchar', nullable: true, unique: true })
  googleId?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt?: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  metrics?: UserMetrics;

  @OneToMany(() => Attempt, (attempt) => attempt.user)
  attempts: Attempt[];

  @OneToMany(() => QuestionComment, (comment) => comment.user)
  comments: QuestionComment[];

  @OneToMany(() => CommentReply, (reply) => reply.user)
  replies: CommentReply[];

  @OneToMany(() => Subscription, (subscription) => subscription.user)
  subscriptions: Subscription[];

  @OneToMany(() => PaymentTransaction, (transaction) => transaction.user)
  paymentTransactions: PaymentTransaction[];

  @OneToMany(() => UserMetric, (metric) => metric.user)
  metricSnapshots: UserMetric[];

  @OneToMany(() => UserSubjectMetric, (metric) => metric.user)
  subjectMetrics: UserSubjectMetric[];

  @OneToMany(() => UserMistakeLog, (mistake) => mistake.user)
  mistakeLogs: UserMistakeLog[];
}
