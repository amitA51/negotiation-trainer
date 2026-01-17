"use client";

import React, { Component, ReactNode, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

/**
 * ==========================================
 * 🛡️ CHAT ERROR BOUNDARY
 * ==========================================
 * Catches errors in chat components and provides
 * graceful fallback UI with recovery options
 */

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ChatErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error("[Chat Error Boundary]", {
      error,
      errorInfo,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // trackError({ error, errorInfo, context: 'chat' });

    this.setState({
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex min-h-[400px] items-center justify-center p-8">
          <div className="w-full max-w-md space-y-6 text-center">
            {/* Error Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">
                משהו השתבש בצ'אט
              </h2>
              <p className="text-sm text-gray-400">
                אירעה שגיאה בלתי צפויה במערכת הצ'אט. אנחנו עובדים על פתרון
                הבעיה.
              </p>
            </div>

            {/* Error Details (dev mode) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-right">
                <summary className="cursor-pointer text-sm font-medium text-red-400">
                  פרטי שגיאה (מצב פיתוח)
                </summary>
                <div className="mt-2 space-y-2 text-xs text-gray-400" dir="ltr">
                  <p className="font-mono text-red-400">
                    {this.state.error.name}: {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <pre className="overflow-auto rounded bg-black/30 p-2 text-left">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#C9A227] px-6 py-3 text-sm font-medium text-black transition-all hover:bg-[#D4B647] hover:scale-105"
              >
                <RefreshCw className="h-4 w-4" />
                נסה שוב
              </button>

              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" />
                טען מחדש את הדף
              </button>

              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-white/10"
              >
                <Home className="h-4 w-4" />
                חזור לדף הבית
              </Link>
            </div>

            {/* Help Text */}
            <p className="text-xs text-gray-500">
              אם הבעיה נמשכת, נסה לרענן את הדף או{" "}
              <Link href="/settings" className="text-[#C9A227] hover:underline">
                צור קשר עם התמיכה
              </Link>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Lightweight error boundary for simple cases
 */
export class SimpleErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Simple Error Boundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-center">
            <p className="text-sm text-red-400">אירעה שגיאה. אנא נסה שוב.</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

/**
 * Hook to report errors to error boundary from function components
 */
export function useErrorHandler() {
  const [, setError] = React.useState();

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}
