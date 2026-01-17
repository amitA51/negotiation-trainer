import { z } from 'zod';

/**
 * ==========================================
 * 🛡️ API REQUEST VALIDATION SCHEMAS
 * ==========================================
 * Centralized Zod schemas for all API endpoints
 * Prevents injection attacks and ensures data integrity
 */

// ==========================================
// SHARED SCHEMAS
// ==========================================

export const MessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1, 'Message cannot be empty').max(10000, 'Message too long'),
  timestamp: z.number().optional(),
});

export const DifficultySchema = z.number().int().min(1).max(8);

export const AIModelSchema = z.enum([
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-2.0-flash-exp',
  'gemini-2.5-flash',
]);

// ==========================================
// /api/chat - Chat Endpoint
// ==========================================

export const ChatRequestSchema = z.object({
  message: z
    .string()
    .min(1, 'Message is required')
    .max(5000, 'Message exceeds maximum length (5000 chars)'),
  
  history: z
    .array(MessageSchema)
    .max(100, 'History too long (max 100 messages)')
    .default([]),
  
  mode: z.enum(['training', 'consultation', 'simulation']).default('training'),
  
  difficulty: DifficultySchema.optional(),
  
  scenarioId: z.string().optional(),
  
  model: AIModelSchema.optional(),
  
  sessionId: z.string().uuid('Invalid session ID').optional(),
  
  consultationId: z.string().uuid('Invalid consultation ID').optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

// ==========================================
// /api/analyze - Post-session Analysis
// ==========================================

export const AnalyzeRequestSchema = z.object({
  messages: z
    .array(MessageSchema)
    .min(2, 'Need at least 2 messages to analyze')
    .max(200, 'Too many messages to analyze'),
  
  sessionId: z.string().uuid('Invalid session ID'),
  
  difficulty: DifficultySchema,
  
  scenarioId: z.string().min(1, 'Scenario ID required'),
  
  model: AIModelSchema.optional(),
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

// ==========================================
// /api/telegram - Telegram Bot Webhook
// ==========================================

export const TelegramUpdateSchema = z.object({
  update_id: z.number(),
  message: z
    .object({
      message_id: z.number(),
      from: z.object({
        id: z.number(),
        first_name: z.string(),
        last_name: z.string().optional(),
        username: z.string().optional(),
      }),
      chat: z.object({
        id: z.number(),
        type: z.enum(['private', 'group', 'supergroup', 'channel']),
      }),
      text: z.string().max(4096).optional(),
      date: z.number(),
    })
    .optional(),
  
  callback_query: z
    .object({
      id: z.string(),
      from: z.object({
        id: z.number(),
        first_name: z.string(),
      }),
      message: z.any().optional(),
      data: z.string(),
    })
    .optional(),
});

export type TelegramUpdate = z.infer<typeof TelegramUpdateSchema>;

// ==========================================
// /api/telegram/pairing - Pairing Code
// ==========================================

export const PairingCodeRequestSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

export const WebhookSetupRequestSchema = z.object({
  secret: z.string().min(8, 'Secret too short'),
  url: z.string().url('Invalid webhook URL').optional(),
});

export type PairingCodeRequest = z.infer<typeof PairingCodeRequestSchema>;
export type WebhookSetupRequest = z.infer<typeof WebhookSetupRequestSchema>;

// ==========================================
// FIRESTORE SCHEMAS (for data integrity)
// ==========================================

export const SessionSchema = z.object({
  userId: z.string().uuid(),
  scenarioId: z.string(),
  difficulty: DifficultySchema,
  status: z.enum(['active', 'paused', 'completed']),
  startTime: z.any(), // Firestore Timestamp
  endTime: z.any().optional(),
  messageCount: z.number().int().min(0).default(0),
  aiModel: AIModelSchema.optional(),
});

export const UserStatsSchema = z.object({
  userId: z.string().uuid(),
  totalSessions: z.number().int().min(0).default(0),
  totalMessages: z.number().int().min(0).default(0),
  averageScore: z.number().min(0).max(100).default(0),
  techniquesUsed: z.array(z.string()).default([]),
  lastActiveAt: z.any(),
});

export const ConsultationSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(5000),
  status: z.enum(['active', 'resolved', 'archived']),
  createdAt: z.any(),
  aiModel: AIModelSchema.optional(),
});

// ==========================================
// VALIDATION HELPER FUNCTIONS
// ==========================================

/**
 * Validate and parse request body with Zod schema
 * @throws {Error} If validation fails
 */
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      throw new Error(`Validation failed: ${errorMessages}`);
    }
    throw new Error('Invalid request body');
  }
}

/**
 * Safe parse with default error handling
 */
export function safeParse<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errorMessage = result.error.issues
    .map((err) => `${err.path.join('.')}: ${err.message}`)
    .join(', ');
  
  return { success: false, error: errorMessage };
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
