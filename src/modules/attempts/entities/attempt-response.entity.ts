import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Question } from '../../exams/entities/question.entity';
import { Attempt } from './attempt.entity';

@Entity('attempt_responses')
export class AttemptResponse extends BaseEntity {
  @Column({ nullable: true })
  selectedOptionId?: string;

  @Column({ default: false })
  isCorrect: boolean;

  @Column({ type: 'int', default: 0 })
  timeSpentSeconds: number;

  @ManyToOne(() => Attempt, (attempt) => attempt.responses, {
    onDelete: 'CASCADE',
  })
  attempt: Attempt;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  question: Question;
}
