"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Target,
  TrendingUp,
  MessageSquare,
  Award,
  Calendar,
  BarChart2,
  Zap,
  Activity,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui";
import { getUserStats } from "@/lib/firebase/firestore";
import { techniques } from "@/data/techniques";
import { cn, getScoreColor } from "@/lib/utils";
import type { UserStats } from "@/types";

// Dynamically import Recharts to reduce initial bundle size
const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false, loading: () => <Skeleton className="h-full w-full rounded-xl" /> }
);
const AreaChart = dynamic(
  () => import("recharts").then((mod) => mod.AreaChart),
  { ssr: false }
);
const Area = dynamic(() => import("recharts").then((mod) => mod.Area), {
  ssr: false,
});
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), {
  ssr: false,
});
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), {
  ssr: false,
});
const CartesianGrid = dynamic(
  () => import("recharts").then((mod) => mod.CartesianGrid),
  { ssr: false }
);

export default function StatsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!user) return;

      try {
        const statsData = await getUserStats(user.uid);
        setStats(statsData);
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [user]);

  // Memoize expensive calculations
  const chartData = useMemo(() => 
    stats?.scoresHistory.slice(-20).map((entry, index) => ({
      name: `${index + 1}`,
      score: entry.score,
    })) || [],
    [stats?.scoresHistory]
  );

  const topTechniques = useMemo(() => 
    stats
      ? Object.entries(stats.techniquesUsed)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([code, count]) => ({
            technique: techniques.find((t) => t.code === code),
            count,
          }))
      : [],
    [stats?.techniquesUsed]
  );

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <Skeleton className="h-80 md:col-span-2 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 fade-in">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
            <Activity className="text-[var(--accent)]" size={28} />
            הביצועים שלי
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            ניתוח התקדמות המשא ומתן שלך
          </p>
        </div>
        
        {stats && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-sm text-[var(--text-muted)]">
            <Calendar size={14} />
            עודכן: {new Date().toLocaleDateString("he-IL")}
          </div>
        )}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Sessions */}
        <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] slide-up" style={{ animationDelay: "0ms" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--info-subtle)] flex items-center justify-center">
              <Target size={20} className="text-[var(--info)]" />
            </div>
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-1">סה״כ אימונים</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">
            {stats?.totalTrainingSessions || 0}
          </p>
        </div>

        {/* Average Score */}
        <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] slide-up" style={{ animationDelay: "50ms" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--success-subtle)] flex items-center justify-center">
              <Trophy size={20} className="text-[var(--success)]" />
            </div>
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-1">ציון ממוצע</p>
          <p className={cn("text-2xl font-bold tabular-nums", getScoreColor(stats?.avgScore || 0))}>
            {stats?.avgScore || 0}
          </p>
        </div>

        {/* Consultations */}
        <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] slide-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--warning-subtle)] flex items-center justify-center">
              <MessageSquare size={20} className="text-[var(--warning)]" />
            </div>
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-1">ייעוצים</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">
            {stats?.totalConsultations || 0}
          </p>
        </div>

        {/* Level */}
        <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--accent-dark)] slide-up" style={{ animationDelay: "150ms" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center">
              <Zap size={20} className="text-black" fill="currentColor" />
            </div>
          </div>
          <p className="text-sm text-[var(--accent)] mb-1">רמה נוכחית</p>
          <p className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">
            {Math.floor((stats?.totalTrainingSessions || 0) / 5) + 1}
          </p>
          <div className="mt-2 h-1 w-full bg-[var(--bg-hover)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[var(--accent)]" 
              style={{ width: `${((stats?.totalTrainingSessions || 0) % 5) * 20}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Main Chart */}
        <div className="md:col-span-2 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 slide-up" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <TrendingUp size={18} className="text-[var(--accent)]" />
                מגמת שיפור
              </h3>
              <p className="text-sm text-[var(--text-muted)]">20 האימונים האחרונים</p>
            </div>
          </div>
          
          <div className="h-[260px] w-full">
            {chartData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-3 py-2 rounded-lg shadow-lg">
                            <p className="text-[var(--text-muted)] text-xs">אימון {label}</p>
                            <p className="text-[var(--accent)] font-semibold">
                              ציון: {payload[0].value}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="var(--accent)" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)]">
                <BarChart2 size={40} className="mb-3 opacity-30" />
                <p className="text-sm">אין מספיק נתונים להצגת גרף</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Techniques */}
        <div className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 slide-up" style={{ animationDelay: "250ms" }}>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-5 flex items-center gap-2">
            <Award size={18} className="text-[var(--accent)]" />
            ארגז הכלים שלי
          </h3>
          
          {topTechniques.length > 0 ? (
            <div className="space-y-5">
              {topTechniques.map(({ technique, count }, index) => {
                if (!technique) return null;
                const maxCount = topTechniques[0].count;
                const percentage = (count / maxCount) * 100;

                return (
                  <div key={technique.code}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {technique.name}
                      </span>
                      <span className="text-xs text-[var(--text-muted)] tabular-nums">
                        {count}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--bg-hover)] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[var(--accent)] rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[180px] flex flex-col items-center justify-center text-[var(--text-muted)] text-center">
              <p className="text-sm">עדיין לא השתמשת בטכניקות</p>
              <p className="text-xs mt-1 opacity-70">התחל אימון כדי לראות נתונים</p>
            </div>
          )}
        </div>
      </div>
      
      {!stats || (stats.totalTrainingSessions === 0 && stats.totalConsultations === 0) ? (
        <p className="mt-8 text-center text-sm text-[var(--text-muted)] fade-in">
          טיפ: ככל שתתאמן יותר, כך הגרפים יהיו מדויקים יותר
        </p>
      ) : null}
    </div>
  );
}
