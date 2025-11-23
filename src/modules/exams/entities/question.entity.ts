import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { QuestionType } from '../../../common/enums/exam.enum';
import { Exam } from './exam.entity';
import { QuestionOption } from './question-option.entity';
import { EssaySupportingText } from './supporting-text.entity';
import { QuestionComment } from '../../comments/entities/question-comment.entity';
import { type AiQuestionSolutionPayload } from '../../../common/interfaces/ai-insights.interface';

@Entity('questions')
export class Question extends BaseEntity {
  @Column({
    type: 'enum',
    enum: QuestionType,
    default: QuestionType.MULTIPLE_CHOICE,
  })
  type: QuestionType;

  @Column({ type: 'text' })
  text: string;

  @Column()
  area: string;

  @Column({ nullable: true })
  subarea?: string;

  @Column({ type: 'text', nullable: true })
  supportImage?: string;

  @Column({ type: 'text', nullable: true })
  supportText?: string;

  @Column({ type: 'text', nullable: true })
  explanation?: string;

  @Column({ type: 'text', nullable: true })
  essayTopic?: string;

  @Column({ type: 'text', nullable: true })
  essayGuidelines?: string;

  @ManyToOne(() => Exam, (exam) => exam.questions, { onDelete: 'CASCADE' })
  exam: Exam;

  @OneToMany(() => QuestionOption, (option) => option.question, {
    cascade: true,
  })
  options: QuestionOption[];

  @OneToMany(() => EssaySupportingText, (supporting) => supporting.question, {
    cascade: true,
  })
  supportingTexts: EssaySupportingText[];

  @OneToMany(() => QuestionComment, (comment) => comment.question)
  comments: QuestionComment[];

  @Column({ type: 'jsonb', nullable: true })
  aiSolution?: AiQuestionSolutionPayload | null;

  @Column({ type: 'timestamptz', nullable: true })
  aiSolutionGeneratedAt?: Date | null;
}
