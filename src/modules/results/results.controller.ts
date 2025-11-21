import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { type JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ResultsService } from './results.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get('attempts/:attemptId/result')
  getAttemptResult(
    @Param('attemptId') attemptId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.resultsService.getAttemptResult(attemptId, user.sub);
  }

  @Get('attempts/:attemptId/review')
  getAttemptReview(
    @Param('attemptId') attemptId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.resultsService.getAttemptReview(attemptId, user.sub);
  }

  @Get('users/:userId/attempts')
  getUserHistory(
    @Param('userId') userId: string,
    @CurrentUser() user: JwtPayload,
    @Query() query: PaginationQueryDto,
  ) {
    this.assertUserAccess(userId, user.sub);
    return this.resultsService.getUserAttemptHistory(userId, query);
  }

  @Get('users/:userId/results/summary')
  getUserSummary(
    @Param('userId') userId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    this.assertUserAccess(userId, user.sub);
    return this.resultsService.getUserResultsSummary(userId);
  }

  private assertUserAccess(requestedUserId: string, currentUserId: string) {
    if (requestedUserId !== currentUserId) {
      throw new ForbiddenException('You can only access your own data');
    }
  }
}
