import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SubjectBreakdown } from '../../../common/interfaces/result-analysis.interface';
import { Attempt } from '../../attempts/entities/attempt.entity';

@Entity('attempt_results')
export class AttemptResult extends BaseEntity {
  @OneToOne(() => Attempt, (attempt) => attempt.result, { onDelete: 'CASCADE' })
  @JoinColumn()
  attempt: Attempt;

  @Column({ type: 'int' })
  totalScore: number;

  @Column({ type: 'int' })
  totalQuestions: number;

  @Column({ type: 'float' })
  percentage: number;

  @Column({ type: 'int' })
  totalTimeSeconds: number;

  @Column({ type: 'int' })
  averageTimePerQuestion: number;

  @Column({ type: 'jsonb' })
  subjects: SubjectBreakdown[];

  @Column({ type: 'jsonb' })
  strengths: SubjectBreakdown[];

  @Column({ type: 'jsonb' })
  weaknesses: SubjectBreakdown[];
}
