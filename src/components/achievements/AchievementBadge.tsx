/**
 * AchievementBadge Component
 * Individual animated badge display
 */

'use client';

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/Progress';
import { rarityStyles, badgeSizes } from './styles';
import type { AchievementWithProgress } from './types';

export interface AchievementBadgeProps {
  achievement: AchievementWithProgress;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  onClick?: () => void;
  className?: string;
}

export function AchievementBadge({
  achievement,
  size = 'md',
  showProgress = true,
  onClick,
  className,
}: AchievementBadgeProps) {
  const { unlocked, progress, rarity } = achievement;
  const styles = rarityStyles[rarity];
  const sizes = badgeSizes;

  return (
    <motion.div
      className={cn('flex flex-col items-center gap-2', className)}
      whileHover={unlocked ? { scale: 1.05 } : undefined}
      whileTap={unlocked ? { scale: 0.95 } : undefined}
    >
      <motion.button
        onClick={onClick}
        disabled={!onClick}
        className={cn(
          'relative rounded-2xl flex items-center justify-center transition-all duration-300',
          sizes[size].container,
          unlocked
            ? cn(
                'border-2',
                styles.border,
                styles.bg,
                'shadow-lg',
                styles.glow,
                'cursor-pointer'
              )
            : 'border border-[var(--border-default)] bg-[var(--bg-secondary)] opacity-50 cursor-default'
        )}
        aria-label={unlocked ? achievement.nameHe : `${achievement.nameHe} (נעול)`}
      >
        {/* Shine effect for unlocked legendary badges */}
        {unlocked && rarity === 'legendary' && (
          <motion.div
            className="absolute inset-0 rounded-2xl overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
              animate={{ x: ['-200%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            />
          </motion.div>
        )}

        {/* Badge icon */}
        {unlocked ? (
          <span className={cn(sizes[size].icon, 'relative z-10')}>
            {achievement.icon}
          </span>
        ) : (
          <Lock className="w-6 h-6 text-[var(--text-muted)]" />
        )}

        {/* Rarity indicator dot */}
        <div
          className={cn(
            'absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[var(--bg-primary)]',
            unlocked ? `bg-gradient-to-r ${styles.gradient}` : 'bg-gray-600'
          )}
        />
      </motion.button>

      {/* Name */}
      <span
        className={cn(
          'text-xs text-center font-medium max-w-[80px] truncate',
          unlocked ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
        )}
        title={achievement.nameHe}
      >
        {achievement.nameHe}
      </span>

      {/* Progress bar (only for locked badges) */}
      {showProgress && !unlocked && progress > 0 && (
        <div className={cn('w-full', sizes[size].badge)}>
          <Progress value={progress} size="sm" variant="default" />
        </div>
      )}
    </motion.div>
  );
}
