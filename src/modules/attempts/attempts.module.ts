import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attempt } from './entities/attempt.entity';
import { AttemptResponse } from './entities/attempt-response.entity';
import { EssaySubmission } from './entities/essay-submission.entity';
import { AttemptsService } from './attempts.service';
import { AttemptsController } from './attempts.controller';
import { Exam } from '../exams/entities/exam.entity';
import { Question } from '../exams/entities/question.entity';
import { ResultsModule } from '../results/results.module';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Attempt,
      AttemptResponse,
      EssaySubmission,
      Exam,
      Question,
      User,
    ]),
    ResultsModule,
    UsersModule,
  ],
  providers: [AttemptsService],
  controllers: [AttemptsController],
  exports: [AttemptsService],
})
export class AttemptsModule {}
