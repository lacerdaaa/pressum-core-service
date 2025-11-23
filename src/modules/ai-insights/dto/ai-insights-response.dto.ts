import {
  AiInsightsResponse,
  AiFocusArea,
  AiActionItem,
  AiPracticeDrill,
} from '../../../common/interfaces/ai-insights.interface';

export class AiInsightsResponseDto implements AiInsightsResponse {
  summary: string;
  focusAreas: AiFocusArea[];
  actionPlan: AiActionItem[];
  quickWins: string[];
  practiceDrills: AiPracticeDrill[];
  generatedAt?: string;
}
