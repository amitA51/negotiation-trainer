/**
 * ==========================================
 * 🏆 ACHIEVEMENTS UI COMPONENTS
 * ==========================================
 * Complete achievement system UI
 * 
 * Components:
 * - AchievementBadge: Individual animated badge
 * - AchievementsGallery: Grid display with filtering
 * - AchievementDetail: Modal with full details
 * - AchievementProgressDisplay: Level/points/streak display
 * - AchievementNotification: Unlock toast notifications
 * - AchievementShowcase: Mini display for dashboard
 */

// Types
export type { AchievementWithProgress, UserAchievementStats } from './types';

// Components
export { AchievementBadge } from './AchievementBadge';
export type { AchievementBadgeProps } from './AchievementBadge';

export { AchievementsGallery } from './AchievementsGallery';
export type { AchievementsGalleryProps } from './AchievementsGallery';

export { AchievementDetail } from './AchievementDetail';
export type { AchievementDetailProps } from './AchievementDetail';

export { AchievementProgressDisplay } from './AchievementProgress';
export type { AchievementProgressProps } from './AchievementProgress';

export { AchievementShowcase } from './AchievementShowcase';
export type { AchievementShowcaseProps } from './AchievementShowcase';

export {
  AchievementNotificationProvider,
  useAchievementNotification,
} from './AchievementNotification';

// Re-export styles for external use if needed
export { rarityStyles, categoryLabels, badgeSizes } from './styles';
