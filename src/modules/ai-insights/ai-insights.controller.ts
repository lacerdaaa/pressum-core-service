import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { type JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { AiInsightsService } from './ai-insights.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class AiInsightsController {
  constructor(private readonly aiInsightsService: AiInsightsService) {}

  @Get('attempts/:attemptId/insights')
  getInsights(
    @Param('attemptId') attemptId: string,
    @CurrentUser() user: JwtPayload,
    @Query('force') force?: string,
  ) {
    return this.aiInsightsService.generateInsights(attemptId, user.sub, {
      forceRefresh: force === 'true',
    });
  }

  @Get('questions/:questionId/ai-solution')
  getQuestionSolution(
    @Param('questionId') questionId: string,
    @CurrentUser() user: JwtPayload,
    @Query('force') force?: string,
  ) {
    return this.aiInsightsService.generateQuestionSolution(questionId, user, {
      forceRefresh: force === 'true',
    });
  }
}
