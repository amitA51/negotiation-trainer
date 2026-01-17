/**
 * Achievement Styles and Constants
 */

import type { AchievementRarity, AchievementCategory } from '@/data/achievements';

export const rarityStyles: Record<AchievementRarity, {
  gradient: string;
  glow: string;
  border: string;
  bg: string;
}> = {
  common: {
    gradient: 'from-gray-400 to-gray-500',
    glow: 'shadow-gray-500/30',
    border: 'border-gray-500/40',
    bg: 'bg-gray-500/10',
  },
  rare: {
    gradient: 'from-blue-400 to-blue-600',
    glow: 'shadow-blue-500/40',
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/10',
  },
  epic: {
    gradient: 'from-purple-400 to-purple-600',
    glow: 'shadow-purple-500/50',
    border: 'border-purple-500/40',
    bg: 'bg-purple-500/10',
  },
  legendary: {
    gradient: 'from-amber-400 via-yellow-500 to-orange-500',
    glow: 'shadow-amber-500/60',
    border: 'border-amber-500/50',
    bg: 'bg-amber-500/15',
  },
};

export const categoryLabels: Record<AchievementCategory, { label: string; icon: string }> = {
  training: { label: 'אימונים', icon: '🎯' },
  techniques: { label: 'טכניקות', icon: '🧠' },
  consistency: { label: 'רציפות', icon: '🔥' },
  score: { label: 'ציונים', icon: '⭐' },
  difficulty: { label: 'קושי', icon: '💪' },
  special: { label: 'מיוחד', icon: '🎁' },
};

export const badgeSizes = {
  sm: { container: 'w-16 h-16', icon: 'text-2xl', badge: 'w-20' },
  md: { container: 'w-20 h-20', icon: 'text-3xl', badge: 'w-24' },
  lg: { container: 'w-28 h-28', icon: 'text-5xl', badge: 'w-32' },
};
