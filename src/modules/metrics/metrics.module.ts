import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserMetric } from './entities/user-metric.entity';
import { UserSubjectMetric } from './entities/user-subject-metric.entity';
import { UserMistakeLog } from './entities/user-mistake-log.entity';
import { MetricsService } from './metrics.service';
import { Attempt } from '../attempts/entities/attempt.entity';
import { AttemptResult } from '../results/entities/attempt-result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserMetric,
      UserSubjectMetric,
      UserMistakeLog,
      Attempt,
      AttemptResult,
    ]),
  ],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
