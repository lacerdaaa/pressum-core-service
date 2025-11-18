import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { PlanStatus, UserPlan } from '../../../common/enums/plan.enum';
import { Attempt } from '../../attempts/entities/attempt.entity';
import { UserMetrics } from '../interfaces/user-metrics.interface';

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

  @Column({ type: 'timestamptz', nullable: true })
  planStartDate?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt?: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  metrics?: UserMetrics;

  @OneToMany(() => Attempt, (attempt) => attempt.user)
  attempts: Attempt[];
}
