import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Question } from '../../exams/entities/question.entity';
import { User } from '../../users/entities/user.entity';
import { CommentReply } from './comment-reply.entity';

@Entity('question_comments')
export class QuestionComment extends BaseEntity {
  @Column({ type: 'text' })
  text: string;

  @ManyToOne(() => Question, (question) => question.comments, {
    onDelete: 'CASCADE',
  })
  question: Question;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => CommentReply, (reply) => reply.comment, { cascade: true })
  replies: CommentReply[];
}
