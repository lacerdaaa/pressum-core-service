import { PlanStatus, UserPlan } from '../../../common/enums/plan.enum';
import { UserRole } from '../../../common/enums/role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  plan: UserPlan;
  planStatus: PlanStatus;
  role: UserRole;
}
