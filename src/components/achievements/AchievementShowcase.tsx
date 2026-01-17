/**
 * AchievementShowcase Component
 * Mini display of recent achievements for dashboard
 */

'use client';

import { Trophy, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AchievementBadge } from './AchievementBadge';
import type { AchievementWithProgress } from './types';

export interface AchievementShowcaseProps {
  achievements: AchievementWithProgress[];
  maxDisplay?: number;
  onViewAll?: () => void;
  className?: string;
}

export function AchievementShowcase({
  achievements,
  maxDisplay = 5,
  onViewAll,
  className,
}: AchievementShowcaseProps) {
  const recentUnlocked = achievements
    .filter((a) => a.unlocked)
    .sort((a, b) => {
      if (!a.unlockedAt || !b.unlockedAt) return 0;
      return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
    })
    .slice(0, maxDisplay);

  return (
    <div className={cn('bg-[var(--bg-secondary)] rounded-2xl p-5', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[var(--accent)]" />
          הישגים אחרונים
        </h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-[var(--accent)] hover:text-[var(--accent-light)] flex items-center gap-1"
          >
            הכל
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
        )}
      </div>

      {recentUnlocked.length > 0 ? (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {recentUnlocked.map((achievement) => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              size="sm"
              showProgress={false}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--text-muted)] text-center py-4">
          עדיין אין הישגים. התחל להתאמן!
        </p>
      )}
    </div>
  );
}
