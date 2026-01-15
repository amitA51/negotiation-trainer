"use client";

import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button, Card } from "@/components/ui";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="text-center p-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-red-500/20">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            משהו השתבש
          </h2>
          <p className="text-[var(--text-secondary)] mb-4">
            אירעה שגיאה בטעינת הדף. נסה לרענן או לחזור אחורה.
          </p>
          {this.state.error && (
            <p className="text-xs text-[var(--text-muted)] font-mono mb-4 p-2 bg-[var(--bg-secondary)] rounded">
              {this.state.error.message}
            </p>
          )}
          <div className="flex gap-2 justify-center">
            <Button
              variant="primary"
              onClick={this.handleReset}
              icon={<RefreshCw size={18} />}
            >
              נסה שוב
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.history.back()}
            >
              חזור אחורה
            </Button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}
