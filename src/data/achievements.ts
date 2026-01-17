/**
 * ==========================================
 * 🏆 ACHIEVEMENTS SYSTEM - TYPES & SCHEMAS
 * ==========================================
 * Gamification system for NEGO
 */

export type AchievementCategory = 
  | 'training'      // Training milestones
  | 'techniques'    // Mastering techniques
  | 'consistency'   // Daily/weekly streaks
  | 'score'         // Score achievements
  | 'difficulty'    // Completing hard scenarios
  | 'special';      // Special achievements

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  nameHe: string;
  description: string;
  descriptionHe: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string; // Emoji or icon name
  points: number; // XP points awarded
  requirement: {
    type: 'count' | 'streak' | 'score' | 'technique' | 'difficulty' | 'custom';
    target: number;
    metric?: string; // e.g., 'sessions', 'wins', 'score'
  };
  unlocked?: boolean;
  unlockedAt?: Date;
  progress?: number; // Current progress (0-100)
}

export interface UserAchievements {
  userId: string;
  achievements: {
    [achievementId: string]: {
      unlocked: boolean;
      unlockedAt?: Date;
      progress: number;
    };
  };
  totalPoints: number;
  level: number;
  streak: {
    current: number;
    longest: number;
    lastActivityDate: Date;
  };
  stats: {
    totalUnlocked: number;
    commonUnlocked: number;
    rareUnlocked: number;
    epicUnlocked: number;
    legendaryUnlocked: number;
  };
}

/**
 * All available achievements
 */
export const ACHIEVEMENTS: Achievement[] = [
  // 🎯 TRAINING ACHIEVEMENTS
  {
    id: 'first_session',
    name: 'First Steps',
    nameHe: 'צעדים ראשונים',
    description: 'Complete your first training session',
    descriptionHe: 'השלם את סשן האימון הראשון שלך',
    category: 'training',
    rarity: 'common',
    icon: '🎯',
    points: 10,
    requirement: { type: 'count', target: 1, metric: 'sessions' },
  },
  {
    id: 'training_10',
    name: 'Dedicated Learner',
    nameHe: 'לומד מסור',
    description: 'Complete 10 training sessions',
    descriptionHe: 'השלם 10 סשני אימון',
    category: 'training',
    rarity: 'common',
    icon: '📚',
    points: 50,
    requirement: { type: 'count', target: 10, metric: 'sessions' },
  },
  {
    id: 'training_50',
    name: 'Training Master',
    nameHe: 'מאסטר אימונים',
    description: 'Complete 50 training sessions',
    descriptionHe: 'השלם 50 סשני אימון',
    category: 'training',
    rarity: 'rare',
    icon: '🎓',
    points: 200,
    requirement: { type: 'count', target: 50, metric: 'sessions' },
  },
  {
    id: 'training_100',
    name: 'Negotiation Legend',
    nameHe: 'אגדת משא ומתן',
    description: 'Complete 100 training sessions',
    descriptionHe: 'השלם 100 סשני אימון',
    category: 'training',
    rarity: 'legendary',
    icon: '👑',
    points: 500,
    requirement: { type: 'count', target: 100, metric: 'sessions' },
  },

  // 🧠 TECHNIQUE ACHIEVEMENTS
  {
    id: 'technique_5',
    name: 'Technique Explorer',
    nameHe: 'חוקר טכניקות',
    description: 'Use 5 different negotiation techniques',
    descriptionHe: 'השתמש ב-5 טכניקות משא ומתן שונות',
    category: 'techniques',
    rarity: 'common',
    icon: '🧠',
    points: 30,
    requirement: { type: 'count', target: 5, metric: 'uniqueTechniques' },
  },
  {
    id: 'technique_10',
    name: 'Technique Master',
    nameHe: 'מאסטר טכניקות',
    description: 'Use 10 different negotiation techniques',
    descriptionHe: 'השתמש ב-10 טכניקות משא ומתן שונות',
    category: 'techniques',
    rarity: 'rare',
    icon: '🎭',
    points: 100,
    requirement: { type: 'count', target: 10, metric: 'uniqueTechniques' },
  },
  {
    id: 'technique_all',
    name: 'Technique Collector',
    nameHe: 'אספן טכניקות',
    description: 'Use all 18 negotiation techniques',
    descriptionHe: 'השתמש בכל 18 טכניקות המשא ומתן',
    category: 'techniques',
    rarity: 'epic',
    icon: '💎',
    points: 300,
    requirement: { type: 'count', target: 18, metric: 'uniqueTechniques' },
  },

  // 🔥 STREAK ACHIEVEMENTS
  {
    id: 'streak_3',
    name: 'On Fire',
    nameHe: 'בוער',
    description: '3-day training streak',
    descriptionHe: 'רצף של 3 ימי אימון',
    category: 'consistency',
    rarity: 'common',
    icon: '🔥',
    points: 20,
    requirement: { type: 'streak', target: 3 },
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    nameHe: 'לוחם השבוע',
    description: '7-day training streak',
    descriptionHe: 'רצף של 7 ימי אימון',
    category: 'consistency',
    rarity: 'rare',
    icon: '⚡',
    points: 75,
    requirement: { type: 'streak', target: 7 },
  },
  {
    id: 'streak_30',
    name: 'Unstoppable',
    nameHe: 'בלתי עצר',
    description: '30-day training streak',
    descriptionHe: 'רצף של 30 ימי אימון',
    category: 'consistency',
    rarity: 'epic',
    icon: '💪',
    points: 250,
    requirement: { type: 'streak', target: 30 },
  },
  {
    id: 'streak_100',
    name: 'Iron Will',
    nameHe: 'רצון ברזל',
    description: '100-day training streak',
    descriptionHe: 'רצף של 100 ימי אימון',
    category: 'consistency',
    rarity: 'legendary',
    icon: '🛡️',
    points: 1000,
    requirement: { type: 'streak', target: 100 },
  },

  // ⭐ SCORE ACHIEVEMENTS
  {
    id: 'score_80',
    name: 'High Scorer',
    nameHe: 'כובש ניקוד',
    description: 'Achieve a score of 80+',
    descriptionHe: 'השג ציון של 80+',
    category: 'score',
    rarity: 'common',
    icon: '⭐',
    points: 25,
    requirement: { type: 'score', target: 80 },
  },
  {
    id: 'score_90',
    name: 'Near Perfect',
    nameHe: 'כמעט מושלם',
    description: 'Achieve a score of 90+',
    descriptionHe: 'השג ציון של 90+',
    category: 'score',
    rarity: 'rare',
    icon: '🌟',
    points: 100,
    requirement: { type: 'score', target: 90 },
  },
  {
    id: 'score_perfect',
    name: 'Perfection',
    nameHe: 'שלמות',
    description: 'Achieve a perfect score of 100',
    descriptionHe: 'השג ציון מושלם של 100',
    category: 'score',
    rarity: 'legendary',
    icon: '💯',
    points: 500,
    requirement: { type: 'score', target: 100 },
  },

  // 💪 DIFFICULTY ACHIEVEMENTS
  {
    id: 'hard_mode',
    name: 'Challenge Accepted',
    nameHe: 'אתגר מתקבל',
    description: 'Complete a session on difficulty 6+',
    descriptionHe: 'השלם סשן ברמת קושי 6+',
    category: 'difficulty',
    rarity: 'rare',
    icon: '💪',
    points: 75,
    requirement: { type: 'difficulty', target: 6 },
  },
  {
    id: 'expert_mode',
    name: 'Expert Negotiator',
    nameHe: 'מנהל משא ומתן מומחה',
    description: 'Complete a session on difficulty 8',
    descriptionHe: 'השלם סשן ברמת קושי 8',
    category: 'difficulty',
    rarity: 'epic',
    icon: '🏆',
    points: 200,
    requirement: { type: 'difficulty', target: 8 },
  },

  // 🎁 SPECIAL ACHIEVEMENTS
  {
    id: 'early_bird',
    name: 'Early Bird',
    nameHe: 'ציפור מוקדמת',
    description: 'Train before 8 AM',
    descriptionHe: 'תתאמן לפני 8 בבוקר',
    category: 'special',
    rarity: 'rare',
    icon: '🌅',
    points: 50,
    requirement: { type: 'custom', target: 1 },
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    nameHe: 'ינשוף לילה',
    description: 'Train after midnight',
    descriptionHe: 'תתאמן אחרי חצות',
    category: 'special',
    rarity: 'rare',
    icon: '🦉',
    points: 50,
    requirement: { type: 'custom', target: 1 },
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    nameHe: 'לוחם סוף השבוע',
    description: 'Complete 10 sessions on weekends',
    descriptionHe: 'השלם 10 סשנים בסופי שבוע',
    category: 'special',
    rarity: 'epic',
    icon: '🎮',
    points: 150,
    requirement: { type: 'count', target: 10, metric: 'weekendSessions' },
  },
];

/**
 * Calculate user level based on total points
 */
export function calculateLevel(points: number): number {
  // Level formula: sqrt(points / 50)
  // Level 1: 0-49 points
  // Level 2: 50-199 points
  // Level 3: 200-449 points
  // Level 4: 450-799 points
  // etc.
  return Math.floor(Math.sqrt(points / 50)) + 1;
}

/**
 * Calculate points needed for next level
 */
export function pointsForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel, 2) * 50;
}

/**
 * Get rarity color
 */
export function getRarityColor(rarity: AchievementRarity): string {
  switch (rarity) {
    case 'common':
      return '#9CA3AF'; // Gray
    case 'rare':
      return '#3B82F6'; // Blue
    case 'epic':
      return '#A855F7'; // Purple
    case 'legendary':
      return '#F59E0B'; // Gold
  }
}

/**
 * Get rarity label in Hebrew
 */
export function getRarityLabelHe(rarity: AchievementRarity): string {
  switch (rarity) {
    case 'common':
      return 'שכיח';
    case 'rare':
      return 'נדיר';
    case 'epic':
      return 'אפי';
    case 'legendary':
      return 'אגדי';
  }
}
