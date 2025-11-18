import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { PlanStatus, UserPlan } from '../../../common/enums/plan.enum';

export class UpdateUserPlanDto {
  @IsEnum(UserPlan)
  plan: UserPlan;

  @IsEnum(PlanStatus)
  planStatus: PlanStatus;

  @IsOptional()
  @IsDateString()
  planStartDate?: string;
}
