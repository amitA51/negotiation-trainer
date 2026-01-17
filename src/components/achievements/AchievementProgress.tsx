/**
 * AchievementProgressDisplay Component
 * Shows user level, points, and streak stats
 */

'use client';

import { Trophy, Sparkles, Star, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { pointsForNextLevel } from '@/data/achievements';
import { Progress } from '@/components/ui/Progress';
import type { UserAchievementStats } from './types';

export interface AchievementProgressProps {
  stats: UserAchievementStats;
  className?: string;
}

export function AchievementProgressDisplay({ stats, className }: AchievementProgressProps) {
  const { totalPoints, level, totalUnlocked, streak } = stats;
  const nextLevelPoints = pointsForNextLevel(level);
  const currentLevelPoints = pointsForNextLevel(level - 1);
  const progressToNextLevel = ((totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Level card */}
      <div className="bg-gradient-to-br from-[var(--accent-subtle)] to-[var(--bg-secondary)] border border-[var(--accent-dark)]/30 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-[var(--bg-primary)]">{level}</span>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)]">רמה {level}</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {totalPoints} / {nextLevelPoints} נקודות
              </p>
            </div>
          </div>
          <Trophy className="w-8 h-8 text-[var(--accent)]" />
        </div>

        {/* Progress to next level */}
        <Progress value={progressToNextLevel} size="md" variant="gold" />
        <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
          עוד {nextLevelPoints - totalPoints} נקודות לרמה הבאה
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 text-center">
          <Sparkles className="w-5 h-5 mx-auto mb-1 text-[var(--accent)]" />
          <p className="text-2xl font-bold text-[var(--text-primary)]">{totalUnlocked}</p>
          <p className="text-xs text-[var(--text-muted)]">נפתחו</p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 text-center">
          <Star className="w-5 h-5 mx-auto mb-1 text-amber-500" />
          <p className="text-2xl font-bold text-[var(--text-primary)]">{totalPoints}</p>
          <p className="text-xs text-[var(--text-muted)]">נקודות</p>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded-xl p-4 text-center">
          <Flame className="w-5 h-5 mx-auto mb-1 text-orange-500" />
          <p className="text-2xl font-bold text-[var(--text-primary)]">{streak}</p>
          <p className="text-xs text-[var(--text-muted)]">ימי רצף</p>
        </div>
      </div>
    </div>
  );
}
