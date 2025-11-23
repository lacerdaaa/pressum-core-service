import { Column, Entity, Index, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { MetricScopeType } from '../enums/metric-scope.enum';

@Entity('user_subject_metrics')
@Unique(['user', 'scopeType', 'scopeId', 'subject'])
export class UserSubjectMetric extends BaseEntity {
  @ManyToOne(() => User, (user) => user.subjectMetrics, {
    onDelete: 'CASCADE',
  })
  @Index()
  user: User;

  @Column({ type: 'enum', enum: MetricScopeType })
  scopeType: MetricScopeType;

  @Column({ type: 'uuid', nullable: true })
  scopeId?: string | null;

  @Column({ type: 'text' })
  subject: string;

  @Column({ type: 'int', default: 0 })
  correctCount: number;

  @Column({ type: 'int', default: 0 })
  totalCount: number;

  @Column({ type: 'float', default: 0 })
  averageTimeSeconds: number;

  @Column({ type: 'float', default: 0 })
  latestPercentage: number;

  @Column({ type: 'float', default: 0 })
  trendSlope: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastUpdatedAt?: Date | null;
}
