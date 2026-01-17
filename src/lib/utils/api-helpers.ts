import { NextResponse } from 'next/server';

/**
 * ==========================================
 * 🛠️ API UTILITIES & HELPERS
 * ==========================================
 * Shared utilities for API routes:
 * - Timeout handling
 * - Retry logic with exponential backoff
 * - Rate limiting
 * - Error handling
 * - Response formatting
 */

// ==========================================
// TIMEOUT HANDLING
// ==========================================

/**
 * Wraps a promise with a timeout
 * Throws TimeoutError if promise doesn't resolve in time
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new TimeoutError(errorMessage)), timeoutMs)
  );

  return Promise.race([promise, timeoutPromise]);
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

// ==========================================
// RETRY LOGIC
// ==========================================

interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: unknown) => boolean;
}

/**
 * Retries a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    shouldRetry = () => true,
  } = options;

  let lastError: unknown;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if we've exhausted attempts
      if (attempt === maxAttempts) {
        break;
      }

      // Don't retry if the error shouldn't be retried
      if (!shouldRetry(error)) {
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Exponential backoff
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError;
}

// ==========================================
// RATE LIMITING
// ==========================================

interface RateLimitConfig {
  uniqueTokenPerInterval?: number;
  interval?: number;
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple in-memory rate limiter
 * For production, use Redis or Vercel KV
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig = {}
): { success: boolean; remaining: number; reset: number } {
  const { uniqueTokenPerInterval = 10, interval = 60000 } = config;

  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  // Clean up expired entries
  if (record && now > record.resetTime) {
    rateLimitMap.delete(identifier);
  }

  if (!record || now > record.resetTime) {
    // First request or expired window
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + interval,
    });

    return {
      success: true,
      remaining: uniqueTokenPerInterval - 1,
      reset: now + interval,
    };
  }

  // Increment count
  record.count++;

  if (record.count > uniqueTokenPerInterval) {
    return {
      success: false,
      remaining: 0,
      reset: record.resetTime,
    };
  }

  return {
    success: true,
    remaining: uniqueTokenPerInterval - record.count,
    reset: record.resetTime,
  };
}

/**
 * Rate limit middleware for API routes
 */
export async function checkRateLimit(
  request: Request,
  config?: RateLimitConfig
): Promise<NextResponse | null> {
  // Get identifier (IP address or user ID)
  const identifier = request.headers.get('x-forwarded-for') || 'anonymous';

  const result = rateLimit(identifier, config);

  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((result.reset - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(config?.uniqueTokenPerInterval || 10),
          'X-RateLimit-Remaining': String(result.remaining),
          'X-RateLimit-Reset': String(Math.ceil(result.reset / 1000)),
        },
      }
    );
  }

  return null;
}

// ==========================================
// ERROR HANDLING
// ==========================================

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Format error response with proper logging
 */
export function handleAPIError(error: unknown): NextResponse {
  console.error('[API Error]', {
    error,
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });

  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof TimeoutError) {
    return NextResponse.json(
      {
        error: 'Request timeout',
        message: 'The operation took too long to complete',
      },
      { status: 504 }
    );
  }

  if (error instanceof Error && error.message.includes('Validation failed')) {
    return NextResponse.json(
      {
        error: 'Validation error',
        message: error.message,
      },
      { status: 400 }
    );
  }

  // Generic server error
  return NextResponse.json(
    {
      error: 'Internal server error',
      message: 'An unexpected error occurred',
    },
    { status: 500 }
  );
}

/**
 * Log API request/response
 */
export function logAPICall(
  endpoint: string,
  method: string,
  duration: number,
  status: number
): void {
  const log = {
    endpoint,
    method,
    duration: `${duration}ms`,
    status,
    timestamp: new Date().toISOString(),
  };

  if (status >= 500) {
    console.error('[API Error]', log);
  } else if (status >= 400) {
    console.warn('[API Warning]', log);
  } else {
    console.log('[API Success]', log);
  }
}

// ==========================================
// RESPONSE FORMATTING
// ==========================================

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

/**
 * Format successful API response
 */
export function successResponse<T>(data: T, message?: string): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Format error API response
 */
export function errorResponse(
  error: string,
  statusCode: number = 400,
  message?: string
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
      message,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

// ==========================================
// REQUEST HELPERS
// ==========================================

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Verify Telegram webhook signature
 * Prevents unauthorized webhook calls
 */
export function verifyTelegramSignature(
  request: Request,
  botToken: string
): boolean {
  const signature = request.headers.get('x-telegram-bot-api-secret-token');
  
  if (!signature) {
    return false;
  }
  
  // In production, use a secure random token stored in env
  const expectedToken = process.env.TELEGRAM_WEBHOOK_SECRET;
  
  return signature === expectedToken;
}

// ==========================================
// CLEANUP UTILITIES
// ==========================================

/**
 * Clean up old rate limit entries periodically
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}
