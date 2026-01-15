// User Types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
  telegramChatId?: string | null;
  telegramUserId?: number | null;
  telegramUsername?: string | null;
  telegramLinkedAt?: Date | null;
  linkingCode?: {
    code: string;
    expiresAt: Date;
  } | null;
  settings: UserSettings;
}

export interface UserSettings {
  preferredDifficulty: number;
  notifications: boolean;
}

export interface UserStats {
  totalTrainingSessions: number;
  totalConsultations: number;
  avgScore: number;
  techniquesUsed: Record<string, number>;
  scoresHistory: ScoreEntry[];
  strongTechniques: string[];
  weakTechniques: string[];
}

export interface ScoreEntry {
  date: Date;
  score: number;
  sessionId: string;
}

// Session Types
export type SessionType = "training" | "consultation" | "simulation";
export type SessionStatus = "active" | "paused" | "completed";
export type SessionSource = "web" | "telegram";

export interface Session {
  id: string;
  userId: string;
  type: SessionType;
  difficulty: number;
  status: SessionStatus;
  startedAt: Date;
  lastActiveAt: Date;
  completedAt?: Date;
  scenario: Scenario;
  source: SessionSource;
}

export interface Scenario {
  title: string;
  description: string;
  userRole: string;
  aiRole: string;
  goal: string;
  category: ScenarioCategory;
}

export type ScenarioCategory = "salary" | "business" | "bargaining" | "everyday";

// Message Types
export type MessageRole = "user" | "ai" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  techniquesDetected?: string[];
  attachments?: Attachment[];
}

export interface Attachment {
  type: "image" | "document";
  url: string;
  name: string;
}

// Analysis Types
export interface SessionAnalysis {
  id: string;
  sessionId: string;
  score: number;
  techniquesUsed: TechniqueUsage[];
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  dealSummary: string;
  createdAt: Date;
}

export interface TechniqueUsage {
  code: string;
  example: string;
  effectiveness: number; // 1-5
}

// Consultation Types
export interface Consultation {
  id: string;
  userId: string;
  situation: string;
  status: "active" | "resolved";
  createdAt: Date;
  lastActiveAt: Date;
}

// Technique Types
export type TechniqueCategory = "tactical_empathy" | "harvard" | "psychology" | "hardball";

export interface Technique {
  code: string;
  name: string;
  nameEn: string;
  category: TechniqueCategory;
  description: string;
  examples: string[];
  whenToUse: string;
  counterTechniques: string[];
  difficulty: number; // 1-5
}

// API Response Types
export interface ChatResponse {
  message: string;
  techniquesDetected?: string[];
  isComplete?: boolean;
}

export interface AnalysisResponse {
  score: number;
  techniquesUsed: TechniqueUsage[];
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  dealSummary: string;
}
