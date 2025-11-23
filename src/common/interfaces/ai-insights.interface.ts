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

export interface AiInsightsPayload {
  summary: string;
  focusAreas: AiFocusArea[];
  actionPlan: AiActionItem[];
  quickWins: string[];
  practiceDrills: AiPracticeDrill[];
}

export interface AiInsightsResponse extends AiInsightsPayload {
  generatedAt?: string;
}

export interface AiQuestionSolutionPayload {
  explanation: string;
  stepByStep: string[];
  studyTips: string[];
  commonPitfalls: string[];
}

export interface AiQuestionSolutionResponse extends AiQuestionSolutionPayload {
  generatedAt: string;
}
