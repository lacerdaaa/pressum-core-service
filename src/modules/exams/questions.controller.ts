import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExamsService } from './exams.service';
import { FilterQuestionsDto } from './dto/filter-questions.dto';

@UseGuards(JwtAuthGuard)
@Controller('questions')
export class QuestionsController {
  constructor(private readonly examsService: ExamsService) {}

  @Get()
  findQuestions(@Query() query: FilterQuestionsDto) {
    return this.examsService.findQuestions(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examsService.findQuestionById(id);
  }
}
