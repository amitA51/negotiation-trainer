"use client";

import { useEffect, useState } from "react";
import {
  Target,
  TrendingUp,
  MessageSquare,
  Award,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, Spinner, Skeleton, Progress } from "@/components/ui";
import { getUserStats } from "@/lib/firebase/firestore";
import { techniques } from "@/data/techniques";
import { cn, getScoreColor } from "@/lib/utils";
import type { UserStats } from "@/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Prepare chart data
  const chartData =
    stats?.scoresHistory.slice(-20).map((entry, index) => ({
      name: `${index + 1}`,
      score: entry.score,
    })) || [];

  // Get top techniques
  const topTechniques = stats
    ? Object.entries(stats.techniquesUsed)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([code, count]) => ({
          technique: techniques.find((t) => t.code === code),
          count,
        }))
    : [];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">סטטיסטיקות</h1>
        <p className="text-[var(--text-secondary)] mt-2">
          מעקב אחר ההתקדמות שלך
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8 animate-fade-in-up stagger-1">
        {/* Total Sessions */}
        <Card hover={false}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--info-subtle)] flex items-center justify-center">
              <Target size={24} className="text-[var(--info)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">סה״כ אימונים</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {stats?.totalTrainingSessions || 0}
              </p>
            </div>
          </div>
        </Card>

        {/* Average Score */}
        <Card hover={false}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--success-subtle)] flex items-center justify-center">
              <TrendingUp size={24} className="text-[var(--success)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">ציון ממוצע</p>
              <p
                className={cn(
                  "text-2xl font-bold",
                  getScoreColor(stats?.avgScore || 0)
                )}
              >
                {stats?.avgScore || 0}
              </p>
            </div>
          </div>
        </Card>

        {/* Consultations */}
        <Card hover={false}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--warning-subtle)] flex items-center justify-center">
              <MessageSquare size={24} className="text-[var(--warning)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">ייעוצים</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {stats?.totalConsultations || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Score Chart */}
      {chartData.length > 1 && (
        <Card className="mb-8 animate-fade-in-up stagger-2" hover={false}>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-[var(--accent)]" />
            התקדמות הציונים
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="name"
                  stroke="var(--text-muted)"
                  fontSize={12}
                />
                <YAxis
                  stroke="var(--text-muted)"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                  }}
                  labelStyle={{ color: "var(--text-secondary)" }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={{ fill: "var(--accent)", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "var(--accent-light)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Top Techniques */}
      {topTechniques.length > 0 && (
        <Card className="animate-fade-in-up stagger-3" hover={false}>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <Award size={20} className="text-[var(--accent)]" />
            טכניקות מובילות
          </h3>
          <div className="space-y-4">
            {topTechniques.map(({ technique, count }, index) => {
              if (!technique) return null;
              const maxCount = topTechniques[0].count;
              const percentage = (count / maxCount) * 100;

              return (
                <div key={technique.code}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[var(--text-primary)]">{technique.name}</span>
                    <span className="text-sm text-[var(--text-muted)]">{count} פעמים</span>
                  </div>
                  <Progress value={percentage} showLabel={false} />
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {!stats || (stats.totalTrainingSessions === 0 && stats.totalConsultations === 0) ? (
        <Card className="text-center py-12" hover={false}>
          <Target size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            אין נתונים עדיין
          </h3>
          <p className="text-[var(--text-secondary)]">
            התחל אימונים כדי לראות את הסטטיסטיקות שלך
          </p>
        </Card>
      ) : null}
    </div>
  );
}
