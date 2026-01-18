/**
 * Test factories for creating test data
 * Following the factory pattern for clean test data generation
 */

import type { 
  User, 
  UserStats, 
  Session, 
  Scenario, 
  Message, 
  SessionAnalysis,
  ScoreEntry 
} from '@/types';

// ==========================================
// COUNTER FOR UNIQUE IDS
// ==========================================
let idCounter = 0;
const nextId = () => `test-id-${++idCounter}`;

// ==========================================
// USER FACTORIES
// ==========================================

export function createUser(overrides: Partial<User> = {}): User {
  return {
    uid: nextId(),
    email: `test-${Date.now()}@example.com`,
    displayName: 'Test User',
    photoURL: null,
    createdAt: new Date(),
    settings: {
      preferredDifficulty: 3,
      notifications: true,
      preferredModel: 'gemini-2.5-flash',
    },
    ...overrides,
  };
}

export function createUserStats(overrides: Partial<UserStats> = {}): UserStats {
  return {
    totalTrainingSessions: 10,
    totalConsultations: 5,
    avgScore: 75,
    techniquesUsed: {
      mirroring: 5,
      labeling: 3,
      anchoring: 2,
    },
    scoresHistory: [
      createScoreEntry({ score: 70 }),
      createScoreEntry({ score: 75 }),
      createScoreEntry({ score: 80 }),
    ],
    strongTechniques: ['mirroring', 'labeling'],
    weakTechniques: ['hardball'],
    ...overrides,
  };
}

export function createScoreEntry(overrides: Partial<ScoreEntry> = {}): ScoreEntry {
  return {
    date: new Date(),
    score: 75,
    sessionId: nextId(),
    ...overrides,
  };
}

// ==========================================
// SESSION FACTORIES
// ==========================================

export function createSession(overrides: Partial<Session> = {}): Session {
  return {
    id: nextId(),
    userId: nextId(),
    type: 'training',
    difficulty: 3,
    status: 'active',
    startedAt: new Date(),
    lastActiveAt: new Date(),
    scenario: createScenario(),
    source: 'web',
    ...overrides,
  };
}

export function createScenario(overrides: Partial<Scenario> = {}): Scenario {
  return {
    title: 'משא ומתן על שכר',
    description: 'אתה עומד לנהל משא ומתן על העלאת שכר עם המנהל שלך',
    userRole: 'עובד מבקש העלאה',
    aiRole: 'מנהל חסכוני',
    goal: 'לקבל העלאה של לפחות 15%',
    category: 'salary',
    ...overrides,
  };
}

// ==========================================
// MESSAGE FACTORIES
// ==========================================

export function createMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: nextId(),
    role: 'user',
    content: 'שלום, הייתי רוצה לדבר על העלאת שכר',
    timestamp: new Date(),
    ...overrides,
  };
}

export function createMessageHistory(count: number = 4): Message[] {
  const messages: Message[] = [];
  
  for (let i = 0; i < count; i++) {
    messages.push(createMessage({
      id: nextId(),
      role: i % 2 === 0 ? 'user' : 'ai',
      content: i % 2 === 0 ? `הודעת משתמש ${i + 1}` : `תגובת AI ${i + 1}`,
      timestamp: new Date(Date.now() + i * 1000),
    }));
  }
  
  return messages;
}

// ==========================================
// ANALYSIS FACTORIES
// ==========================================

export function createSessionAnalysis(overrides: Partial<SessionAnalysis> = {}): SessionAnalysis {
  return {
    id: nextId(),
    sessionId: nextId(),
    score: 78,
    techniquesUsed: [
      { code: 'mirroring', example: 'שיקפת את דבריו', effectiveness: 4 },
      { code: 'labeling', example: 'תייגת את הרגש', effectiveness: 3 },
    ],
    strengths: ['הקשבה פעילה', 'שימוש בשאלות פתוחות'],
    improvements: ['שימוש ביותר טכניקות'],
    recommendations: ['למד את טכניקת העיגון'],
    dealSummary: 'הושגה הסכמה על העלאה של 10%',
    createdAt: new Date(),
    ...overrides,
  };
}

// ==========================================
// API REQUEST FACTORIES
// ==========================================

export function createChatRequest(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    message: 'שלום, בוא נתחיל',
    history: [],
    mode: 'training',
    difficulty: 3,
    scenario: createScenario(),
    model: 'gemini-2.5-flash',
    ...overrides,
  };
}

export function createAnalyzeRequest(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    messages: [
      { role: 'user', content: 'שלום', timestamp: Date.now() },
      { role: 'assistant', content: 'שלום, במה אוכל לעזור?', timestamp: Date.now() },
    ],
    userGoal: 'לקבל הנחה',
    difficulty: 3,
    ...overrides,
  };
}

export function createPairingRequest(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    action: 'generate',
    ...overrides,
  };
}

// ==========================================
// MOCK HELPERS
// ==========================================

export function createMockRequest(body: unknown, headers: Record<string, string> = {}): Request {
  return {
    json: jest.fn().mockResolvedValue(body),
    headers: new Headers({
      'content-type': 'application/json',
      ...headers,
    }),
  } as unknown as Request;
}

export function createMockNextRequest(
  body: unknown, 
  headers: Record<string, string> = {}
): { json: () => Promise<unknown>; headers: Headers } {
  return {
    json: async () => body,
    headers: new Headers({
      'content-type': 'application/json',
      'x-forwarded-for': '127.0.0.1',
      ...headers,
    }),
  };
}

// ==========================================
// RESET HELPER
// ==========================================

export function resetFactories(): void {
  idCounter = 0;
}
