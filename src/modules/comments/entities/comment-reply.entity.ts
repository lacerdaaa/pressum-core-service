import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { QuestionComment } from './question-comment.entity';

@Entity('comment_replies')
export class CommentReply extends BaseEntity {
  @Column({ type: 'text' })
  text: string;

  @ManyToOne(() => QuestionComment, (comment) => comment.replies, {
    onDelete: 'CASCADE',
  })
  comment: QuestionComment;

  @ManyToOne(() => User, (user) => user.replies, { onDelete: 'CASCADE' })
  user: User;
}
