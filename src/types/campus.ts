export type EventCategory =
  | 'Cloud & Serverless'
  | 'AI & Machine Learning'
  | 'Hackathon'
  | 'Hands-On Lab'
  | 'Community & Networking';

export type EventStatus = 'upcoming' | 'past' | 'closed';

export interface ScheduleSlot {
  time: string;
  title: string;
  speaker: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  venue: string;
  capacity: number;
  registeredCount: number;
  checkedInCount: number;
  organizerName: string;
  organizerEmail: string;
  organizerDepartment: string;
  status: EventStatus;
  imageUrl?: string;
  schedule: ScheduleSlot[];
  createdAt: string;
}

export interface CreateEventInput {
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  capacity: number;
  organizerName: string;
  organizerEmail: string;
  organizerDepartment: string;
  schedule: ScheduleSlot[];
}

export interface EventRegistration {
  id: string;
  eventId: string;
  studentName: string;
  studentEmail: string;
  studentId: string;
  department: string;
  status: 'confirmed' | 'attended';
  registeredAt: string;
}

export interface RegisterEventInput {
  studentName: string;
  studentEmail: string;
  studentId: string;
  department: string;
}

export interface StudentFeedback {
  id: string;
  eventId: string;
  studentName: string;
  studentEmail: string;
  overallRating: number;
  eventQuality: number;
  speakerQuality: number;
  learningExperience: number;
  writtenFeedback: string;
  suggestions: string;
  submittedAt: string;
}

export interface SubmitFeedbackInput {
  studentName: string;
  studentEmail: string;
  overallRating: number;
  eventQuality: number;
  speakerQuality: number;
  learningExperience: number;
  writtenFeedback: string;
  suggestions: string;
}

export interface SentimentCounts {
  positive: number;
  neutral: number;
  negative: number;
}

export interface FeedbackTheme {
  theme: string;
  mentions: number;
  sentiment: 'positive' | 'mixed' | 'negative';
}

export interface BedrockAnalyticsResult {
  eventId: string;
  source: 'bedrock' | 'demo' | 'unavailable';
  modelId: string;
  generatedAt: string | null;
  responseCount: number;
  averageOverall: number;
  averageEventQuality: number;
  averageSpeakerQuality: number;
  averageLearningExperience: number;
  sentimentCounts: SentimentCounts;
  themes: FeedbackTheme[];
  repeatedConcerns: string[];
  recommendations: string[];
  executiveSummary: string;
  unavailableReason?: string;
}

export type ReportExecutionStatus = 'SUCCEEDED' | 'RUNNING' | 'FAILED';

export interface EventReport {
  id: string;
  eventId: string;
  eventName: string;
  status: ReportExecutionStatus;
  source: 'aws-step-functions' | 'demo';
  executionArn?: string;
  generatedAt: string;
  aiSummary: string;
  feedbackAnalysis: string;
  keyRecommendations: string[];
  presignedUrl?: string;
  s3Key?: string;
  errorMessage?: string;
}

export interface HealthCheckResponse {
  ok: boolean;
  mode: 'live' | 'demo';
  endpoint: string;
  latencyMs?: number;
  service?: string;
  region?: string;
  timestamp: string;
  error?: string;
}

export type AppView =
  | 'landing'
  | 'student-dashboard'
  | 'events'
  | 'event-details'
  | 'organizer-dashboard'
  | 'create-event'
  | 'ai-insights'
  | 'reports'
  | 'architecture';

export type UserRole = 'student' | 'organizer';
