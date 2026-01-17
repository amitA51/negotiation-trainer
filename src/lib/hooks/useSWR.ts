"use client";

import useSWR, { type SWRConfiguration } from "swr";
import {
  getUserStats,
  getUserSessions,
  getActiveSession,
  getSession,
  getMessages,
  getConsultation,
  getConsultationMessages,
  getAnalysis,
} from "@/lib/firebase/firestore";
import type { UserStats, Session, Message, Consultation, SessionAnalysis } from "@/types";

// Default SWR configuration with error handling
const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 5000,
  errorRetryCount: 3,
  onError: (error) => {
    console.error("SWR Error:", error);
  },
};

// Fallback data for better UX
const emptyStats: UserStats = {
  totalTrainingSessions: 0,
  totalConsultations: 0,
  avgScore: 0,
  techniquesUsed: {},
  scoresHistory: [],
  strongTechniques: [],
  weakTechniques: [],
};

/**
 * Hook to fetch user stats with SWR caching
 */
export function useUserStats(userId: string | undefined) {
  return useSWR<UserStats | null>(
    userId ? ["userStats", userId] : null,
    () => getUserStats(userId!),
    {
      ...defaultConfig,
      revalidateIfStale: true,
      refreshInterval: 60000, // Refresh every minute
      fallbackData: emptyStats as UserStats | null, // Provide fallback data while loading
    }
  );
}

/**
 * Hook to fetch user sessions (history) with SWR caching
 */
export function useUserSessions(userId: string | undefined, limitCount: number = 20) {
  return useSWR<Session[]>(
    userId ? ["userSessions", userId, limitCount] : null,
    () => getUserSessions(userId!, limitCount),
    {
      ...defaultConfig,
      revalidateIfStale: true,
      refreshInterval: 30000, // Refresh every 30 seconds
      fallbackData: [], // Empty array fallback
    }
  );
}

/**
 * Hook to fetch active session with SWR caching
 */
export function useActiveSession(userId: string | undefined) {
  return useSWR<Session | null>(
    userId ? ["activeSession", userId] : null,
    () => getActiveSession(userId!),
    {
      ...defaultConfig,
      revalidateIfStale: true,
      refreshInterval: 30000, // Refresh every 30 seconds
      fallbackData: null,
    }
  );
}

/**
 * Hook to fetch a specific session with SWR caching
 */
export function useSession(sessionId: string | undefined) {
  return useSWR<Session | null>(
    sessionId ? ["session", sessionId] : null,
    () => getSession(sessionId!),
    {
      ...defaultConfig,
      revalidateIfStale: false, // Session data rarely changes
      fallbackData: null,
    }
  );
}

/**
 * Hook to fetch session messages with SWR caching
 */
export function useMessages(sessionId: string | undefined) {
  return useSWR<Message[]>(
    sessionId ? ["messages", sessionId] : null,
    () => getMessages(sessionId!),
    {
      ...defaultConfig,
      revalidateIfStale: true,
      refreshInterval: 5000, // Refresh every 5 seconds during active chat
      fallbackData: [],
    }
  );
}

/**
 * Hook to fetch consultation with SWR caching
 */
export function useConsultation(consultationId: string | undefined) {
  return useSWR<Consultation | null>(
    consultationId ? ["consultation", consultationId] : null,
    () => getConsultation(consultationId!),
    {
      ...defaultConfig,
      revalidateIfStale: false, // Consultation data rarely changes
      fallbackData: null,
    }
  );
}

/**
 * Hook to fetch consultation messages with SWR caching
 */
export function useConsultationMessages(consultationId: string | undefined) {
  return useSWR<Message[]>(
    consultationId ? ["consultationMessages", consultationId] : null,
    () => getConsultationMessages(consultationId!),
    {
      ...defaultConfig,
      revalidateIfStale: true,
      refreshInterval: 5000, // Refresh every 5 seconds during active chat
      fallbackData: [],
    }
  );
}

/**
 * Hook to fetch session analysis with SWR caching
 */
export function useSessionAnalysis(sessionId: string | undefined) {
  return useSWR<SessionAnalysis | null>(
    sessionId ? ["analysis", sessionId] : null,
    () => getAnalysis(sessionId!),
    {
      ...defaultConfig,
      revalidateIfStale: false, // Analysis doesn't change once created
      fallbackData: null,
    }
  );
}

/**
 * Hook for dashboard data (stats + active session combined)
 * Optimized to prevent unnecessary re-renders
 */
export function useDashboardData(userId: string | undefined) {
  const stats = useUserStats(userId);
  const activeSession = useActiveSession(userId);

  return {
    stats: stats.data,
    activeSession: activeSession.data,
    loading: stats.isLoading || activeSession.isLoading,
    error: stats.error || activeSession.error,
    mutateStats: stats.mutate,
    mutateActiveSession: activeSession.mutate,
    isValidating: stats.isValidating || activeSession.isValidating,
  };
}
