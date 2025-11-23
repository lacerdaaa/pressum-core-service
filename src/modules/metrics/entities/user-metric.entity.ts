import { Column, Entity, Index, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { MetricScopeType } from '../enums/metric-scope.enum';
import { SubjectBreakdown } from '../../../common/interfaces/result-analysis.interface';

export interface MetricHistoryPoint {
  attemptId: string;
  score: number;
  percentage: number;
  totalTimeSeconds: number;
  submittedAt: string;
}

@Entity('user_metrics')
@Unique(['user', 'scopeType', 'scopeId'])
export class UserMetric extends BaseEntity {
  @ManyToOne(() => User, (user) => user.metricSnapshots, {
    onDelete: 'CASCADE',
  })
  @Index()
  user: User;

  @Column({ type: 'enum', enum: MetricScopeType })
  scopeType: MetricScopeType;

  @Column({ type: 'uuid', nullable: true })
  scopeId?: string | null;

  @Column({ type: 'int', default: 0 })
  totalAttempts: number;

  @Column({ type: 'int', default: 0 })
  completedAttempts: number;

  @Column({ type: 'float', default: 0 })
  averageScore: number;

  @Column({ type: 'float', default: 0 })
  bestScore: number;

  @Column({ type: 'float', default: 0 })
  averageTimePerQuestion: number;

  @Column({ type: 'float', default: 0 })
  trendSlope: number;

  @Column({ type: 'jsonb', default: '[]' })
  history: MetricHistoryPoint[];

  @Column({ type: 'jsonb', default: '[]' })
  strengths: SubjectBreakdown[];

  @Column({ type: 'jsonb', default: '[]' })
  weaknesses: SubjectBreakdown[];

  @Column({ type: 'jsonb', default: '[]' })
  subjectsSnapshot: SubjectBreakdown[];

  @Column({ type: 'uuid', nullable: true })
  lastAttemptId?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastComputedAt?: Date | null;
}
