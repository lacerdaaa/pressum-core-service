import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { type JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { AiChatService } from './ai-chat.service';
import { CreateAiChatSessionDto } from './dto/create-ai-chat-session.dto';
import { SendAiChatMessageDto } from './dto/send-ai-chat-message.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { UpdateAiChatSessionDto } from './dto/update-ai-chat-session.dto';

@UseGuards(JwtAuthGuard)
@Controller('ai-chat')
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Get('sessions')
  listSessions(
    @CurrentUser() user: JwtPayload,
    @Query() query: PaginationQueryDto,
  ) {
    return this.aiChatService.listSessions(user.sub, query);
  }

  @Get('sessions/:sessionId')
  getSession(
    @CurrentUser() user: JwtPayload,
    @Param('sessionId') sessionId: string,
  ) {
    return this.aiChatService.getSession(user.sub, sessionId);
  }

  @Get('sessions/:sessionId/messages')
  getMessages(
    @CurrentUser() user: JwtPayload,
    @Param('sessionId') sessionId: string,
  ) {
    return this.aiChatService.getSessionMessages(user.sub, sessionId);
  }

  @Post('sessions')
  createSession(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAiChatSessionDto,
  ) {
    return this.aiChatService.createSession(user, dto);
  }

  @Post('sessions/:sessionId/messages')
  sendMessage(
    @CurrentUser() user: JwtPayload,
    @Param('sessionId') sessionId: string,
    @Body() dto: SendAiChatMessageDto,
  ) {
    return this.aiChatService.sendMessage(user, sessionId, dto);
  }

  @Post('sessions/:sessionId/close')
  closeSession(
    @CurrentUser() user: JwtPayload,
    @Param('sessionId') sessionId: string,
  ) {
    return this.aiChatService.closeSession(user.sub, sessionId);
  }

  @Patch('sessions/:sessionId')
  updateSession(
    @CurrentUser() user: JwtPayload,
    @Param('sessionId') sessionId: string,
    @Body() dto: UpdateAiChatSessionDto,
  ) {
    return this.aiChatService.updateSession(user.sub, sessionId, dto);
  }

  @Delete('sessions/:sessionId')
  deleteSession(
    @CurrentUser() user: JwtPayload,
    @Param('sessionId') sessionId: string,
  ) {
    return this.aiChatService.deleteSession(user.sub, sessionId);
  }
}
