export type QuestionType =
  | 'mcq'
  | 'numerical'
  | 'fill_in_blank'
  | 'assertion_reason'
  | 'conceptual_reasoning'
  | 'graph_based'
  | 'case_based';

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5; // 1: Basic, 2: Easy, 3: Moderate, 4: Difficult, 5: Advanced

export type MasteryBand = 'Beginner' | 'Developing' | 'Intermediate' | 'Advanced' | 'Mastered';

export interface Concept {
  id: string;
  name: string;
  description: string;
  topicId: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  chapterId: string;
  concepts: Concept[];
}

export interface Chapter {
  id: string;
  name: string;
  description: string;
  subjectId: string;
  topics: Topic[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  icon: string;
  chapters: Chapter[];
}

export interface Grade {
  id: string;
  name: string; // "Grade 10"
  subjects: Subject[];
}

export interface ConceptMastery {
  conceptId: string;
  conceptName: string;
  topicId: string;
  subjectId: string;
  score: number; // 0 - 100
  band: MasteryBand;
  totalAttempts: number;
  correctAttempts: number;
  lastPracticed: string; // ISO date
  currentDifficultyTarget: DifficultyLevel;
  streak: number;
}

export interface QuestionOption {
  id: string;
  text: string;
}

export interface GeneratedQuestion {
  id: string;
  gradeId: string;
  subjectId: string;
  chapterId: string;
  topicId: string;
  conceptId: string;
  questionType: QuestionType;
  difficulty: DifficultyLevel;
  questionText: string;
  contextText?: string; // For case-based / graph / diagram
  options?: QuestionOption[]; // For MCQ / Assertion-Reason
  correctAnswer: string;
  explanation: string;
  hint: string;
  solutionSteps: string[];
  estimatedTimeSeconds: number;
  createdAt: string;
}

export type MistakeCategory =
  | 'Conceptual misunderstanding'
  | 'Formula misuse'
  | 'Calculation error'
  | 'Unit error'
  | 'Logical reasoning error'
  | 'Misreading'
  | 'Careless mistake'
  | 'Unknown';

export interface Attempt {
  id: string;
  questionId: string;
  question: GeneratedQuestion;
  studentAnswer: string;
  isCorrect: boolean;
  timeTakenSeconds: number;
  mistakeCategory?: MistakeCategory;
  mistakeAnalysis?: string;
  masteryDelta: number;
  timestamp: string;
}

export interface MistakeRecord {
  id: string;
  attemptId: string;
  conceptId: string;
  conceptName: string;
  topicId: string;
  subjectId: string;
  questionText: string;
  studentAnswer: string;
  correctAnswer: string;
  category: MistakeCategory;
  explanation: string;
  hint: string;
  resolved: boolean;
  createdAt: string;
}

export type TestMode = 'standard' | 'adaptive' | 'weak_area' | 'revision' | 'weekly';

export interface TestConfig {
  subjectId: string;
  chapterId?: string;
  topicId?: string;
  mode: TestMode;
  questionCount: number;
  difficulty?: DifficultyLevel;
  timeLimitMinutes: number;
  grade?: string;
}

export interface TestQuestionItem {
  question: GeneratedQuestion;
  studentAnswer?: string;
  isCorrect?: boolean;
  isSkipped?: boolean;
  timeTakenSeconds?: number;
  masteryDelta?: number;
}

export interface Test {
  id: string;
  title: string;
  subjectId: string;
  chapterId?: string;
  topicId?: string;
  mode: TestMode;
  timeLimitMinutes: number;
  totalPlannedCount?: number;
  questions: TestQuestionItem[];
  score?: number;
  totalScore?: number;
  percentage?: number;
  accuracy?: number;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
  createdAt: string;
}

export interface StudyPlanItem {
  id: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  conceptId?: string;
  conceptName?: string;
  activityType: 'Practice' | 'Revision' | 'Concept Drill' | 'Test Practice';
  durationMinutes: number;
  reason: string;
  completed: boolean;
}

export interface StudyPlan {
  id: string;
  gradeId?: string;
  weekStartDate: string;
  weeklyGoal: string;
  targetExamDate?: string;
  availableHoursPerDay: number;
  items: StudyPlanItem[];
  completionPercentage: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  grade: string;
  dailyStreak: number;
  lastActiveDate: string;
  totalLearningTimeSeconds: number;
  targetExamDate: string;
  weeklyStudyHoursGoal: number;
}

export interface DashboardStats {
  overallMastery: number;
  masteryDelta: number; // e.g. +4.2%
  accuracyRate: number;
  totalQuestionsAttempted: number;
  totalStudyHours: number;
  streakDays: number;
  subjectMastery: Record<string, number>; // subjectId -> mastery
  strongConcepts: ConceptMastery[];
  weakConcepts: ConceptMastery[];
  skillDistribution: Record<string, number>; // QuestionType -> accuracy %
  difficultyPerformance: Record<DifficultyLevel, { attempted: number; correct: number }>;
  aiRecommendation: {
    title: string;
    description: string;
    actionTopicId: string;
    actionConceptId: string;
    actionSubjectId: string;
  };
  masteryTrend: ({ date: string } & Record<string, any>)[];
}

export interface SavedNote {
  id: string;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  conceptId?: string;
  conceptName?: string;
  questionText: string;
  studentAnswer?: string;
  correctAnswer: string;
  explanation: string;
  solutionSteps?: string[];
  savedAt: string;
  userNote?: string;
}
