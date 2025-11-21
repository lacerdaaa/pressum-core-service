import {
  Body,
  Controller,
  Delete,
  Get, Param,
  Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { type JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateExamDto } from './dto/create-exam.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { FilterExamsDto } from './dto/filter-exams.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ExamsService } from './exams.service';

@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) { }

  @Get()
  findAll(@Query() query: FilterExamsDto) {
    return this.examsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateExamDto, @CurrentUser() user?: JwtPayload) {
    return this.examsService.create(dto, user?.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/questions')
  addQuestion(@Param('id') id: string, @Body() dto: CreateQuestionDto) {
    return this.examsService.addQuestion(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('questions/:questionId')
  updateQuestion(
    @Param('questionId') questionId: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.examsService.updateQuestion(questionId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('questions/:questionId')
  removeQuestion(@Param('questionId') questionId: string) {
    return this.examsService.removeQuestion(questionId);
  }
}
