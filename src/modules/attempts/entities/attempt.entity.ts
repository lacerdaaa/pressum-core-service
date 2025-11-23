import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { AttemptStatus } from '../../../common/enums/attempt-status.enum';
import { User } from '../../users/entities/user.entity';
import { Exam } from '../../exams/entities/exam.entity';
import { AttemptResponse } from './attempt-response.entity';
import { EssaySubmission } from './essay-submission.entity';
import { AttemptResult } from '../../results/entities/attempt-result.entity';

@Entity('attempts')
export class Attempt extends BaseEntity {
  @Column({
    type: 'enum',
    enum: AttemptStatus,
    default: AttemptStatus.IN_PROGRESS,
  })
  status: AttemptStatus;

  @Column({ type: 'timestamptz' })
  startedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  submittedAt?: Date;

  @Column({ type: 'int', default: 0 })
  totalTimeSeconds: number;

  @Column({ type: 'int', default: 0 })
  timeRemainingSeconds: number;

  @Column({ type: 'text', array: true, default: '{}' })
  bookmarkedQuestionIds: string[];

  @Column({ type: 'int', default: 1 })
  attemptSequence: number;

  @Column({ type: 'text', nullable: true })
  examVersion?: string;

  @Column({ type: 'text', nullable: true })
  examCategory?: string;

  @ManyToOne(() => User, (user) => user.attempts, { onDelete: 'SET NULL' })
  user: User;

  @ManyToOne(() => Exam, { onDelete: 'CASCADE' })
  exam: Exam;

  @OneToMany(() => AttemptResponse, (response) => response.attempt, {
    cascade: true,
  })
  responses: AttemptResponse[];

  @OneToMany(() => EssaySubmission, (essay) => essay.attempt, { cascade: true })
  essaySubmissions: EssaySubmission[];

  @OneToOne(() => AttemptResult, (result) => result.attempt, { cascade: true })
  @JoinColumn()
  result?: AttemptResult;
}
