/**
 * AchievementsGallery Component
 * Grid display of all achievement badges with filtering
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AchievementBadge } from './AchievementBadge';
import { categoryLabels } from './styles';
import type { AchievementWithProgress } from './types';
import type { AchievementCategory } from '@/data/achievements';

export interface AchievementsGalleryProps {
  achievements: AchievementWithProgress[];
  filter?: AchievementCategory | 'all' | 'unlocked' | 'locked';
  onBadgeClick?: (achievement: AchievementWithProgress) => void;
  className?: string;
}

const categories: (AchievementCategory | 'all' | 'unlocked' | 'locked')[] = [
  'all', 'unlocked', 'locked',
  'training', 'techniques', 'consistency', 'score', 'difficulty', 'special',
];

export function AchievementsGallery({
  achievements,
  filter = 'all',
  onBadgeClick,
  className,
}: AchievementsGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all' | 'unlocked' | 'locked'>(filter);

  const filteredAchievements = achievements.filter((a) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'unlocked') return a.unlocked;
    if (selectedCategory === 'locked') return !a.unlocked;
    return a.category === selectedCategory;
  });

  const groupedAchievements = filteredAchievements.reduce(
    (acc, achievement) => {
      const category = achievement.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(achievement);
      return acc;
    },
    {} as Record<AchievementCategory, AchievementWithProgress[]>
  );

  const showGrouped = selectedCategory === 'all' || selectedCategory === 'unlocked' || selectedCategory === 'locked';

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              selectedCategory === cat
                ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            )}
          >
            {cat === 'all' && 'הכל'}
            {cat === 'unlocked' && '✓ נפתחו'}
            {cat === 'locked' && '🔒 נעולים'}
            {categoryLabels[cat as AchievementCategory]?.icon}{' '}
            {categoryLabels[cat as AchievementCategory]?.label}
          </button>
        ))}
      </div>

      {/* Stats summary */}
      <div className="flex gap-4 text-sm text-[var(--text-secondary)]">
        <span>סה״כ נפתחו: {achievements.filter((a) => a.unlocked).length}/{achievements.length}</span>
        <span>•</span>
        <span>מוצגים: {filteredAchievements.length}</span>
      </div>

      {/* Badges grid */}
      {showGrouped ? (
        <div className="flex flex-col gap-8">
          {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
            <div key={category}>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)] mb-4">
                <span>{categoryLabels[category as AchievementCategory]?.icon}</span>
                <span>{categoryLabels[category as AchievementCategory]?.label}</span>
              </h3>
              <motion.div
                className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
                }}
              >
                {categoryAchievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                  >
                    <AchievementBadge
                      achievement={achievement}
                      size="sm"
                      onClick={() => onBadgeClick?.(achievement)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
          }}
        >
          {filteredAchievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            >
              <AchievementBadge
                achievement={achievement}
                size="sm"
                onClick={() => onBadgeClick?.(achievement)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty state */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12 text-[var(--text-muted)]">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>אין הישגים להצגה בקטגוריה זו</p>
        </div>
      )}
    </div>
  );
}
