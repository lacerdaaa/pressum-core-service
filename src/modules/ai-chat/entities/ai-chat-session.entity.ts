import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  RelationId,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { AiChatMessage } from './ai-chat-message.entity';

@Entity('ai_chat_sessions')
export class AiChatSession extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @RelationId((session: AiChatSession) => session.user)
  userId: string;

  @Column({ type: 'text', nullable: true })
  title?: string | null;

  @Column({ type: 'text' })
  model: string;

  @Column({ type: 'text', nullable: true })
  contextType?: string | null;

  @Column({ type: 'uuid', nullable: true })
  contextId?: string | null;

  @Column({ type: 'int', default: 0 })
  tokensUsed: number;

  @Column({ type: 'int', default: 0 })
  tokensLimit: number;

  @Column({ type: 'int', default: 0 })
  messagesCount: number;

  @Column({ type: 'text', default: 'active' })
  status: 'active' | 'closed' | 'limit_reached';

  @OneToMany(() => AiChatMessage, (message) => message.session, {
    cascade: ['insert'],
  })
  messages: AiChatMessage[];
}
