/**
 * AchievementDetail Component
 * Modal for displaying achievement details
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRarityColor, getRarityLabelHe } from '@/data/achievements';
import { Progress } from '@/components/ui/Progress';
import { rarityStyles } from './styles';
import type { AchievementWithProgress } from './types';

export interface AchievementDetailProps {
  achievement: AchievementWithProgress | null;
  onClose: () => void;
}

export function AchievementDetail({ achievement, onClose }: AchievementDetailProps) {
  if (!achievement) return null;

  const styles = rarityStyles[achievement.rarity];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className={cn(
            'relative w-full max-w-sm rounded-2xl border p-6',
            'bg-[var(--bg-primary)]',
            styles.border
          )}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-1 rounded-full hover:bg-[var(--bg-secondary)] transition-colors"
            aria-label="סגור"
          >
            <X className="w-5 h-5 text-[var(--text-muted)]" />
          </button>

          {/* Badge */}
          <div className="flex flex-col items-center text-center">
            <div
              className={cn(
                'w-24 h-24 rounded-2xl flex items-center justify-center mb-4',
                achievement.unlocked
                  ? cn('border-2', styles.border, styles.bg, 'shadow-xl', styles.glow)
                  : 'border border-[var(--border-default)] bg-[var(--bg-secondary)] opacity-60'
              )}
            >
              {achievement.unlocked ? (
                <span className="text-5xl">{achievement.icon}</span>
              ) : (
                <Lock className="w-10 h-10 text-[var(--text-muted)]" />
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">
              {achievement.nameHe}
            </h3>

            {/* Rarity badge */}
            <span
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium mb-4',
                styles.bg,
                'border',
                styles.border
              )}
              style={{ color: getRarityColor(achievement.rarity) }}
            >
              {getRarityLabelHe(achievement.rarity)}
            </span>

            {/* Description */}
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              {achievement.descriptionHe}
            </p>

            {/* Progress or unlock date */}
            {achievement.unlocked ? (
              <div className="flex items-center gap-2 text-sm text-[var(--success)]">
                <Sparkles className="w-4 h-4" />
                <span>נפתח!</span>
                {achievement.unlockedAt && (
                  <span className="text-[var(--text-muted)]">
                    • {new Date(achievement.unlockedAt).toLocaleDateString('he-IL')}
                  </span>
                )}
              </div>
            ) : (
              <div className="w-full">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[var(--text-muted)]">התקדמות</span>
                  <span className="text-[var(--text-secondary)]">
                    {Math.round(achievement.progress)}%
                  </span>
                </div>
                <Progress value={achievement.progress} size="md" variant="gold" />
              </div>
            )}

            {/* Points */}
            <div className="flex items-center gap-2 mt-6 text-[var(--accent)]">
              <Star className="w-4 h-4" />
              <span className="font-medium">{achievement.points} נקודות</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
