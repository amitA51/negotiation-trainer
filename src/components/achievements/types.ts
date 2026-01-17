/**
 * Achievement Types
 */

import type { Achievement } from '@/data/achievements';

export interface AchievementWithProgress extends Achievement {
  progress: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface UserAchievementStats {
  totalPoints: number;
  level: number;
  totalUnlocked: number;
  streak: number;
  longestStreak: number;
}
