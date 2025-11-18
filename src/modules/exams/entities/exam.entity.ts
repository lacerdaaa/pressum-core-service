import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ExamDifficulty } from '../../../common/enums/exam.enum';
import { Question } from './question.entity';
import { Attempt } from '../../attempts/entities/attempt.entity';

@Entity('exams')
export class Exam extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int', default: 0 })
  durationMinutes: number;

  @Column({ type: 'int', default: 0 })
  timeLimitMinutes: number;

  @Column({ type: 'int', default: 0 })
  totalQuestions: number;

  @Column({
    type: 'enum',
    enum: ExamDifficulty,
    default: ExamDifficulty.MEDIUM,
  })
  difficulty: ExamDifficulty;

  @Column({ type: 'text', array: true, default: '{}' })
  areas: string[];

  @Column({ type: 'text', nullable: true })
  imageUrl?: string;

  @Column({ default: false })
  hasEssay: boolean;

  @Column({ nullable: true })
  createdBy?: string;

  @OneToMany(() => Question, (question) => question.exam, { cascade: true })
  questions: Question[];

  @OneToMany(() => Attempt, (attempt) => attempt.exam)
  attempts: Attempt[];
}
