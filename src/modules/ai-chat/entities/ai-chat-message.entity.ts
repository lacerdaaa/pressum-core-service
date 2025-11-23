import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { AiChatSession } from './ai-chat-session.entity';

export type AiChatMessageRole = 'system' | 'user' | 'assistant';

@Entity('ai_chat_messages')
export class AiChatMessage extends BaseEntity {
  @ManyToOne(() => AiChatSession, (session) => session.messages, {
    onDelete: 'CASCADE',
  })
  session: AiChatSession;

  @Column({ type: 'text' })
  role: AiChatMessageRole;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int', default: 0 })
  tokenCount: number;
}
