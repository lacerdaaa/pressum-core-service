import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPlanDto } from './dto/update-user-plan.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':id')
  updateProfile(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: JwtPayload,
  ) {
    this.ensureOwnership(id, user.sub);
    return this.usersService.updateProfile(id, dto);
  }

  @Patch(':id/plan')
  updatePlan(
    @Param('id') id: string,
    @Body() dto: UpdateUserPlanDto,
    @CurrentUser() user: JwtPayload,
  ) {
    this.ensureOwnership(id, user.sub);
    return this.usersService.updatePlan(id, dto);
  }

  @Get(':id/payments')
  getPaymentHistory(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    this.ensureOwnership(id, user.sub);
    return this.usersService.getPaymentHistory(id);
  }

  private ensureOwnership(requestedId: string, currentUserId: string) {
    if (requestedId !== currentUserId) {
      throw new ForbiddenException('You can only manage your own profile');
    }
  }
}
