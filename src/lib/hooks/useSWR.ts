"use client";

import useSWR from "swr";
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

// Default SWR configuration
const defaultConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 5000, // 5 seconds
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
    }
  );
}

/**
 * Hook to fetch user sessions (history) with SWR caching
 */
export function useUserSessions(userId: string | undefined, limitCount: number = 50) {
  return useSWR<Session[]>(
    userId ? ["userSessions", userId, limitCount] : null,
    () => getUserSessions(userId!, limitCount),
    {
      ...defaultConfig,
      revalidateIfStale: true,
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
    }
  );
}

/**
 * Hook for dashboard data (stats + active session combined)
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
  };
}
