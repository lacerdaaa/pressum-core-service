import { Controller, Get, Param, UseGuards } from '@nestjs/common';
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
  ) {
    return this.aiInsightsService.generateInsights(attemptId, user.sub);
  }
}
