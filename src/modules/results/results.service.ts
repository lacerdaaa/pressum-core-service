import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attempt } from '../attempts/entities/attempt.entity';
import { AttemptResponse } from '../attempts/entities/attempt-response.entity';
import { AttemptResult } from './entities/attempt-result.entity';
import {
  SubjectBreakdown,
  AttemptResultPayload,
  AttemptSummary,
} from '../../common/interfaces/result-analysis.interface';
import { Question } from '../exams/entities/question.entity';
import { UsersService } from '../users/users.service';
import { AttemptStatus } from '../../common/enums/attempt-status.enum';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { QuestionType } from '../../common/enums/exam.enum';

@Injectable()
export class ResultsService {
  constructor(
    @InjectRepository(Attempt)
    private readonly attemptsRepository: Repository<Attempt>,
    @InjectRepository(AttemptResult)
    private readonly resultsRepository: Repository<AttemptResult>,
    private readonly usersService: UsersService,
  ) {}

  async generateAttemptResult(
    attemptId: string,
  ): Promise<AttemptResultPayload> {
    const attempt = await this.attemptsRepository.findOne({
      where: { id: attemptId },
      relations: [
        'exam',
        'exam.questions',
        'exam.questions.options',
        'responses',
        'responses.question',
        'user',
      ],
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    const breakdown = this.calculateBreakdown(
      attempt.exam.questions,
      attempt.responses,
    );
    const summary: AttemptSummary = {
      totalScore: breakdown.totalScore,
      totalQuestions: breakdown.totalQuestions,
      percentage:
        breakdown.totalQuestions > 0
          ? (breakdown.totalScore / breakdown.totalQuestions) * 100
          : 0,
      totalTimeSeconds: attempt.totalTimeSeconds,
      averageTimePerQuestion:
        breakdown.totalQuestions > 0
          ? Math.round(attempt.totalTimeSeconds / breakdown.totalQuestions)
          : 0,
    };

    let result = await this.resultsRepository.findOne({
      where: { attempt: { id: attempt.id } },
    });
    if (!result) {
      result = this.resultsRepository.create({ attempt });
    }

    result.totalScore = summary.totalScore;
    result.totalQuestions = summary.totalQuestions;
    result.percentage = summary.percentage;
    result.subjects = breakdown.subjects;
    result.strengths = breakdown.strengths;
    result.weaknesses = breakdown.weaknesses;
    result.totalTimeSeconds = summary.totalTimeSeconds;
    result.averageTimePerQuestion = summary.averageTimePerQuestion;

    const savedResult = await this.resultsRepository.save(result);

    await this.updateUserMetrics(attempt.user.id, savedResult);

    return this.buildPayload(attempt, savedResult);
  }

  async getAttemptResult(attemptId: string, userId: string) {
    const attempt = await this.attemptsRepository.findOne({
      where: { id: attemptId, user: { id: userId } },
      relations: [
        'exam',
        'exam.questions',
        'responses',
        'responses.question',
        'result',
      ],
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    if (!attempt.result) {
      return this.generateAttemptResult(attemptId);
    }

    return this.buildPayload(attempt, attempt.result);
  }

  async getAttemptReview(attemptId: string, userId: string) {
    const attempt = await this.attemptsRepository.findOne({
      where: { id: attemptId, user: { id: userId } },
      relations: [
        'exam',
        'exam.questions',
        'exam.questions.options',
        'exam.questions.supportingTexts',
        'responses',
        'responses.question',
      ],
    });

    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    const responseMap = new Map(
      attempt.responses.map((response) => [response.question.id, response]),
    );

    const reviewQuestions = attempt.exam.questions.map((question) => {
      const response = responseMap.get(question.id);
      const correctOption = question.options?.find(
        (option) => option.isCorrect,
      );
      return {
        id: question.id,
        text: question.text,
        area: question.area,
        subarea: question.subarea,
        explanation: question.explanation,
        options: question.options,
        supportingTexts: question.supportingTexts,
        correctOptionId: correctOption?.id,
        selectedOptionId: response?.selectedOptionId,
      };
    });

    return {
      attemptId: attempt.id,
      simulado: {
        id: attempt.exam.id,
        title: attempt.exam.title,
      },
      questions: reviewQuestions,
    };
  }

  async getUserAttemptHistory(userId: string, query: PaginationQueryDto) {
    const take = query.limit ?? 20;
    const skip = query.offset ?? 0;

    const [items, total] = await this.attemptsRepository.findAndCount({
      where: { user: { id: userId }, status: AttemptStatus.COMPLETED },
      relations: ['exam', 'result'],
      order: { submittedAt: 'DESC' },
      take,
      skip,
    });

    const history = items.map((attempt) => ({
      attemptId: attempt.id,
      simuladoTitle: attempt.exam.title,
      percentage: attempt.result?.percentage ?? 0,
      submittedAt: attempt.submittedAt,
    }));

    return {
      items: history,
      pagination: { total, limit: take, offset: skip },
    };
  }

  async getUserResultsSummary(userId: string) {
    const attempts = await this.attemptsRepository.find({
      where: { user: { id: userId }, status: AttemptStatus.COMPLETED },
      relations: ['result'],
    });

    if (!attempts.length) {
      return {
        averagePercentage: 0,
        bestPercentage: 0,
        totalCompleted: 0,
      };
    }

    const percentages = attempts.map(
      (attempt) => attempt.result?.percentage ?? 0,
    );
    const totalCompleted = attempts.length;
    const averagePercentage =
      percentages.reduce((sum, item) => sum + item, 0) / totalCompleted;
    const bestPercentage = Math.max(...percentages);

    return {
      averagePercentage,
      bestPercentage,
      totalCompleted,
    };
  }

  private calculateBreakdown(
    questions: Question[],
    responses: AttemptResponse[],
  ) {
    const multipleChoiceQuestions = questions.filter(
      (question) => question.type !== QuestionType.ESSAY,
    );
    const responseMap = new Map(
      responses.map((response) => [response.question.id, response]),
    );

    const subjectMap = new Map<string, { correct: number; total: number }>();

    multipleChoiceQuestions.forEach((question) => {
      const key = question.subarea ?? question.area;
      if (!subjectMap.has(key)) {
        subjectMap.set(key, { correct: 0, total: 0 });
      }

      const stats = subjectMap.get(key)!;
      stats.total += 1;
      const response = responseMap.get(question.id);
      if (response?.isCorrect) {
        stats.correct += 1;
      }
    });

    const subjects: SubjectBreakdown[] = Array.from(subjectMap.entries()).map(
      ([name, { correct, total }]) => ({
        name,
        correctCount: correct,
        totalCount: total,
        percentage: total > 0 ? (correct / total) * 100 : 0,
      }),
    );

    const sortedSubjects = [...subjects].sort(
      (a, b) => b.percentage - a.percentage,
    );
    const strengths = sortedSubjects.slice(
      0,
      Math.min(3, Math.ceil(sortedSubjects.length / 2)),
    );
    const weaknesses = [...sortedSubjects]
      .reverse()
      .slice(0, Math.min(3, Math.ceil(sortedSubjects.length / 2)));

    const totalScore = subjects.reduce(
      (sum, subject) => sum + subject.correctCount,
      0,
    );

    return {
      subjects,
      strengths,
      weaknesses,
      totalScore,
      totalQuestions: multipleChoiceQuestions.length,
    };
  }

  private buildPayload(
    attempt: Attempt,
    result: AttemptResult,
  ): AttemptResultPayload {
    return {
      attemptId: attempt.id,
      simulado: {
        id: attempt.exam.id,
        title: attempt.exam.title,
        durationMinutes: attempt.exam.durationMinutes,
      },
      summary: {
        totalScore: result.totalScore,
        totalQuestions: result.totalQuestions,
        percentage: result.percentage,
        totalTimeSeconds: result.totalTimeSeconds,
        averageTimePerQuestion: result.averageTimePerQuestion,
      },
      subjects: result.subjects,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
    };
  }

  private async updateUserMetrics(userId: string, result: AttemptResult) {
    const user = await this.usersService.findById(userId);
    const completedAttempts = (user.metrics?.completedAttempts ?? 0) + 1;
    const previousAverage = user.metrics?.averageScore ?? 0;
    const averageScore =
      user.metrics?.completedAttempts && user.metrics.completedAttempts > 0
        ? (previousAverage * user.metrics.completedAttempts +
            result.percentage) /
          completedAttempts
        : result.percentage;

    await this.usersService.upsertMetrics(userId, {
      completedAttempts,
      averageScore,
    });
  }
}
