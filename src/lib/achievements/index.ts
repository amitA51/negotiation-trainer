/**
 * ==========================================
 * 🏆 ACHIEVEMENTS SYSTEM - BACKEND LOGIC
 * ==========================================
 * Track and unlock achievements
 */

import { 
  ACHIEVEMENTS, 
  Achievement, 
  UserAchievements,
  calculateLevel,
  AchievementRarity 
} from '@/data/achievements';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  increment 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { trackEvent } from '@/lib/utils/sentry';

/**
 * Initialize achievements for new user
 */
export async function initializeUserAchievements(userId: string): Promise<void> {
  const achievementsRef = doc(db, 'userAchievements', userId);
  
  const initialAchievements: Record<string, any> = {};
  ACHIEVEMENTS.forEach((achievement) => {
    initialAchievements[achievement.id] = {
      unlocked: false,
      progress: 0,
    };
  });

  await setDoc(achievementsRef, {
    userId,
    achievements: initialAchievements,
    totalPoints: 0,
    level: 1,
    streak: {
      current: 0,
      longest: 0,
      lastActivityDate: null,
    },
    stats: {
      totalUnlocked: 0,
      commonUnlocked: 0,
      rareUnlocked: 0,
      epicUnlocked: 0,
      legendaryUnlocked: 0,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Get user achievements
 */
export async function getUserAchievements(
  userId: string
): Promise<UserAchievements | null> {
  const achievementsRef = doc(db, 'userAchievements', userId);
  const snapshot = await getDoc(achievementsRef);

  if (!snapshot.exists()) {
    // Initialize if doesn't exist
    await initializeUserAchievements(userId);
    return getUserAchievements(userId);
  }

  return snapshot.data() as UserAchievements;
}

/**
 * Check and unlock achievement
 */
export async function checkAndUnlockAchievement(
  userId: string,
  achievementId: string,
  currentProgress: number
): Promise<boolean> {
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!achievement) return false;

  const achievementsRef = doc(db, 'userAchievements', userId);
  const snapshot = await getDoc(achievementsRef);

  if (!snapshot.exists()) {
    await initializeUserAchievements(userId);
    return false;
  }

  const data = snapshot.data();
  const achievementData = data.achievements[achievementId];

  // Already unlocked
  if (achievementData?.unlocked) {
    return false;
  }

  // Check if requirement is met
  const requirementMet = currentProgress >= achievement.requirement.target;

  if (requirementMet) {
    // Unlock achievement!
    const rarityField = `${achievement.rarity}Unlocked`;
    
    await updateDoc(achievementsRef, {
      [`achievements.${achievementId}.unlocked`]: true,
      [`achievements.${achievementId}.unlockedAt`]: serverTimestamp(),
      [`achievements.${achievementId}.progress`]: 100,
      totalPoints: increment(achievement.points),
      'stats.totalUnlocked': increment(1),
      [`stats.${rarityField}`]: increment(1),
      updatedAt: serverTimestamp(),
    });

    // Calculate new level
    const newTotalPoints = (data.totalPoints || 0) + achievement.points;
    const newLevel = calculateLevel(newTotalPoints);

    if (newLevel > data.level) {
      await updateDoc(achievementsRef, {
        level: newLevel,
      });
    }

    // Track achievement unlock
    trackEvent('achievement_unlocked', {
      userId,
      achievementId,
      achievementName: achievement.nameHe,
      rarity: achievement.rarity,
      points: achievement.points,
      newLevel,
    });

    return true;
  } else {
    // Update progress
    const progressPercentage = Math.min(
      100,
      (currentProgress / achievement.requirement.target) * 100
    );

    await updateDoc(achievementsRef, {
      [`achievements.${achievementId}.progress`]: progressPercentage,
      updatedAt: serverTimestamp(),
    });

    return false;
  }
}

/**
 * Update user streak
 */
export async function updateUserStreak(userId: string): Promise<number> {
  const achievementsRef = doc(db, 'userAchievements', userId);
  const snapshot = await getDoc(achievementsRef);

  if (!snapshot.exists()) {
    await initializeUserAchievements(userId);
    return 1;
  }

  const data = snapshot.data();
  const now = new Date();
  const lastActivity = data.streak?.lastActivityDate?.toDate();

  let newStreak = 1;

  if (lastActivity) {
    const hoursSinceLastActivity =
      (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastActivity < 24) {
      // Same day - don't increment
      return data.streak.current;
    } else if (hoursSinceLastActivity < 48) {
      // Next day - increment streak
      newStreak = (data.streak.current || 0) + 1;
    } else {
      // Streak broken - reset to 1
      newStreak = 1;
    }
  }

  const newLongest = Math.max(newStreak, data.streak?.longest || 0);

  await updateDoc(achievementsRef, {
    'streak.current': newStreak,
    'streak.longest': newLongest,
    'streak.lastActivityDate': serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Check streak achievements
  await checkStreakAchievements(userId, newStreak);

  return newStreak;
}

/**
 * Check streak-based achievements
 */
async function checkStreakAchievements(
  userId: string,
  currentStreak: number
): Promise<void> {
  const streakAchievements = ACHIEVEMENTS.filter(
    (a) => a.requirement.type === 'streak'
  );

  for (const achievement of streakAchievements) {
    await checkAndUnlockAchievement(
      userId,
      achievement.id,
      currentStreak
    );
  }
}

/**
 * Track session completion and check achievements
 */
export async function trackSessionCompletion(
  userId: string,
  sessionData: {
    score: number;
    difficulty: number;
    techniquesUsed: string[];
    timestamp: Date;
  }
): Promise<string[]> {
  const unlockedAchievements: string[] = [];

  // Update streak
  await updateUserStreak(userId);

  // Get user stats
  const statsRef = doc(db, 'userStats', userId);
  const statsSnapshot = await getDoc(statsRef);
  const stats = statsSnapshot.data();

  if (!stats) return unlockedAchievements;

  // Check training count achievements
  const trainingCount = stats.totalTrainingSessions || 0;
  const trainingAchievements = ACHIEVEMENTS.filter(
    (a) => a.requirement.type === 'count' && a.requirement.metric === 'sessions'
  );

  for (const achievement of trainingAchievements) {
    const unlocked = await checkAndUnlockAchievement(
      userId,
      achievement.id,
      trainingCount
    );
    if (unlocked) unlockedAchievements.push(achievement.id);
  }

  // Check score achievements
  const scoreAchievements = ACHIEVEMENTS.filter(
    (a) => a.requirement.type === 'score'
  );

  for (const achievement of scoreAchievements) {
    const unlocked = await checkAndUnlockAchievement(
      userId,
      achievement.id,
      sessionData.score
    );
    if (unlocked) unlockedAchievements.push(achievement.id);
  }

  // Check difficulty achievements
  const difficultyAchievements = ACHIEVEMENTS.filter(
    (a) => a.requirement.type === 'difficulty'
  );

  for (const achievement of difficultyAchievements) {
    if (sessionData.difficulty >= achievement.requirement.target) {
      const unlocked = await checkAndUnlockAchievement(
        userId,
        achievement.id,
        sessionData.difficulty
      );
      if (unlocked) unlockedAchievements.push(achievement.id);
    }
  }

  // Check technique achievements
  const uniqueTechniquesCount =
    Object.keys(stats.techniquesUsed || {}).length;
  const techniqueAchievements = ACHIEVEMENTS.filter(
    (a) =>
      a.requirement.type === 'count' &&
      a.requirement.metric === 'uniqueTechniques'
  );

  for (const achievement of techniqueAchievements) {
    const unlocked = await checkAndUnlockAchievement(
      userId,
      achievement.id,
      uniqueTechniquesCount
    );
    if (unlocked) unlockedAchievements.push(achievement.id);
  }

  // Check special time-based achievements
  const hour = sessionData.timestamp.getHours();
  const isWeekend = [0, 6].includes(sessionData.timestamp.getDay());

  if (hour < 8) {
    const unlocked = await checkAndUnlockAchievement(
      userId,
      'early_bird',
      1
    );
    if (unlocked) unlockedAchievements.push('early_bird');
  }

  if (hour >= 0 && hour < 6) {
    const unlocked = await checkAndUnlockAchievement(
      userId,
      'night_owl',
      1
    );
    if (unlocked) unlockedAchievements.push('night_owl');
  }

  if (isWeekend) {
    // Track weekend sessions count
    const achievementsRef = doc(db, 'userAchievements', userId);
    const achievementsSnapshot = await getDoc(achievementsRef);
    const achievementsData = achievementsSnapshot.data();
    
    const weekendSessionsProgress =
      achievementsData?.achievements?.weekend_warrior?.progress || 0;
    const weekendSessionsCount = Math.floor((weekendSessionsProgress / 100) * 10);

    const unlocked = await checkAndUnlockAchievement(
      userId,
      'weekend_warrior',
      weekendSessionsCount + 1
    );
    if (unlocked) unlockedAchievements.push('weekend_warrior');
  }

  return unlockedAchievements;
}

/**
 * Get achievement by ID with current progress
 */
export async function getAchievementWithProgress(
  userId: string,
  achievementId: string
): Promise<(Achievement & { progress: number; unlocked: boolean }) | null> {
  const baseAchievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!baseAchievement) return null;

  const userAchievements = await getUserAchievements(userId);
  if (!userAchievements) return null;

  const userAchievement = userAchievements.achievements[achievementId];

  return {
    ...baseAchievement,
    progress: userAchievement?.progress || 0,
    unlocked: userAchievement?.unlocked || false,
    unlockedAt: userAchievement?.unlockedAt,
  };
}

/**
 * Get all achievements for user with progress
 */
export async function getAllAchievementsWithProgress(
  userId: string
): Promise<
  Array<Achievement & { progress: number; unlocked: boolean; unlockedAt?: Date }>
> {
  const userAchievements = await getUserAchievements(userId);
  if (!userAchievements) {
    return ACHIEVEMENTS.map((a) => ({ ...a, progress: 0, unlocked: false }));
  }

  return ACHIEVEMENTS.map((achievement) => {
    const userAchievement =
      userAchievements.achievements[achievement.id];

    return {
      ...achievement,
      progress: userAchievement?.progress || 0,
      unlocked: userAchievement?.unlocked || false,
      unlockedAt: userAchievement?.unlockedAt,
    };
  });
}
