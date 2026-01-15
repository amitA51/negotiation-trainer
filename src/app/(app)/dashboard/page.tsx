"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Target,
  MessageSquare,
  TrendingUp,
  Clock,
  ChevronLeft,
  Sparkles,
  Play,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Card, Badge, Progress, Skeleton } from "@/components/ui";
import { getUserStats, getActiveSession } from "@/lib/firebase/firestore";
import { formatRelativeTime, getDifficultyInfo } from "@/lib/utils";
import type { UserStats, Session } from "@/types";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      
      try {
        const [statsData, sessionData] = await Promise.all([
          getUserStats(user.uid),
          getActiveSession(user.uid),
        ]);
        
        setStats(statsData);
        setActiveSession(sessionData);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  const firstName = user?.displayName?.split(" ")[0] || "משתמש";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          שלום, <span className="text-gold">{firstName}</span>
        </h1>
        <p className="text-[var(--text-secondary)]">
          מוכן לשפר את כישורי המשא ומתן שלך?
        </p>
      </div>

      {/* Main Actions */}
      <div className="grid md:grid-cols-2 gap-4 animate-fade-in-up stagger-1">
        {/* Training Card */}
        <Link href="/training">
          <Card variant="gold" className="group cursor-pointer h-full">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] flex items-center justify-center shrink-0 group-hover:shadow-[0_0_30px_var(--accent-glow)] transition-shadow">
                <Target size={28} className="text-black" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
                  התחל אימון
                </h2>
                <p className="text-[var(--text-secondary)] text-sm mb-4">
                  תרגל משא ומתן עם AI חכם שמתאים את עצמו לרמה שלך
                </p>
                <div className="flex items-center gap-2 text-[var(--accent)]">
                  <span className="text-sm font-medium">בחר תרחיש</span>
                  <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Card>
        </Link>

        {/* Consultation Card */}
        <Link href="/consultation">
          <Card variant="default" className="group cursor-pointer h-full">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-default)] flex items-center justify-center shrink-0 group-hover:border-[var(--accent)] group-hover:bg-[var(--accent-subtle)] transition-colors">
                <MessageSquare size={28} className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-1">
                  ייעוץ אישי
                </h2>
                <p className="text-[var(--text-secondary)] text-sm mb-4">
                  קבל עצות ואסטרטגיות למצבים אמיתיים שאתה מתמודד איתם
                </p>
                <div className="flex items-center gap-2 text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors">
                  <span className="text-sm font-medium">שאל שאלה</span>
                  <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Active Session Banner */}
      {activeSession && (
        <Card 
          variant="glass" 
          className="border-[var(--accent-dark)] animate-fade-in-up stagger-2"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center">
                <Play size={24} className="text-[var(--accent)]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-[var(--text-primary)]">
                    {activeSession.scenario.title}
                  </h3>
                  <Badge variant="gold" size="sm">
                    {activeSession.status === "paused" ? "מושהה" : "פעיל"}
                  </Badge>
                </div>
                <p className="text-sm text-[var(--text-muted)]">
                  <Clock size={14} className="inline ml-1" />
                  {formatRelativeTime(activeSession.lastActiveAt)}
                </p>
              </div>
            </div>
            <Link href={`/training/${activeSession.id}`}>
              <Button variant="primary" size="sm">
                המשך אימון
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Stats Section */}
      <div className="grid md:grid-cols-3 gap-4 animate-fade-in-up stagger-3">
        {loading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
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
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
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
          </>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 gap-4 animate-fade-in-up stagger-4">
        {/* Learn Techniques */}
        <Link href="/techniques">
          <Card className="group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-hover)] flex items-center justify-center group-hover:bg-[var(--accent-subtle)] transition-colors">
                <BookOpen size={20} className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[var(--text-primary)]">למד טכניקות</h3>
                <p className="text-sm text-[var(--text-muted)]">18 טכניקות מקצועיות</p>
              </div>
              <ChevronLeft size={20} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:-translate-x-1 transition-all" />
            </div>
          </Card>
        </Link>

        {/* View History */}
        <Link href="/history">
          <Card className="group cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-hover)] flex items-center justify-center group-hover:bg-[var(--accent-subtle)] transition-colors">
                <Clock size={20} className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[var(--text-primary)]">היסטוריה</h3>
                <p className="text-sm text-[var(--text-muted)]">צפה באימונים קודמים</p>
              </div>
              <ChevronLeft size={20} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:-translate-x-1 transition-all" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Tips Section */}
      <Card variant="glass" className="animate-fade-in-up stagger-5" hover={false}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center shrink-0">
            <Sparkles size={20} className="text-[var(--accent)]" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">טיפ היום</h3>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              <strong className="text-[var(--accent-light)]">שיקוף (Mirroring)</strong> - חזור על 1-3 המילים האחרונות של הצד השני כשאלה.
              זה גורם לאנשים להרגיש שמקשיבים להם ולהמשיך לדבר, מה שחושף מידע חשוב.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
