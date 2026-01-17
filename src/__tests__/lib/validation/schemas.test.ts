/**
 * Tests for Zod validation schemas
 */

import {
  ChatRequestSchema,
  AnalyzeRequestSchema,
  MessageSchema,
  DifficultySchema,
  AIModelSchema,
  validateRequest,
  safeParse,
  sanitizeInput,
  isValidUUID,
} from '@/lib/validation/schemas';

describe('MessageSchema', () => {
  it('should validate a valid message', () => {
    const validMessage = {
      role: 'user' as const,
      content: 'Hello, world!',
      timestamp: Date.now(),
    };

    const result = MessageSchema.safeParse(validMessage);
    expect(result.success).toBe(true);
  });

  it('should reject empty content', () => {
    const invalidMessage = {
      role: 'user' as const,
      content: '',
    };

    const result = MessageSchema.safeParse(invalidMessage);
    expect(result.success).toBe(false);
  });

  it('should reject content that is too long', () => {
    const invalidMessage = {
      role: 'user' as const,
      content: 'a'.repeat(10001),
    };

    const result = MessageSchema.safeParse(invalidMessage);
    expect(result.success).toBe(false);
  });

  it('should reject invalid role', () => {
    const invalidMessage = {
      role: 'invalid',
      content: 'Hello',
    };

    const result = MessageSchema.safeParse(invalidMessage);
    expect(result.success).toBe(false);
  });
});

describe('DifficultySchema', () => {
  it('should validate valid difficulty levels', () => {
    for (let i = 1; i <= 8; i++) {
      const result = DifficultySchema.safeParse(i);
      expect(result.success).toBe(true);
    }
  });

  it('should reject difficulty < 1', () => {
    const result = DifficultySchema.safeParse(0);
    expect(result.success).toBe(false);
  });

  it('should reject difficulty > 8', () => {
    const result = DifficultySchema.safeParse(9);
    expect(result.success).toBe(false);
  });

  it('should reject non-integer difficulty', () => {
    const result = DifficultySchema.safeParse(3.5);
    expect(result.success).toBe(false);
  });
});

describe('AIModelSchema', () => {
  it('should validate supported AI models', () => {
    const models = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-2.0-flash-exp',
      'gemini-2.5-flash',
    ];

    models.forEach((model) => {
      const result = AIModelSchema.safeParse(model);
      expect(result.success).toBe(true);
    });
  });

  it('should reject unsupported models', () => {
    const result = AIModelSchema.safeParse('gpt-4');
    expect(result.success).toBe(false);
  });
});

describe('ChatRequestSchema', () => {
  it('should validate a complete chat request', () => {
    const validRequest = {
      message: 'Hello, how are you?',
      history: [
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello!' },
      ],
      mode: 'training' as const,
      difficulty: 5,
      scenarioId: 'salary-negotiation',
      model: 'gemini-2.5-flash' as const,
    };

    const result = ChatRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should apply default values', () => {
    const minimalRequest = {
      message: 'Hello',
    };

    const result = ChatRequestSchema.safeParse(minimalRequest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.history).toEqual([]);
      expect(result.data.mode).toBe('training');
    }
  });

  it('should reject message that is too long', () => {
    const invalidRequest = {
      message: 'a'.repeat(5001),
    };

    const result = ChatRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });

  it('should reject history that is too long', () => {
    const invalidRequest = {
      message: 'Hello',
      history: Array(101).fill({ role: 'user', content: 'test' }),
    };

    const result = ChatRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });

  it('should reject invalid UUID for sessionId', () => {
    const invalidRequest = {
      message: 'Hello',
      sessionId: 'not-a-uuid',
    };

    const result = ChatRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });
});

describe('AnalyzeRequestSchema', () => {
  it('should validate a complete analyze request', () => {
    const validRequest = {
      messages: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ],
      sessionId: '123e4567-e89b-12d3-a456-426614174000',
      difficulty: 5,
      scenarioId: 'salary-negotiation',
      model: 'gemini-1.5-pro' as const,
    };

    const result = AnalyzeRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('should reject with less than 2 messages', () => {
    const invalidRequest = {
      messages: [{ role: 'user', content: 'Hello' }],
      sessionId: '123e4567-e89b-12d3-a456-426614174000',
      difficulty: 5,
      scenarioId: 'test',
    };

    const result = AnalyzeRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });

  it('should reject with too many messages', () => {
    const invalidRequest = {
      messages: Array(201).fill({ role: 'user', content: 'test' }),
      sessionId: '123e4567-e89b-12d3-a456-426614174000',
      difficulty: 5,
      scenarioId: 'test',
    };

    const result = AnalyzeRequestSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });
});

describe('safeParse', () => {
  it('should return success for valid data', () => {
    const result = safeParse({ role: 'user', content: 'Hello' }, MessageSchema);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content).toBe('Hello');
    }
  });

  it('should return error for invalid data', () => {
    const result = safeParse({ role: 'invalid', content: '' }, MessageSchema);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
  });
});

describe('sanitizeInput', () => {
  it('should escape HTML characters', () => {
    const input = '<script>alert("XSS")</script>';
    const sanitized = sanitizeInput(input);
    expect(sanitized).not.toContain('<');
    expect(sanitized).not.toContain('>');
    expect(sanitized).toContain('&lt;');
    expect(sanitized).toContain('&gt;');
  });

  it('should escape quotes', () => {
    const input = '"Hello" and \'World\'';
    const sanitized = sanitizeInput(input);
    expect(sanitized).toContain('&quot;');
    expect(sanitized).toContain('&#x27;');
  });

  it('should escape forward slashes', () => {
    const input = '</script>';
    const sanitized = sanitizeInput(input);
    expect(sanitized).toContain('&#x2F;');
  });

  it('should handle empty string', () => {
    const sanitized = sanitizeInput('');
    expect(sanitized).toBe('');
  });
});

describe('isValidUUID', () => {
  it('should validate correct UUIDs', () => {
    const validUUIDs = [
      '123e4567-e89b-12d3-a456-426614174000',
      '550e8400-e29b-41d4-a716-446655440000',
      'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    ];

    validUUIDs.forEach((uuid) => {
      expect(isValidUUID(uuid)).toBe(true);
    });
  });

  it('should reject invalid UUIDs', () => {
    const invalidUUIDs = [
      'not-a-uuid',
      '123',
      '123e4567-e89b-12d3-a456',
      '123e4567-e89b-12d3-a456-426614174000-extra',
      '',
    ];

    invalidUUIDs.forEach((uuid) => {
      expect(isValidUUID(uuid)).toBe(false);
    });
  });
});

describe('validateRequest', () => {
  it('should validate and parse valid request', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        message: 'Hello',
        mode: 'training',
      }),
    } as unknown as Request;

    const result = await validateRequest(mockRequest, ChatRequestSchema);
    expect(result.message).toBe('Hello');
    expect(result.mode).toBe('training');
  });

  it('should throw error for invalid request', async () => {
    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        message: '', // Empty message - invalid
      }),
    } as unknown as Request;

    await expect(
      validateRequest(mockRequest, ChatRequestSchema)
    ).rejects.toThrow('Validation failed');
  });

  it('should throw error for malformed JSON', async () => {
    const mockRequest = {
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
    } as unknown as Request;

    await expect(
      validateRequest(mockRequest, ChatRequestSchema)
    ).rejects.toThrow('Invalid request body');
  });
});
