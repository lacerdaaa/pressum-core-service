import { UserPlan } from '../../common/enums/plan.enum';

export type AiChatPlanLimits = {
  maxActiveSessions: number;
  maxMessagesPerSession: number;
  tokensLimit: number;
  models: string[];
};

export const DEFAULT_AI_CHAT_MODEL = 'gpt-4o-mini';

export const AI_CHAT_LIMITS: Record<UserPlan, AiChatPlanLimits> = {
  [UserPlan.FREE]: {
    maxActiveSessions: 1,
    maxMessagesPerSession: 5,
    tokensLimit: 2000,
    models: [DEFAULT_AI_CHAT_MODEL],
  },
  [UserPlan.PREMIUM]: {
    maxActiveSessions: 5,
    maxMessagesPerSession: 30,
    tokensLimit: 20000,
    models: [DEFAULT_AI_CHAT_MODEL, 'gpt-4o-mini', 'gpt-4o'],
  },
  [UserPlan.INTENSIVE]: {
    maxActiveSessions: 10,
    maxMessagesPerSession: 60,
    tokensLimit: 40000,
    models: [DEFAULT_AI_CHAT_MODEL, 'gpt-4o-mini', 'gpt-4o', 'gpt-4.1'],
  },
};
