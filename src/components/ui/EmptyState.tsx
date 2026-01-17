/**
 * EmptyState Component
 * Displays empty state message with optional action
 * Based on react-ui-patterns skill
 */

'use client';

import { ReactNode } from 'react';
import { LucideIcon, Package, Search, FileText, Users, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  /** Title of the empty state */
  title: string;
  /** Description text */
  description?: string;
  /** Icon component to display */
  icon?: LucideIcon;
  /** Preset icon type */
  iconType?: 'default' | 'search' | 'files' | 'users' | 'achievements';
  /** Primary action button */
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
  };
  /** Additional content below the action */
  children?: ReactNode;
  className?: string;
}

const iconPresets: Record<string, LucideIcon> = {
  default: Package,
  search: Search,
  files: FileText,
  users: Users,
  achievements: Trophy,
};

export function EmptyState({
  title,
  description,
  icon: CustomIcon,
  iconType = 'default',
  action,
  children,
  className,
}: EmptyStateProps) {
  const Icon = CustomIcon || iconPresets[iconType];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-6',
        className
      )}
    >
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[var(--text-muted)]" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-6">
          {description}
        </p>
      )}

      {/* Action button */}
      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
          className="mb-4"
        >
          {action.label}
        </Button>
      )}

      {/* Additional content */}
      {children}
    </div>
  );
}

// Pre-configured empty states for common scenarios
export function SearchEmptyState({ query }: { query?: string }) {
  return (
    <EmptyState
      iconType="search"
      title="לא נמצאו תוצאות"
      description={query ? `לא נמצאו תוצאות עבור "${query}". נסה חיפוש אחר.` : 'נסה לחפש משהו אחר'}
    />
  );
}

export function NoDataEmptyState({
  title = 'אין נתונים',
  description = 'עדיין אין נתונים להצגה',
  action,
}: {
  title?: string;
  description?: string;
  action?: EmptyStateProps['action'];
}) {
  return (
    <EmptyState
      iconType="default"
      title={title}
      description={description}
      action={action}
    />
  );
}

export function NoSessionsEmptyState({ onStart }: { onStart: () => void }) {
  return (
    <EmptyState
      iconType="files"
      title="אין אימונים עדיין"
      description="התחל את האימון הראשון שלך כדי לשפר את יכולות המשא ומתן"
      action={{
        label: 'התחל אימון',
        onClick: onStart,
      }}
    />
  );
}

export function NoAchievementsEmptyState({ onStart }: { onStart: () => void }) {
  return (
    <EmptyState
      iconType="achievements"
      title="עדיין אין הישגים"
      description="התחל להתאמן כדי לפתוח הישגים!"
      action={{
        label: 'התחל עכשיו',
        onClick: onStart,
      }}
    />
  );
}
