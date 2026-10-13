export type InterviewType = 'technical' | 'hr' | 'behavioral' | 'academic' | 'custom';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type ExperienceLevel = 'student' | 'fresher' | 'experienced';
export type QuestionCount = 5 | 10;
export type DurationMinutes = 5 | 10 | 15;
export type InterviewStyle = 'friendly' | 'professional' | 'challenging';
export type InterviewMode = 'interview' | 'practice';

export interface InterviewConfig {
  id: string;
  subject: string;
  jobRole: string;
  interviewType: InterviewType;
  difficulty: DifficultyLevel;
  experienceLevel: ExperienceLevel;
  questionCount: QuestionCount;
  durationMinutes: DurationMinutes;
  style: InterviewStyle;
  mode: InterviewMode;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'interviewer' | 'candidate';
  text: string;
  timestamp: string;
  questionIndex?: number;
  isFollowUp?: boolean;
  isGreeting?: boolean;
  hint?: string;
}

export interface QuestionEvaluation {
  questionNumber: number;
  question: string;
  isFollowUp: boolean;
  candidateAnswer: string;
  score: number;
  factualCorrectness: string;
  feedback: string;
  modelAnswer: string;
  keyTakeaway: string;
}

export interface ScoreCriterion {
  score: number;
  comment: string;
}

export interface RecommendedTopic {
  topic: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

export interface PreparationStep {
  step: number;
  title: string;
  detail: string;
  timeframe: string;
}

export interface InterviewEvaluation {
  overallScore: number;
  scoreGrade: string;
  breakdown: {
    technicalKnowledge: ScoreCriterion;
    factualAccuracy: ScoreCriterion;
    reasoningAndProblemSolving: ScoreCriterion;
    clarityAndStructure: ScoreCriterion;
  };
  strengths: string[];
  areasForImprovement: string[];
  questionEvaluations: QuestionEvaluation[];
  recommendedTopics: RecommendedTopic[];
  preparationPlan: PreparationStep[];
  summary: string;
  evaluationTimestamp: string;
  evaluationReliability: 'high' | 'moderate' | 'limited_data';
}

export interface InterviewSession {
  id: string;
  config: InterviewConfig;
  messages: ChatMessage[];
  currentQuestionNumber: number;
  status: 'active' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt?: string;
  durationSecondsTaken: number;
  evaluation?: InterviewEvaluation;
  isDemoMode?: boolean;
}
