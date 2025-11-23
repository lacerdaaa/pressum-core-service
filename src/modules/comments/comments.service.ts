import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from '../exams/entities/question.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/enums/role.enum';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { CommentReply } from './entities/comment-reply.entity';
import { QuestionComment } from './entities/question-comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(QuestionComment)
    private readonly commentsRepository: Repository<QuestionComment>,
    @InjectRepository(CommentReply)
    private readonly repliesRepository: Repository<CommentReply>,
  ) {}

  async addComment(
    questionId: string,
    userId: string,
    dto: CreateCommentDto,
  ) {
    const [question, user] = await Promise.all([
      this.questionsRepository.findOne({ where: { id: questionId } }),
      this.usersRepository.findOne({ where: { id: userId } }),
    ]);

    if (!question) {
      throw new NotFoundException('Question not found');
    }
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const comment = this.commentsRepository.create({
      text: dto.text,
      question,
      user,
    });

    return this.commentsRepository.save(comment);
  }

  async getCommentsForQuestion(questionId: string) {
    const question = await this.questionsRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return this.commentsRepository.find({
      where: { question: { id: questionId } },
      relations: ['user', 'replies', 'replies.user'],
      order: {
        createdAt: 'DESC',
        replies: { createdAt: 'ASC' },
      },
    });
  }

  async addReply(commentId: string, userId: string, dto: CreateReplyDto) {
    const [comment, user] = await Promise.all([
      this.commentsRepository.findOne({
        where: { id: commentId },
        relations: ['question'],
      }),
      this.usersRepository.findOne({ where: { id: userId } }),
    ]);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const reply = this.repliesRepository.create({
      text: dto.text,
      comment,
      user,
    });

    return this.repliesRepository.save(reply);
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: ['user'],
    });

    const requester = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (!requester) {
      throw new NotFoundException('User not found');
    }

    const isOwner = comment.user.id === userId;
    const isAdmin = requester.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.commentsRepository.remove(comment);
    return { deleted: true };
  }

  async deleteReply(replyId: string, userId: string) {
    const reply = await this.repliesRepository.findOne({
      where: { id: replyId },
      relations: ['user'],
    });

    const requester = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!reply) {
      throw new NotFoundException('Reply not found');
    }

    if (!requester) {
      throw new NotFoundException('User not found');
    }

    const isOwner = reply.user.id === userId;
    const isAdmin = requester.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only delete your own replies');
    }

    await this.repliesRepository.remove(reply);
    return { deleted: true };
  }

  async updateComment(commentId: string, userId: string, text: string) {
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId },
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.user.id !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    comment.text = text;
    return this.commentsRepository.save(comment);
  }

  async updateReply(replyId: string, userId: string, text: string) {
    const reply = await this.repliesRepository.findOne({
      where: { id: replyId },
      relations: ['user'],
    });

    if (!reply) {
      throw new NotFoundException('Reply not found');
    }

    if (reply.user.id !== userId) {
      throw new ForbiddenException('You can only edit your own replies');
    }

    reply.text = text;
    return this.repliesRepository.save(reply);
  }
}
