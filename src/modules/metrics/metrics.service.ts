import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserMetric } from './entities/user-metric.entity';
import { UserSubjectMetric } from './entities/user-subject-metric.entity';
import { UserMistakeLog } from './entities/user-mistake-log.entity';
import { Attempt } from '../attempts/entities/attempt.entity';
import { AttemptResult } from '../results/entities/attempt-result.entity';
import { AttemptResultPayload } from '../../common/interfaces/result-analysis.interface';
import { MetricScopeType } from './enums/metric-scope.enum';
import { User } from '../users/entities/user.entity';
import { Exam } from '../exams/entities/exam.entity';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(
    @InjectRepository(UserMetric)
    private readonly userMetricsRepository: Repository<UserMetric>,
    @InjectRepository(UserSubjectMetric)
    private readonly userSubjectMetricsRepository: Repository<UserSubjectMetric>,
    @InjectRepository(UserMistakeLog)
    private readonly mistakeLogRepository: Repository<UserMistakeLog>,
    @InjectRepository(Attempt)
    private readonly attemptsRepository: Repository<Attempt>,
    @InjectRepository(AttemptResult)
    private readonly attemptResultsRepository: Repository<AttemptResult>,
  ) {}

  /**
   * Placeholder entry point that will aggregate metrics whenever an attempt is completed.
   * The implementation will populate user_metrics, user_subject_metrics, and user_mistake_logs.
   */
  async handleAttemptCompleted(
    attempt: Attempt,
    payload: AttemptResultPayload,
  ): Promise<void> {
    const userId = attempt.user?.id;
    if (!userId) {
      this.logger.warn(`handleAttemptCompleted called without user for attempt=${attempt.id}`);
      return;
    }

    try {
      await this.updateUserMetricSnapshot(userId, attempt, payload);
      await this.updateSubjectMetrics(userId, payload);
      await this.updateMistakeLogs(userId, attempt, payload);
    } catch (error) {
      this.logger.error(
        `Failed to update metrics for user=${userId} attempt=${attempt.id}`,
        error as Error,
      );
    }
  }

  private async updateUserMetricSnapshot(
    userId: string,
    attempt: Attempt,
    payload: AttemptResultPayload,
  ) {
    const scopeType = MetricScopeType.GLOBAL;
    const now = new Date();
    const existing = await this.userMetricsRepository.findOne({
      where: { user: { id: userId }, scopeType, scopeId: undefined },
    });

    const historyPoint = {
      attemptId: payload.attemptId,
      score: payload.summary.totalScore,
      percentage: payload.summary.percentage,
      totalTimeSeconds: payload.summary.totalTimeSeconds,
      submittedAt: attempt.submittedAt?.toISOString() ?? now.toISOString(),
    };

    const history = existing ? [...existing.history, historyPoint] : [historyPoint];
    const completedAttempts = history.length;
    const percentages = history.map((h) => h.percentage);
    const averageScore =
      percentages.reduce((sum, p) => sum + p, 0) / (percentages.length || 1);
    const bestScore = Math.max(...percentages);
    const trendSlope =
      percentages.length > 1
        ? percentages[percentages.length - 1] - percentages[0]
        : 0;

    const metric =
      existing ??
      this.userMetricsRepository.create({
        user: { id: userId } as User,
      });
    metric.scopeType = scopeType;
    metric.scopeId = undefined;
    metric.totalAttempts = completedAttempts;
    metric.completedAttempts = completedAttempts;
    metric.averageScore = averageScore;
    metric.bestScore = bestScore;
    metric.averageTimePerQuestion = payload.summary.averageTimePerQuestion;
    metric.trendSlope = trendSlope;
    metric.history = history.slice(-50); // keep last 50 points
    metric.strengths = payload.strengths;
    metric.weaknesses = payload.weaknesses;
    metric.subjectsSnapshot = payload.subjects;
    metric.lastAttemptId = attempt.id;
    metric.lastComputedAt = now;

    await this.userMetricsRepository.save(metric);
  }

  private async updateSubjectMetrics(
    userId: string,
    payload: AttemptResultPayload,
  ) {
    for (const subject of payload.subjects) {
      const existing = await this.userSubjectMetricsRepository.findOne({
        where: {
          user: { id: userId },
          scopeType: MetricScopeType.GLOBAL,
          scopeId: undefined,
          subject: subject.name,
        },
      });

      const metric =
        existing ??
        this.userSubjectMetricsRepository.create({
          user: { id: userId } as User,
          scopeType: MetricScopeType.GLOBAL,
          scopeId: undefined,
          subject: subject.name,
        });

      const prevCorrect = existing?.correctCount ?? 0;
      const prevTotal = existing?.totalCount ?? 0;
      metric.correctCount = prevCorrect + subject.correctCount;
      metric.totalCount = prevTotal + subject.totalCount;
      metric.latestPercentage = subject.percentage ?? 0;
      metric.trendSlope =
        existing && existing.latestPercentage
          ? (subject.percentage ?? 0) - existing.latestPercentage
          : 0;
      metric.averageTimeSeconds = payload.summary.averageTimePerQuestion ?? 0;
      metric.lastUpdatedAt = new Date();

      await this.userSubjectMetricsRepository.save(metric);
    }
  }

  private async updateMistakeLogs(
    userId: string,
    attempt: Attempt,
    payload: AttemptResultPayload,
  ) {
    const now = new Date();
    for (const subject of payload.weaknesses) {
      const incorrect = Math.max(subject.totalCount - subject.correctCount, 0);
      if (incorrect <= 0) {
        continue;
      }

      const existing = await this.mistakeLogRepository.findOne({
        where: { user: { id: userId }, subject: subject.name },
      });

      const log =
        existing ??
        this.mistakeLogRepository.create({
          user: { id: userId } as User,
          subject: subject.name,
          exam: attempt.exam ? ({ id: attempt.exam.id } as Exam) : undefined,
        });

      log.timesWrong = (log.timesWrong ?? 0) + incorrect;
      log.lastAttemptId = attempt.id;
      log.lastSeenAt = now;

      await this.mistakeLogRepository.save(log);
    }
  }
}
