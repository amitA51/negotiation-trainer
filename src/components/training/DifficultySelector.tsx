/**
 * DifficultySelector Component
 * Reusable difficulty level picker with visual feedback
 */

'use client';

import { cn, getDifficultyInfo } from '@/lib/utils';
import { difficultyConfig, DIFFICULTY_LEVELS } from './constants';

interface DifficultySelectorProps {
  value: number;
  onChange: (level: number) => void;
  showDescription?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function DifficultySelector({
  value,
  onChange,
  showDescription = true,
  showLabel = true,
  className,
}: DifficultySelectorProps) {
  const difficultyInfo = getDifficultyInfo(value);

  return (
    <div className={className}>
      {showLabel && (
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-4 text-center">
          בחר את רמת הקושי של היריב שלך
        </label>
      )}

      {/* Difficulty Grid */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {DIFFICULTY_LEVELS.map((level) => {
          const isSelected = value === level;
          const IconComponent = difficultyConfig[level - 1].icon;

          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={cn(
                'aspect-square rounded-xl flex flex-col items-center justify-center transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
                isSelected
                  ? 'bg-[var(--accent)] text-black'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)]'
              )}
              aria-label={`רמת קושי ${level}: ${difficultyConfig[level - 1].label}`}
              aria-pressed={isSelected}
            >
              <IconComponent
                size={16}
                className={cn('mb-1', isSelected ? 'text-black' : 'text-[var(--text-muted)]')}
                aria-hidden="true"
              />
              <span className="text-lg font-bold">{level}</span>
            </button>
          );
        })}
      </div>

      {/* Description */}
      {showDescription && (
        <div className="mt-4 rounded-xl p-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold bg-[var(--accent)] text-black">
              {value}
            </div>
            <div className="flex-1">
              <span className={cn('text-lg font-semibold', difficultyInfo.color)}>
                {difficultyInfo.name}
              </span>
              <p className="text-[var(--text-secondary)] text-sm mt-1">
                {difficultyInfo.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact version for inline use
export function DifficultyBadge({ level }: { level: number }) {
  const info = getDifficultyInfo(level);
  const IconComponent = difficultyConfig[level - 1]?.icon;

  return (
    <div className={cn('inline-flex items-center gap-1.5 text-sm', info.color)}>
      {IconComponent && <IconComponent size={14} />}
      <span>רמה {level}</span>
    </div>
  );
}
