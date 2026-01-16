"use client";

import { useEffect, useState, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

// This needs to be a class component for error boundary functionality
// But we wrap it with functional component for hooks

export function ErrorBoundary({ children, fallback, onError }: ErrorBoundaryProps) {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorInfo: null,
  });

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setErrorState({
        hasError: true,
        error: new Error(event.message),
        errorInfo: null,
      });
      onError?.(new Error(event.message), { componentStack: "" } as React.ErrorInfo);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setErrorState({
        hasError: true,
        error: new Error(event.reason?.message || "Promise rejected"),
        errorInfo: null,
      });
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [onError]);

  const resetError = () => {
    setErrorState({ hasError: false, error: null, errorInfo: null });
  };

  if (errorState.hasError) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <ErrorFallback
        error={errorState.error}
        resetError={resetError}
      />
    );
  }

  return <>{children}</>;
}

// Default error fallback component
interface ErrorFallbackProps {
  error: Error | null;
  resetError?: () => void;
  title?: string;
  description?: string;
}

export function ErrorFallback({
  error,
  resetError,
  title = "משהו השתבש",
  description = "אירעה שגיאה בלתי צפויה. אנא נסה שוב.",
}: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = useState(false);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--error-subtle)] flex items-center justify-center">
          <AlertTriangle size={40} className="text-[var(--error)]" />
        </div>

        {/* Error Title */}
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          {title}
        </h2>

        {/* Error Description */}
        <p className="text-[var(--text-secondary)] mb-6">
          {description}
        </p>

        {/* Error Details (collapsible) */}
        {error && (
          <div className="mb-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors flex items-center gap-1 mx-auto"
            >
              <ChevronLeft
                size={16}
                className={cn(
                  "transition-transform",
                  showDetails && "-rotate-90"
                )}
              />
              {showDetails ? "הסתר פרטים" : "הצג פרטים"}
            </button>

            {showDetails && (
              <div className="mt-3 p-4 rounded-[var(--radius-md)] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-right overflow-auto max-h-40">
                <pre className="text-xs text-[var(--text-muted)] whitespace-pre-wrap">
                  {error.message}
                  {error.stack && (
                    <>
                      {"\n\n"}
                      {error.stack}
                    </>
                  )}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          {resetError && (
            <Button
              variant="primary"
              onClick={resetError}
              icon={<RefreshCw size={18} />}
            >
              נסה שוב
            </Button>
          )}
          
          <Button
            variant="secondary"
            onClick={handleReload}
            icon={<RefreshCw size={18} />}
          >
            רענן דף
          </Button>

          <Link href="/dashboard">
            <Button variant="ghost" icon={<Home size={18} />}>
              חזור הביתה
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Not Found Component
export function NotFound({
  title = "הדף לא נמצא",
  description = "הדף שחיפשת לא קיים או שהועבר.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* 404 */}
        <div className="text-8xl font-bold text-gold mb-6 animate-pulse">
          404
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          {title}
        </h2>

        {/* Description */}
        <p className="text-[var(--text-secondary)] mb-8">
          {description}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button variant="primary" icon={<Home size={18} />}>
              חזור לדף הבית
            </Button>
          </Link>

          <Button
            variant="secondary"
            onClick={() => window.history.back()}
            icon={<ChevronLeft size={18} />}
          >
            חזור אחורה
          </Button>
        </div>
      </div>
    </div>
  );
}

// Empty State Component
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12 px-6", className)}>
      {icon && (
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-muted)]">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}

      {action && (
        action.href ? (
          <Link href={action.href}>
            <Button variant="primary">{action.label}</Button>
          </Link>
        ) : (
          <Button variant="primary" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      )}
    </div>
  );
}

// Loading Error Component
export function LoadingError({
  message = "שגיאה בטעינת הנתונים",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertTriangle size={32} className="text-[var(--error)] mb-4" />
      <p className="text-[var(--text-secondary)] mb-4">{message}</p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          icon={<RefreshCw size={16} />}
        >
          נסה שוב
        </Button>
      )}
    </div>
  );
}
