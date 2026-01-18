/**
 * ==========================================
 * 📊 SENTRY ERROR TRACKING UTILITIES
 * ==========================================
 * Helpers for tracking errors, events, and performance
 * in production with Sentry
 */

import * as Sentry from '@sentry/nextjs';

/** Metadata type for Sentry tracking */
type TrackingMetadata = Record<string, string | number | boolean | undefined>;

/**
 * Track error with additional context
 */
export function trackError(
  error: Error,
  context?: {
    userId?: string;
    sessionId?: string;
    action?: string;
    metadata?: TrackingMetadata;
  }
) {
  Sentry.captureException(error, {
    contexts: {
      custom: context,
    },
    tags: {
      action: context?.action,
    },
    user: context?.userId
      ? {
          id: context.userId,
        }
      : undefined,
  });
}

/**
 * Track custom event
 */
export function trackEvent(
  eventName: string,
  data?: TrackingMetadata,
  level: 'info' | 'warning' | 'error' = 'info'
) {
  Sentry.captureMessage(eventName, {
    level,
    contexts: {
      data,
    },
  });
}

/**
 * Track API error with request details
 */
export function trackAPIError(
  error: Error,
  endpoint: string,
  method: string,
  statusCode?: number,
  additionalData?: TrackingMetadata
) {
  Sentry.captureException(error, {
    tags: {
      endpoint,
      method,
      statusCode: statusCode?.toString(),
    },
    contexts: {
      request: {
        endpoint,
        method,
        statusCode,
        ...additionalData,
      },
    },
  });
}

/**
 * Track performance transaction
 */
export function trackTransaction<T>(
  name: string,
  operation: string,
  callback: () => Promise<T> | T
): Promise<T> | T {
  return Sentry.startSpan(
    {
      name,
      op: operation,
    },
    () => {
      return callback();
    }
  );
}

/**
 * Set user context
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  username?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: TrackingMetadata,
  level: 'info' | 'warning' | 'error' = 'info'
) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Track chat interaction
 */
export function trackChatInteraction(
  action: 'send_message' | 'receive_response' | 'error',
  metadata: {
    sessionId: string;
    messageCount?: number;
    duration?: number;
    model?: string;
  }
) {
  addBreadcrumb(`Chat: ${action}`, 'chat', metadata);

  if (action === 'error') {
    trackEvent('chat_error', metadata, 'error');
  }
}

/**
 * Track session lifecycle
 */
export function trackSessionLifecycle(
  event: 'start' | 'pause' | 'resume' | 'complete',
  sessionData: {
    sessionId: string;
    scenarioId?: string;
    difficulty?: number;
    messageCount?: number;
  }
) {
  trackEvent(`session_${event}`, sessionData);
  addBreadcrumb(`Session ${event}`, 'session', sessionData);
}

/**
 * Track validation errors
 */
export function trackValidationError(
  field: string,
  value: unknown,
  expectedType: string
) {
  trackEvent('validation_error', {
    field,
    value: typeof value,
    expectedType,
  }, 'warning');
}

/**
 * Track rate limit hit
 */
export function trackRateLimitHit(
  identifier: string,
  endpoint: string,
  limit: number
) {
  trackEvent('rate_limit_hit', {
    identifier,
    endpoint,
    limit,
  }, 'warning');
}

/**
 * Track Firebase errors
 */
export function trackFirebaseError(
  operation: string,
  error: Error,
  metadata?: TrackingMetadata
) {
  trackError(error, {
    action: `firebase_${operation}`,
    metadata,
  });
}

/**
 * Track AI/Gemini errors
 */
export function trackAIError(
  model: string,
  error: Error,
  metadata?: {
    prompt?: string;
    attemptNumber?: number;
  }
) {
  trackError(error, {
    action: 'ai_generation',
    metadata: {
      model,
      ...metadata,
    },
  });
}

/**
 * Measure function performance
 */
export async function measurePerformance<T>(
  label: string,
  fn: () => Promise<T> | T
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - startTime;

    addBreadcrumb(`Performance: ${label}`, 'performance', {
      duration: `${duration.toFixed(2)}ms`,
    });

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    addBreadcrumb(`Performance (failed): ${label}`, 'performance', {
      duration: `${duration.toFixed(2)}ms`,
      error: true,
    }, 'error');

    throw error;
  }
}
