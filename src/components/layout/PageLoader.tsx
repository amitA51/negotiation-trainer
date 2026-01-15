"use client";

import { Spinner } from "@/components/ui";

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = "טוען..." }: PageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <div className="relative">
        <div className="absolute inset-0 blur-xl bg-[var(--accent)] opacity-20 animate-pulse" />
        <Spinner size="lg" />
      </div>
      <p className="text-[var(--text-secondary)] animate-pulse">{message}</p>
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center p-8">
      {icon && (
        <div className="p-4 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h3>
      {description && (
        <p className="text-[var(--text-secondary)] max-w-md">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
