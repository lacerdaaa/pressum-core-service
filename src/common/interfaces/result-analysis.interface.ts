export interface SubjectBreakdown {
  name: string;
  correctCount: number;
  totalCount: number;
  percentage: number;
}

export interface AttemptSummary {
  totalScore: number;
  totalQuestions: number;
  percentage: number;
  totalTimeSeconds: number;
  averageTimePerQuestion: number;
}

export interface AttemptReviewQuestion {
  questionId: string;
  text: string;
  area: string;
  subarea?: string;
  explanation?: string;
  correctOptionId?: string;
  selectedOptionId?: string;
}

export interface AttemptResultPayload {
  attemptId: string;
  simulado: {
    id: string;
    title: string;
    durationMinutes: number;
  };
  summary: AttemptSummary;
  subjects: SubjectBreakdown[];
  strengths: SubjectBreakdown[];
  weaknesses: SubjectBreakdown[];
}
