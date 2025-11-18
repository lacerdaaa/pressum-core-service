import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Attempt } from './attempt.entity';
import { Question } from '../../exams/entities/question.entity';

@Entity('essay_submissions')
export class EssaySubmission extends BaseEntity {
  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int', default: 0 })
  wordCount: number;

  @Column({ type: 'timestamptz' })
  savedAt: Date;

  @ManyToOne(() => Attempt, (attempt) => attempt.essaySubmissions, {
    onDelete: 'CASCADE',
  })
  attempt: Attempt;

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  question: Question;
}
