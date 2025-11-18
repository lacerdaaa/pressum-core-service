import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { AttemptsService } from './attempts.service';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { SaveResponsesDto } from './dto/save-responses.dto';
import { SaveEssayDto } from './dto/save-essay.dto';
import { FinishAttemptDto } from './dto/finish-attempt.dto';

@Controller()
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('simulados/:examId/attempts')
  startAttempt(
    @Param('examId') examId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAttemptDto,
  ) {
    return this.attemptsService.startAttempt(examId, user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('attempts/:attemptId')
  getAttempt(
    @Param('attemptId') attemptId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.attemptsService.getAttempt(attemptId, user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('attempts/:attemptId/responses')
  saveResponses(
    @Param('attemptId') attemptId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SaveResponsesDto,
  ) {
    return this.attemptsService.saveResponses(attemptId, user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('attempts/:attemptId/essay')
  saveEssay(
    @Param('attemptId') attemptId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SaveEssayDto,
  ) {
    return this.attemptsService.saveEssay(attemptId, user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('attempts/:attemptId/finish')
  finishAttempt(
    @Param('attemptId') attemptId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: FinishAttemptDto,
  ) {
    return this.attemptsService.finishAttempt(attemptId, user.sub, dto);
  }
}
