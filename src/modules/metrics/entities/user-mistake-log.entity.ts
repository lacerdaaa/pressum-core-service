import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Question } from '../../exams/entities/question.entity';
import { Exam } from '../../exams/entities/exam.entity';

@Entity('user_mistake_logs')
export class UserMistakeLog extends BaseEntity {
  @ManyToOne(() => User, (user) => user.mistakeLogs, {
    onDelete: 'CASCADE',
  })
  @Index()
  user: User;

  @ManyToOne(() => Question, { nullable: true, onDelete: 'SET NULL' })
  question?: Question | null;

  @ManyToOne(() => Exam, { nullable: true, onDelete: 'SET NULL' })
  exam?: Exam | null;

  @Column({ type: 'text', nullable: true })
  subject?: string | null;

  @Column({ type: 'int', default: 1 })
  timesWrong: number;

  @Column({ type: 'uuid', nullable: true })
  lastAttemptId?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastSeenAt?: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  notes?: Record<string, unknown> | null;
}
