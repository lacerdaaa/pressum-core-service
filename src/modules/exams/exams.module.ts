import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';
import { Exam } from './entities/exam.entity';
import { Question } from './entities/question.entity';
import { QuestionOption } from './entities/question-option.entity';
import { EssaySupportingText } from './entities/supporting-text.entity';
import { QuestionsController } from './questions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Exam,
      Question,
      QuestionOption,
      EssaySupportingText,
    ]),
  ],
  controllers: [ExamsController, QuestionsController],
  providers: [ExamsService],
  exports: [ExamsService],
})
export class ExamsModule {}
