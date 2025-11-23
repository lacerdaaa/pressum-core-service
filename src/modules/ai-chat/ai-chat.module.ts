import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiChatSession } from './entities/ai-chat-session.entity';
import { AiChatMessage } from './entities/ai-chat-message.entity';
import { AiChatService } from './ai-chat.service';
import { AiChatController } from './ai-chat.controller';
import { AiInsightsModule } from '../ai-insights/ai-insights.module';

@Module({
  imports: [TypeOrmModule.forFeature([AiChatSession, AiChatMessage]), AiInsightsModule],
  controllers: [AiChatController],
  providers: [AiChatService],
  exports: [AiChatService],
})
export class AiChatModule {}
