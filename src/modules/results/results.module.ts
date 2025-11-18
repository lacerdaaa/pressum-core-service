import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attempt } from '../attempts/entities/attempt.entity';
import { AttemptResult } from './entities/attempt-result.entity';
import { AttemptResponse } from '../attempts/entities/attempt-response.entity';
import { ResultsService } from './results.service';
import { ResultsController } from './results.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attempt, AttemptResult, AttemptResponse]),
    UsersModule,
  ],
  providers: [ResultsService],
  controllers: [ResultsController],
  exports: [ResultsService],
})
export class ResultsModule {}
