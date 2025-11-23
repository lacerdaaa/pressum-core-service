export interface AiFocusArea {
  topic: string;
  reason: string;
}

export interface AiActionItem {
  title: string;
  description: string;
}

export interface AiPracticeDrill {
  title: string;
  frequency: string;
  tip: string;
}

export class AiInsightsResponseDto {
  summary: string;
  focusAreas: AiFocusArea[];
  actionPlan: AiActionItem[];
  quickWins: string[];
  practiceDrills: AiPracticeDrill[];
}
