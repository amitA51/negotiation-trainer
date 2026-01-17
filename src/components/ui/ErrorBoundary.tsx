/**
 * ErrorBoundary Component
 * Reusable error UI for Next.js error.tsx files
 * Based on react-ui-patterns skill
 */

'use client';

import { AlertTriangle, RefreshCw, Home, ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

export interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  /** Feature name for context */
  feature?: string;
  /** Show home button */
  showHomeButton?: boolean;
  className?: string;
}

export function ErrorBoundaryUI({
  error,
  reset,
  feature = 'זה',
  showHomeButton = true,
  className,
}: ErrorBoundaryProps) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-[400px] text-center p-6',
        className
      )}
    >
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
        משהו השתבש
      </h2>

      {/* Description */}
      <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-2">
        אירעה שגיאה בעת טעינת {feature}. נסה לרענן או לחזור לדף הבית.
      </p>

      {/* Error details in dev mode */}
      {isDev && error.message && (
        <div className="mt-2 mb-4 p-3 bg-red-500/5 border border-red-500/20 rounded-lg max-w-md">
          <code className="text-xs text-red-400 break-all" dir="ltr">
            {error.message}
          </code>
        </div>
      )}

      {/* Error digest for support */}
      {error.digest && (
        <p className="text-xs text-[var(--text-muted)] mb-4" dir="ltr">
          Error ID: {error.digest}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <Button onClick={reset} variant="primary" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          נסה שוב
        </Button>

        {showHomeButton && (
          <Button
            onClick={() => window.location.href = '/dashboard'}
            variant="secondary"
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            חזור לדף הבית
          </Button>
        )}
      </div>
    </div>
  );
}

// Simple inline error for smaller components
export function InlineError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm">
      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
      <span className="text-red-400">{message || 'אירעה שגיאה'}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mr-auto text-red-400 hover:text-red-300 underline text-xs"
        >
          נסה שוב
        </button>
      )}
    </div>
  );
}
