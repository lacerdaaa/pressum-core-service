import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserMetric } from './entities/user-metric.entity';
import { UserSubjectMetric } from './entities/user-subject-metric.entity';
import { UserMistakeLog } from './entities/user-mistake-log.entity';
import { Attempt } from '../attempts/entities/attempt.entity';
import { AttemptResult } from '../results/entities/attempt-result.entity';
import { AttemptResultPayload } from '../../common/interfaces/result-analysis.interface';

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
    this.logger.debug(
      `Scheduling metrics update for user=${attempt.user?.id ?? 'unknown'} attempt=${attempt.id}`,
    );
    // TODO: implement aggregation logic (global, category, version, subject-level, mistakes)
  }
}
