import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inject } from '@nestjs/common';
import OpenAI from 'openai';
import { AiChatSession } from './entities/ai-chat-session.entity';
import { AiChatMessage } from './entities/ai-chat-message.entity';
import { CreateAiChatSessionDto } from './dto/create-ai-chat-session.dto';
import { SendAiChatMessageDto } from './dto/send-ai-chat-message.dto';
import { type JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { AI_CHAT_LIMITS, DEFAULT_AI_CHAT_MODEL } from './constants';
import { UserPlan, PlanStatus } from '../../common/enums/plan.enum';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { OPENAI_CLIENT } from '../ai-insights/constants';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AiChatService {
  constructor(
    @InjectRepository(AiChatSession)
    private readonly sessionsRepository: Repository<AiChatSession>,
    @InjectRepository(AiChatMessage)
    private readonly messagesRepository: Repository<AiChatMessage>,
    @Inject(OPENAI_CLIENT) private readonly openAiClient: OpenAI | null,
  ) {}

  private getPlanLimits(user: JwtPayload) {
    const plan = user.plan ?? UserPlan.FREE;
    return AI_CHAT_LIMITS[plan] ?? AI_CHAT_LIMITS[UserPlan.FREE];
  }

  private ensureClient() {
    if (!this.openAiClient) {
      throw new ServiceUnavailableException(
        'OpenAI API não configurada. Defina OPENAI_API_KEY.',
      );
    }
  }

  async listSessions(userId: string, query: PaginationQueryDto) {
    const take = Math.min(query.limit ?? 20, 50);
    const skip = query.offset ?? 0;

    const [items, total] = await this.sessionsRepository.findAndCount({
      where: { user: { id: userId } },
      order: { updatedAt: 'DESC' },
      take,
      skip,
    });

    return {
      items,
      pagination: {
        total,
        limit: take,
        offset: skip,
      },
    };
  }

  async getSession(userId: string, sessionId: string) {
    const session = await this.sessionsRepository.findOne({
      where: { id: sessionId, user: { id: userId } },
    });

    if (!session) {
      throw new NotFoundException('Sessão não encontrada');
    }

    return session;
  }

  async getSessionMessages(userId: string, sessionId: string) {
    await this.getSession(userId, sessionId);
    return this.messagesRepository.find({
      where: { session: { id: sessionId } },
      order: { createdAt: 'ASC' },
    });
  }

  async createSession(
    user: JwtPayload,
    dto: CreateAiChatSessionDto,
  ): Promise<AiChatSession> {
    this.ensureClient();

    const limits = this.getPlanLimits(user);
    await this.enforceActiveSessionLimit(user.sub, limits.maxActiveSessions);

    const model = dto.model ?? limits.models[0] ?? DEFAULT_AI_CHAT_MODEL;
    if (!limits.models.includes(model)) {
      throw new ForbiddenException('Modelo não permitido para o seu plano.');
    }

    if (
      user.plan !== UserPlan.FREE &&
      user.planStatus !== PlanStatus.ACTIVE
    ) {
      throw new ForbiddenException(
        'Plano inativo. Atualize sua assinatura para continuar.',
      );
    }

    const session = this.sessionsRepository.create({
      user: { id: user.sub } as User,
      title: dto.title || 'Conversa com IA',
      model,
      contextType: dto.contextType,
      contextId: dto.contextId,
      tokensLimit: limits.tokensLimit,
    });

    const savedSession = await this.sessionsRepository.save(session);

    if (dto.systemPrompt) {
      await this.messagesRepository.save({
        session: savedSession,
        role: 'system',
        content: dto.systemPrompt,
      });
    }

    return savedSession;
  }

  async sendMessage(
    user: JwtPayload,
    sessionId: string,
    dto: SendAiChatMessageDto,
  ) {
    this.ensureClient();
    const session = await this.sessionsRepository.findOne({
      where: { id: sessionId },
      relations: ['user'],
    });

    if (!session || session.user.id !== user.sub) {
      throw new NotFoundException('Sessão não encontrada');
    }

    if (session.status !== 'active') {
      throw new ForbiddenException('Sessão encerrada ou com limite atingido.');
    }

    const limits = this.getPlanLimits(user);
    if (session.messagesCount >= limits.maxMessagesPerSession) {
      session.status = 'limit_reached';
      await this.sessionsRepository.save(session);
      throw new ForbiddenException(
        'Limite de mensagens atingido para esta sessão.',
      );
    }

    const userMessage = this.messagesRepository.create({
      session,
      role: 'user',
      content: dto.content,
    });
    await this.messagesRepository.save(userMessage);

    const history = await this.messagesRepository.find({
      where: { session: { id: sessionId } },
      order: { createdAt: 'ASC' },
    });

    const messagesPayload = history.map((message) => ({
      role: message.role,
      content: message.content,
    })) as OpenAI.Chat.Completions.ChatCompletionMessageParam[];

    const client = this.openAiClient;
    if (!client) {
      throw new ServiceUnavailableException(
        'OpenAI API não configurada. Defina OPENAI_API_KEY.',
      );
    }

    const completion = await client.chat.completions.create({
      model: session.model,
      temperature: 0.3,
      messages: messagesPayload,
    });

    const assistantMessageContent =
      completion.choices[0]?.message?.content ??
      'Não consegui gerar uma resposta no momento.';

    const assistantMessage = this.messagesRepository.create({
      session,
      role: 'assistant',
      content: assistantMessageContent,
      tokenCount: completion.usage?.total_tokens ?? 0,
    });

    await this.messagesRepository.save(assistantMessage);

    session.messagesCount += 1;
    session.tokensUsed += completion.usage?.total_tokens ?? 0;

    if (
      session.tokensUsed >= session.tokensLimit ||
      session.messagesCount >= limits.maxMessagesPerSession
    ) {
      session.status = 'limit_reached';
    }

    await this.sessionsRepository.save(session);

    return {
      session,
      response: assistantMessage,
    };
  }

  async closeSession(userId: string, sessionId: string) {
    const session = await this.getSession(userId, sessionId);
    session.status = 'closed';
    return this.sessionsRepository.save(session);
  }

  private async enforceActiveSessionLimit(
    userId: string,
    maxActive: number,
  ) {
    const activeSessions = await this.sessionsRepository.count({
      where: { user: { id: userId }, status: 'active' },
    });

    if (activeSessions >= maxActive) {
      throw new ForbiddenException(
        'Limite de sessões ativas atingido para seu plano.',
      );
    }
  }
}
