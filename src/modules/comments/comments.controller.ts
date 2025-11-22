import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { type JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';
import { CommentsService } from './comments.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) { }

  @Post('questions/:questionId/comments')
  addComment(
    @Param('questionId') questionId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.addComment(questionId, user.sub, dto);
  }

  @Get('questions/:questionId/comments')
  getComments(@Param('questionId') questionId: string) {
    return this.commentsService.getCommentsForQuestion(questionId);
  }

  @Post('comments/:commentId/replies')
  addReply(
    @Param('commentId') commentId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateReplyDto,
  ) {
    return this.commentsService.addReply(commentId, user.sub, dto);
  }

  @Delete('comments/:commentId')
  deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commentsService.deleteComment(commentId, user.sub);
  }

  @Delete('replies/:replyId')
  deleteReply(
    @Param('replyId') replyId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commentsService.deleteReply(replyId, user.sub);
  }

  @Patch('comments/:commentId')
  updateComment(
    @Param('commentId') commentId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.updateComment(commentId, user.sub, dto.text);
  }

  @Patch('replies/:replyId')
  updateReply(
    @Param('replyId') replyId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateReplyDto,
  ) {
    return this.commentsService.updateReply(replyId, user.sub, dto.text);
  }
}
