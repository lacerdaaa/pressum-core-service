import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository, In } from 'typeorm';
import { Attempt } from './entities/attempt.entity';
import { AttemptResponse } from './entities/attempt-response.entity';
import { EssaySubmission } from './entities/essay-submission.entity';
import { Exam } from '../exams/entities/exam.entity';
import { Question } from '../exams/entities/question.entity';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { SaveResponsesDto } from './dto/save-responses.dto';
import { SaveEssayDto } from './dto/save-essay.dto';
import { FinishAttemptDto } from './dto/finish-attempt.dto';
import { AttemptStatus } from '../../common/enums/attempt-status.enum';
import { ResultsService } from '../results/results.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Plan } from '../billing/entities/plan.entity';
import { UserPlan } from '../../common/enums/plan.enum';

@Injectable()
export class AttemptsService {
  constructor(
    @InjectRepository(Attempt)
    private readonly attemptsRepository: Repository<Attempt>,
    @InjectRepository(AttemptResponse)
    private readonly responsesRepository: Repository<AttemptResponse>,
    @InjectRepository(EssaySubmission)
    private readonly essaysRepository: Repository<EssaySubmission>,
    @InjectRepository(Exam) private readonly examsRepository: Repository<Exam>,
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly resultsService: ResultsService,
    private readonly usersService: UsersService,
  ) { }

  async startAttempt(examId: string, userId: string, dto: CreateAttemptDto) {
    const exam = await this.examsRepository.findOne({
      where: { id: examId },
      relations: [
        'questions',
        'questions.options',
        'questions.supportingTexts',
      ],
      order: { questions: { createdAt: 'ASC' } },
    });
    if (!exam) {
      throw new NotFoundException('Simulado not found');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.ensureAttemptLimit(userId);

    const attempt = this.attemptsRepository.create({
      exam,
      user,
      status: AttemptStatus.IN_PROGRESS,
      startedAt: new Date(),
      timeRemainingSeconds: exam.timeLimitMinutes * 60,
      bookmarkedQuestionIds: dto.bookmarkedQuestionIds ?? [],
    });

    const savedAttempt = await this.attemptsRepository.save(attempt);

    return {
      attemptId: savedAttempt.id,
      timeLimitSeconds: exam.timeLimitMinutes * 60,
      bookmarkedQuestionIds: savedAttempt.bookmarkedQuestionIds,
      questions: exam.questions,
    };
  }

  private async ensureAttemptLimit(userId: string) {
    // Resolve plano vigente (assinatura ativa ou fallback user)
    const planInfo = await this.usersService.resolveActivePlan(userId);
    const planCode = planInfo.plan ?? UserPlan.FREE;

    // Buscar entitlements do plano
    const planRepo = this.usersRepository.manager.getRepository(Plan);
    const plan = await planRepo.findOne({ where: { code: planCode } });
    const entitlements = (plan?.entitlements as Record<string, unknown>) || {};
    const maxAttemptsPerMonth = entitlements.maxAttemptsPerMonth as number | null | undefined;

    if (!maxAttemptsPerMonth || maxAttemptsPerMonth <= 0) {
      return; // ilimitado
    }

    // Contar tentativas no mês corrente (qualquer status relevante)
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    const completed = await this.attemptsRepository.count({
      where: {
        user: { id: userId },
        createdAt: Between(startOfMonth, endOfMonth),
      },
    });

    if (completed >= maxAttemptsPerMonth) {
      throw new BadRequestException('Limite mensal de tentativas atingido para o seu plano.');
    }
  }

  async getAttempt(attemptId: string, userId: string) {
    const attempt = await this.attemptsRepository.findOne({
      where: { id: attemptId, user: { id: userId } },
      relations: [
        'exam',
        'exam.questions',
        'exam.questions.options',
        'exam.questions.supportingTexts',
        'responses',
        'responses.question',
        'essaySubmissions',
      ],
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    return attempt;
  }

  async saveResponses(
    attemptId: string,
    userId: string,
    dto: SaveResponsesDto,
  ) {
    const attempt = await this.attemptsRepository.findOne({
      where: { id: attemptId, user: { id: userId } },
      relations: ['exam'],
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    const questionIds = dto.responses.map((response) => response.questionId);
    const questions = await this.questionsRepository.find({
      where: { id: In(questionIds) },
      relations: ['options', 'exam'],
    });

    const existingResponses = await this.responsesRepository.find({
      where: { attempt: { id: attempt.id }, question: { id: In(questionIds) } },
      relations: ['question'],
    });

    for (const response of dto.responses) {
      const question = questions.find((q) => q.id === response.questionId);
      if (!question) {
        continue;
      }

      if (question.exam.id !== attempt.exam.id) {
        continue;
      }

      let responseEntity = existingResponses.find(
        (item) => item.question.id === question.id,
      );
      if (!responseEntity) {
        responseEntity = this.responsesRepository.create({ attempt, question });
      }

      const correctOption = question.options?.find(
        (option) => option.isCorrect,
      );
      responseEntity.selectedOptionId = response.selectedOptionId;
      responseEntity.isCorrect = correctOption
        ? correctOption.id === response.selectedOptionId
        : false;
      responseEntity.timeSpentSeconds = response.timeSpentSeconds;
      await this.responsesRepository.save(responseEntity);
    }

    return { saved: true };
  }

  async saveEssay(attemptId: string, userId: string, dto: SaveEssayDto) {
    const attempt = await this.attemptsRepository.findOne({
      where: { id: attemptId, user: { id: userId } },
      relations: ['exam'],
    });
    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    const question = await this.questionsRepository.findOne({
      where: { id: dto.questionId },
      relations: ['exam'],
    });
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (question.exam.id !== attempt.exam.id) {
      throw new BadRequestException(
        'Question does not belong to this simulado',
      );
    }

    let submission = await this.essaysRepository.findOne({
      where: { attempt: { id: attempt.id }, question: { id: question.id } },
    });

    if (!submission) {
      submission = this.essaysRepository.create({ attempt, question });
    }

    submission.content = dto.content;
    submission.wordCount = dto.wordCount;
    submission.savedAt = new Date();
    await this.essaysRepository.save(submission);

    return submission;
  }

  async finishAttempt(
    attemptId: string,
    userId: string,
    dto: FinishAttemptDto,
  ) {
    const attempt = await this.attemptsRepository.findOne({
      where: { id: attemptId, user: { id: userId } },
      relations: ['exam'],
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (attempt.status === AttemptStatus.COMPLETED) {
      return this.resultsService.getAttemptResult(attempt.id, userId);
    }

    const limitSeconds = attempt.exam.timeLimitMinutes * 60;
    if (dto.totalTimeSeconds > limitSeconds + 60) {
      throw new BadRequestException('Time limit exceeded');
    }

    attempt.totalTimeSeconds = dto.totalTimeSeconds;
    attempt.timeRemainingSeconds =
      dto.timeRemainingSeconds ??
      Math.max(limitSeconds - dto.totalTimeSeconds, 0);
    attempt.bookmarkedQuestionIds =
      dto.bookmarkedQuestionIds ?? attempt.bookmarkedQuestionIds;
    attempt.status = AttemptStatus.COMPLETED;
    attempt.submittedAt = new Date();

    await this.attemptsRepository.save(attempt);
    const result = await this.resultsService.generateAttemptResult(attempt.id);
    return result;
  }
}
