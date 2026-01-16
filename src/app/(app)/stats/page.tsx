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
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="flex justify-between items-end">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 rounded-3xl" />
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-96 md:col-span-2 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto relative">
      {/* Decorative Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--accent)]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--accent-dark)]/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] flex items-center gap-3">
            <Activity className="text-[var(--accent)]" />
            הביצועים שלי
          </h1>
          <p className="text-[var(--text-secondary)] mt-2 text-lg">
            ניתוח מעמיק של התקדמות המשא ומתן שלך
          </p>
        </div>
        
        {stats && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-sm font-medium text-[var(--text-secondary)]">
            <Calendar size={16} />
            עודכן לאחרונה: {new Date().toLocaleDateString("he-IL")}
          </div>
        )}
      </div>

      {/* Key Metrics Grid (Bento) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Sessions */}
        <div className="relative overflow-hidden rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 group hover:border-[var(--accent-dark)] transition-all duration-300 animate-fade-in-up stagger-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--info)]/5 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-[var(--info-subtle)] text-[var(--info)]">
              <Target size={24} />
            </div>
          </div>
          <div>
            <p className="text-[var(--text-muted)] font-medium mb-1">סה״כ אימונים</p>
            <h3 className="text-3xl font-bold text-[var(--text-primary)]">
              {stats?.totalTrainingSessions || 0}
            </h3>
          </div>
        </div>

        {/* Average Score */}
        <div className="relative overflow-hidden rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 group hover:border-[var(--accent-dark)] transition-all duration-300 animate-fade-in-up stagger-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--success)]/5 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-[var(--success-subtle)] text-[var(--success)]">
              <Trophy size={24} />
            </div>
          </div>
          <div>
            <p className="text-[var(--text-muted)] font-medium mb-1">ציון ממוצע</p>
            <h3 className={cn("text-3xl font-bold", getScoreColor(stats?.avgScore || 0))}>
              {stats?.avgScore || 0}
            </h3>
          </div>
        </div>

        {/* Consultations */}
        <div className="relative overflow-hidden rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 group hover:border-[var(--accent-dark)] transition-all duration-300 animate-fade-in-up stagger-3">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--warning)]/5 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-[var(--warning-subtle)] text-[var(--warning)]">
              <MessageSquare size={24} />
            </div>
          </div>
          <div>
            <p className="text-[var(--text-muted)] font-medium mb-1">ייעוצים שבוצעו</p>
            <h3 className="text-3xl font-bold text-[var(--text-primary)]">
              {stats?.totalConsultations || 0}
            </h3>
          </div>
        </div>

        {/* XP / Level (Placeholder for future feature) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--accent-dark)]/20 to-[var(--bg-card)] border border-[var(--accent-dark)] p-6 group hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.1)] transition-all duration-300 animate-fade-in-up stagger-4">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-2xl bg-[var(--accent)] text-black shadow-[0_0_15px_var(--accent-glow)]">
              <Zap size={24} fill="currentColor" />
            </div>
          </div>
          <div>
            <p className="text-[var(--accent)] font-medium mb-1">רמה נוכחית</p>
            <h3 className="text-3xl font-bold text-[var(--text-primary)]">
              {Math.floor((stats?.totalTrainingSessions || 0) / 5) + 1}
            </h3>
            <div className="mt-3 h-1.5 w-full bg-[var(--bg-elevated)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" 
                style={{ width: `${((stats?.totalTrainingSessions || 0) % 5) * 20}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="md:col-span-2 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 animate-fade-in-up stagger-5">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <TrendingUp size={20} className="text-[var(--accent)]" />
                מגמת שיפור
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">התקדמות הציונים ב-20 האימונים האחרונים</p>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            {chartData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" opacity={0.5} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3 rounded-xl shadow-xl backdrop-blur-md">
                            <p className="text-[var(--text-muted)] text-xs mb-1">אימון מס׳ {label}</p>
                            <p className="text-[var(--accent)] font-bold text-lg">
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
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)]">
                <BarChart2 size={48} className="mb-4 opacity-20" />
                <p>אין מספיק נתונים להצגת גרף</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Techniques */}
        <div className="rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 animate-fade-in-up stagger-6">
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <Award size={20} className="text-[var(--accent)]" />
            ארגז הכלים שלי
          </h3>
          
          {topTechniques.length > 0 ? (
            <div className="space-y-6">
              {topTechniques.map(({ technique, count }, index) => {
                if (!technique) return null;
                const maxCount = topTechniques[0].count;
                const percentage = (count / maxCount) * 100;

                return (
                  <div key={technique.code} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                        {technique.name}
                      </span>
                      <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded-md">
                        {count} שימושים
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[var(--accent-dark)] to-[var(--accent)] rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center text-[var(--text-muted)] text-center">
              <p>עדיין לא השתמשת בטכניקות</p>
              <p className="text-sm mt-2">השתמש בטכניקות במהלך אימון כדי לראות אותן כאן</p>
            </div>
          )}
        </div>
      </div>
      
      {!stats || (stats.totalTrainingSessions === 0 && stats.totalConsultations === 0) ? (
        <div className="mt-8 text-center animate-fade-in-up stagger-7">
          <p className="text-[var(--text-muted)]">
            טיפ: ככל שתתאמן יותר, כך הגרפים יהיו מדויקים יותר ויעזרו לך להשתפר.
          </p>
        </div>
      ) : null}
    </div>
  );
}
