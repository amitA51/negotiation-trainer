/**
 * ==========================================
 * 🏆 ACHIEVEMENTS PAGE
 * ==========================================
 * Full achievements gallery and progress display
 */

"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Trophy, ChevronRight, Star, Flame, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAchievements } from "@/lib/hooks/useAchievements";
import { getRarityLabelHe } from "@/data/achievements";
import type { AchievementWithProgress } from "@/components/achievements";

// Dynamic imports for heavy components
const TextReveal = dynamic(() => import("@/components/ui/TextReveal").then(mod => ({ default: mod.TextReveal })), {
  ssr: true,
  loading: () => <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[var(--accent)] to-[var(--accent-light)] bg-clip-text text-transparent">אוסף ההישגים שלך</span>,
});

const SpotlightCard = dynamic(() => import("@/components/ui/SpotlightCard").then(mod => ({ default: mod.SpotlightCard })), {
  ssr: true,
});

const AchievementsGallery = dynamic(() => import("@/components/achievements").then(mod => ({ default: mod.AchievementsGallery })), {
  ssr: false,
  loading: () => <Skeleton className="h-96 w-full rounded-2xl" />,
});

const AchievementDetail = dynamic(() => import("@/components/achievements").then(mod => ({ default: mod.AchievementDetail })), {
  ssr: false,
});

const AchievementProgressDisplay = dynamic(() => import("@/components/achievements").then(mod => ({ default: mod.AchievementProgressDisplay })), {
  ssr: false,
  loading: () => <Skeleton className="h-48 w-full rounded-2xl" />,
});

// Lightweight motion wrapper for progress bars
const ProgressBar = ({ percentage, color, delay = 0 }: { percentage: number; color: string; delay?: number }) => (
  <div
    className={`h-full ${color}`}
    style={{
      width: `${percentage}%`,
      transition: `width 0.8s ease-out ${delay}s`,
    }}
  />
);

export default function AchievementsPage() {
  const {
    achievements,
    stats,
    isLoading,
    unlockedCount,
    totalCount,
    progressPercentage,
    recentUnlocked,
    nextToUnlock,
  } = useAchievements();

  const [selectedAchievement, setSelectedAchievement] = useState<AchievementWithProgress | null>(null);

  // Count by rarity
  const rarityStats = {
    common: achievements.filter((a) => a.rarity === "common" && a.unlocked).length,
    rare: achievements.filter((a) => a.rarity === "rare" && a.unlocked).length,
    epic: achievements.filter((a) => a.rarity === "epic" && a.unlocked).length,
    legendary: achievements.filter((a) => a.rarity === "legendary" && a.unlocked).length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8">
      {/* Header */}
      <section className="mb-8">
        <p className="text-[var(--text-muted)] text-sm mb-2 font-medium tracking-wide uppercase">
          הישגים
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4 leading-tight">
          <TextReveal text="אוסף ההישגים שלך" gradient delay={0.1} />
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-lg">
          פתח הישגים על ידי אימונים, שיפור הציונים ושמירה על רצף. 
          <span className="text-[var(--text-primary)] font-medium"> {unlockedCount} מתוך {totalCount} נפתחו!</span>
        </p>
      </section>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Stats Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Level & Points Card */}
            <div className="lg:col-span-2">
              <AchievementProgressDisplay stats={stats} />
            </div>

            {/* Rarity Breakdown */}
            <SpotlightCard className="p-5">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-[var(--accent)]" />
                לפי נדירות
              </h3>
              <div className="space-y-3">
                {Object.entries(rarityStats).map(([rarity, count]) => {
                  const total = achievements.filter((a) => a.rarity === rarity).length;
                  const percentage = (count / total) * 100;
                  
                  const colors: Record<string, string> = {
                    common: "bg-gray-500",
                    rare: "bg-blue-500",
                    epic: "bg-purple-500",
                    legendary: "bg-amber-500",
                  };

                  return (
                    <div key={rarity} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${colors[rarity]}`} />
                      <span className="text-sm text-[var(--text-secondary)] flex-1">
                        {getRarityLabelHe(rarity as 'common' | 'rare' | 'epic' | 'legendary')}
                      </span>
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {count}/{total}
                      </span>
                      <div className="w-16 h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                        <ProgressBar percentage={percentage} color={colors[rarity]} delay={0.2} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </SpotlightCard>
          </section>

          {/* Next to Unlock */}
          {nextToUnlock.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <ChevronRight className="w-5 h-5 text-[var(--accent)] rotate-180" />
                קרוב לפתיחה
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {nextToUnlock.map((achievement) => (
                  <button
                    key={achievement.id}
                    className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-4 text-right hover:border-[var(--accent-dark)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => setSelectedAchievement(achievement)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-default)] flex items-center justify-center opacity-50">
                        <span className="text-2xl grayscale">{achievement.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-[var(--text-primary)] truncate">
                          {achievement.nameHe}
                        </h4>
                        <p className="text-xs text-[var(--text-muted)]">
                          {Math.round(achievement.progress)}% הושלם
                        </p>
                      </div>
                    </div>
                    <div className="h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[var(--accent-dark)] to-[var(--accent)]"
                        style={{
                          width: `${achievement.progress}%`,
                          transition: "width 0.8s ease-out 0.3s",
                        }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Recent Unlocked */}
          {recentUnlocked.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                נפתחו לאחרונה
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {recentUnlocked.map((achievement, index) => (
                  <button
                    key={achievement.id}
                    className="flex-shrink-0 bg-gradient-to-br from-[var(--accent-subtle)] to-[var(--bg-secondary)] border border-[var(--accent-dark)]/30 rounded-xl p-4 min-w-[140px] hover:shadow-lg hover:shadow-[var(--accent-glow)] transition-all hover:scale-105 active:scale-95 animate-fade-in"
                    onClick={() => setSelectedAchievement(achievement)}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <h4 className="font-medium text-[var(--text-primary)] text-sm truncate">
                      {achievement.nameHe}
                    </h4>
                    <p className="text-xs text-[var(--accent)]">
                      +{achievement.points} נקודות
                    </p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Full Gallery */}
          <section>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[var(--accent)]" />
              כל ההישגים
            </h2>
            <div className="bg-[var(--bg-secondary)] rounded-2xl p-6 border border-[var(--border-default)]">
              <AchievementsGallery
                achievements={achievements}
                onBadgeClick={setSelectedAchievement}
              />
            </div>
          </section>
        </>
      )}

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <AchievementDetail
          achievement={selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </div>
  );
}
