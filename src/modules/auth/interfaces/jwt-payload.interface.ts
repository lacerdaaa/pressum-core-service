import { PlanStatus, UserPlan } from '../../../common/enums/plan.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  plan: UserPlan;
  planStatus: PlanStatus;
}
