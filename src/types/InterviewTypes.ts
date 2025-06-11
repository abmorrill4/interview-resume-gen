
export interface BaseQuestion {
  id: string;
  text: string;
  category: string;
  required: boolean;
  condition?: {
    questionId: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'not_equals';
    value: any;
  };
}

export interface TextQuestion extends BaseQuestion {
  type: 'text' | 'textarea';
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  options: Array<{
    value: string;
    label: string;
    followUp?: string[];
  }>;
  allowMultiple?: boolean;
}

export interface RatingQuestion extends BaseQuestion {
  type: 'rating';
  scale: {
    min: number;
    max: number;
    labels?: {
      min: string;
      max: string;
    };
  };
}

export type DynamicQuestion = TextQuestion | MultipleChoiceQuestion | RatingQuestion;

export interface InterviewResponse {
  questionId: string;
  value: any;
  timestamp: Date;
}

export interface UserProfile {
  hasWorkExperience: boolean;
  experienceYears: number;
  skillsCount: number;
  educationLevel: string;
  careerGoals?: string;
}
