/**
 * ==========================================
 * 🏆 useAchievements Hook
 * ==========================================
 * State management for achievements system
 * - Real-time Firebase sync
 * - Achievement checking
 * - Progress tracking
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  doc, 
  onSnapshot, 
  getDoc,
  Unsubscribe 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ACHIEVEMENTS, 
  Achievement,
  UserAchievements,
  calculateLevel,
} from '@/data/achievements';
import { 
  getUserAchievements,
  trackSessionCompletion,
  updateUserStreak,
} from '@/lib/achievements';
import type { AchievementWithProgress, UserAchievementStats } from '@/components/achievements';

interface UseAchievementsReturn {
  // Data
  achievements: AchievementWithProgress[];
  stats: UserAchievementStats;
  
  // Loading states
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  refreshAchievements: () => Promise<void>;
  trackSession: (sessionData: {
    score: number;
    difficulty: number;
    techniquesUsed: string[];
  }) => Promise<string[]>;
  
  // Computed
  unlockedCount: number;
  totalCount: number;
  progressPercentage: number;
  recentUnlocked: AchievementWithProgress[];
  nextToUnlock: AchievementWithProgress[];
}

export function useAchievements(): UseAchievementsReturn {
  const { user } = useAuth();
  const [userAchievements, setUserAchievements] = useState<UserAchievements | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Subscribe to achievements changes
  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const achievementsRef = doc(db, 'userAchievements', user.uid);
    
    const unsubscribe: Unsubscribe = onSnapshot(
      achievementsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setUserAchievements(snapshot.data() as UserAchievements);
        } else {
          // Initialize if doesn't exist
          getUserAchievements(user.uid).then((data) => {
            if (data) setUserAchievements(data);
          });
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching achievements:', err);
        setError(err as Error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Merge ACHIEVEMENTS with user progress
  const achievements: AchievementWithProgress[] = useMemo(() => {
    return ACHIEVEMENTS.map((achievement) => {
      const userProgress = userAchievements?.achievements?.[achievement.id];
      return {
        ...achievement,
        progress: userProgress?.progress || 0,
        unlocked: userProgress?.unlocked || false,
        unlockedAt: userProgress?.unlockedAt,
      };
    });
  }, [userAchievements]);

  // Calculate stats
  const stats: UserAchievementStats = useMemo(() => {
    if (!userAchievements) {
      return {
        totalPoints: 0,
        level: 1,
        totalUnlocked: 0,
        streak: 0,
        longestStreak: 0,
      };
    }

    return {
      totalPoints: userAchievements.totalPoints || 0,
      level: userAchievements.level || 1,
      totalUnlocked: userAchievements.stats?.totalUnlocked || 0,
      streak: userAchievements.streak?.current || 0,
      longestStreak: userAchievements.streak?.longest || 0,
    };
  }, [userAchievements]);

  // Computed values
  const unlockedCount = useMemo(
    () => achievements.filter((a) => a.unlocked).length,
    [achievements]
  );

  const totalCount = ACHIEVEMENTS.length;

  const progressPercentage = useMemo(
    () => (unlockedCount / totalCount) * 100,
    [unlockedCount, totalCount]
  );

  const recentUnlocked = useMemo(
    () =>
      achievements
        .filter((a) => a.unlocked && a.unlockedAt)
        .sort((a, b) => {
          const dateA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
          const dateB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 5),
    [achievements]
  );

  const nextToUnlock = useMemo(
    () =>
      achievements
        .filter((a) => !a.unlocked && a.progress > 0)
        .sort((a, b) => b.progress - a.progress)
        .slice(0, 3),
    [achievements]
  );

  // Actions
  const refreshAchievements = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setIsLoading(true);
      const data = await getUserAchievements(user.uid);
      if (data) setUserAchievements(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  const trackSession = useCallback(
    async (sessionData: {
      score: number;
      difficulty: number;
      techniquesUsed: string[];
    }) => {
      if (!user?.uid) return [];

      try {
        const unlockedIds = await trackSessionCompletion(user.uid, {
          ...sessionData,
          timestamp: new Date(),
        });

        // Refresh to get updated data
        await refreshAchievements();

        return unlockedIds;
      } catch (err) {
        console.error('Error tracking session:', err);
        return [];
      }
    },
    [user?.uid, refreshAchievements]
  );

  return {
    achievements,
    stats,
    isLoading,
    error,
    refreshAchievements,
    trackSession,
    unlockedCount,
    totalCount,
    progressPercentage,
    recentUnlocked,
    nextToUnlock,
  };
}

/**
 * Hook for checking specific achievement progress
 */
export function useAchievementProgress(achievementId: string) {
  const { achievements } = useAchievements();
  
  const achievement = useMemo(
    () => achievements.find((a) => a.id === achievementId),
    [achievements, achievementId]
  );

  return {
    achievement,
    progress: achievement?.progress || 0,
    unlocked: achievement?.unlocked || false,
    remaining: achievement ? (100 - (achievement.progress || 0)) : 100,
  };
}

/**
 * Hook for achievement categories
 */
export function useAchievementsByCategory() {
  const { achievements } = useAchievements();

  const byCategory = useMemo(() => {
    const categories: Record<string, {
      achievements: AchievementWithProgress[];
      unlockedCount: number;
      totalCount: number;
    }> = {};

    achievements.forEach((achievement) => {
      if (!categories[achievement.category]) {
        categories[achievement.category] = {
          achievements: [],
          unlockedCount: 0,
          totalCount: 0,
        };
      }

      categories[achievement.category].achievements.push(achievement);
      categories[achievement.category].totalCount++;
      if (achievement.unlocked) {
        categories[achievement.category].unlockedCount++;
      }
    });

    return categories;
  }, [achievements]);

  return byCategory;
}
