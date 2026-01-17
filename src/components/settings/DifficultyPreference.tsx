/**
 * DifficultyPreference Component
 * Settings section for preferred difficulty level
 */

'use client';

import { Shield, Save } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn, getDifficultyInfo } from '@/lib/utils';

interface DifficultyPreferenceProps {
  value: number;
  onChange: (level: number) => void;
  onSave: () => void;
  saving: boolean;
}

const DIFFICULTY_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8];

export function DifficultyPreference({
  value,
  onChange,
  onSave,
  saving,
}: DifficultyPreferenceProps) {
  const difficultyInfo = getDifficultyInfo(value);

  return (
    <section
      className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 slide-up"
      style={{ animationDelay: '50ms' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center text-[var(--accent)]">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">
              רמת קושי מועדפת
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              רמה התחלתית לכל אימון חדש
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSave}
          loading={saving}
          className="text-[var(--accent)]"
          icon={<Save size={14} />}
        >
          שמור
        </Button>
      </div>

      {/* Level Selector */}
      <div
        className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-5"
        role="radiogroup"
        aria-label="בחר רמת קושי"
      >
        {DIFFICULTY_LEVELS.map((level) => {
          const levelInfo = getDifficultyInfo(level);
          return (
            <button
              key={level}
              onClick={() => onChange(level)}
              role="radio"
              aria-checked={value === level}
              aria-label={`רמה ${level}: ${levelInfo.name}`}
              className={cn(
                'aspect-square rounded-xl flex items-center justify-center transition-colors',
                value === level
                  ? 'bg-[var(--accent)] text-black'
                  : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
              )}
            >
              <span className="text-lg font-bold">{level}</span>
            </button>
          );
        })}
      </div>

      {/* Description */}
      <div
        className={cn(
          'rounded-lg p-3 text-sm',
          value <= 3
            ? 'bg-emerald-500/10 text-emerald-500'
            : value <= 5
            ? 'bg-amber-500/10 text-amber-500'
            : 'bg-red-500/10 text-red-500'
        )}
      >
        <span className="font-medium">{difficultyInfo.name}</span>
        <span className="mx-2">·</span>
        <span className="opacity-80">{difficultyInfo.description}</span>
      </div>
    </section>
  );
}
