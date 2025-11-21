import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from '../exams/entities/question.entity';
import { User } from '../users/entities/user.entity';
import { CommentReply } from './entities/comment-reply.entity';
import { QuestionComment } from './entities/question-comment.entity';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Question,
      User,
      QuestionComment,
      CommentReply,
    ]),
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
