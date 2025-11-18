import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Question } from './question.entity';

@Entity('essay_supporting_texts')
export class EssaySupportingText extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  source?: string;

  @ManyToOne(() => Question, (question) => question.supportingTexts, {
    onDelete: 'CASCADE',
  })
  question: Question;
}
