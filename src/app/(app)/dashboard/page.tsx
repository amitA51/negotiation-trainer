"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Target,
  MessageSquare,
  Clock,
  ChevronLeft,
  Sparkles,
  Play,
  BookOpen,
  Award,
  Flame,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Card, Badge, AnimatedCounter, SkeletonStats } from "@/components/ui";
import { getUserStats, getActiveSession } from "@/lib/firebase/firestore";
import { formatRelativeTime } from "@/lib/utils";
import type { UserStats, Session } from "@/types";

// Daily tips array
const DAILY_TIPS = [
  {
    title: "שיקוף (Mirroring)",
    content: "חזור על 1–3 המילים האחרונות של הצד השני כשאלה. זה גורם לאנשים להרגיש שמקשיבים להם ולהמשיך לדבר.",
  },
  {
    title: "עיגון (Anchoring)",
    content: "הצע מספר ראשון קיצוני כנקודת התחלה. זה ישפיע על כל המשא ומתן שיבוא אחריו.",
  },
  {
    title: "שתיקה אסטרטגית",
    content: "אחרי שהצעת הצעה, שתוק. רוב האנשים לא יכולים לשאת שקט ויתחילו להציע ויתורים.",
  },
  {
    title: "BATNA",
    content: "תמיד דע מה האלטרנטיבה הטובה ביותר שלך. זה נותן לך כוח לסרב להצעות גרועות.",
  },
  {
    title: "בקש יותר",
    content: "תמיד בקש יותר ממה שאתה באמת רוצה. זה נותן לך מרווח למשא ומתן.",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Get daily tip based on day of year
  const dailyTip = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
  }, []);

  // Get greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "בוקר טוב";
    if (hour < 17) return "צהריים טובים";
    if (hour < 21) return "ערב טוב";
    return "לילה טוב";
  }, []);

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
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Welcome Section - Clean, minimal */}
      <section className="fade-in">
        <p className="text-[var(--text-muted)] text-sm mb-2">{greeting}</p>
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-3">
          {firstName}, <span className="text-gold">מוכן לנצח?</span>
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-lg">
          כל משא ומתן הוא הזדמנות. בוא נהפוך אותך למומחה.
        </p>
      </section>

      {/* Main Actions - Clean grid */}
      <section className="grid md:grid-cols-2 gap-6 slide-up" style={{ animationDelay: "50ms" }}>
        {/* Training Card */}
        <Link href="/training" className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-2xl">
          <div className="h-full p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--accent-dark)] hover:border-[var(--accent)] transition-colors duration-200">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] flex items-center justify-center shrink-0">
                <Target size={28} className="text-black" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                  התחל אימון
                </h2>
                <p className="text-[var(--text-secondary)] text-sm mb-4">
                  תרגל משא ומתן עם AI חכם שמתאים את עצמו לרמה שלך
                </p>
                <div className="flex items-center gap-2 text-[var(--accent)] font-medium text-sm">
                  <span>בחר תרחיש</span>
                  <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </Link>

        {/* Consultation Card */}
        <Link href="/consultation" className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-2xl">
          <div className="h-full p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors duration-200">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-xl bg-[var(--bg-hover)] flex items-center justify-center shrink-0 group-hover:bg-[var(--accent-subtle)] transition-colors duration-200">
                <MessageSquare size={28} className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                  ייעוץ אישי
                </h2>
                <p className="text-[var(--text-secondary)] text-sm mb-4">
                  קבל עצות ואסטרטגיות למצבים אמיתיים שאתה מתמודד איתם
                </p>
                <div className="flex items-center gap-2 text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors font-medium text-sm">
                  <span>שאל שאלה</span>
                  <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Active Session Banner */}
      {activeSession && (
        <section className="slide-up" style={{ animationDelay: "100ms" }}>
          <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--accent-dark)]">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center">
                  <Play size={24} className="text-[var(--accent)] mr-[-2px]" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      {activeSession.scenario.title}
                    </h3>
                    <Badge variant="gold" size="sm">
                      {activeSession.status === "paused" ? "מושהה" : "פעיל"}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--text-muted)] flex items-center gap-1">
                    <Clock size={14} aria-hidden="true" />
                    <time>{formatRelativeTime(activeSession.lastActiveAt)}</time>
                  </p>
                </div>
              </div>
              <Link href={`/training/${activeSession.id}`}>
                <Button variant="primary" size="sm" aria-label="המשך אימון">
                  המשך אימון
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section - Minimal cards */}
      <section className="slide-up" style={{ animationDelay: "150ms" }} aria-label="סטטיסטיקות">
        {loading ? (
          <SkeletonStats cards={3} />
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {/* Total Sessions */}
            <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--info-subtle)] flex items-center justify-center">
                  <Target size={24} className="text-[var(--info)]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)] mb-1">סה״כ אימונים</p>
                  <p className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">
                    <AnimatedCounter value={stats?.totalTrainingSessions || 0} />
                  </p>
                </div>
              </div>
            </div>

            {/* Average Score */}
            <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--success-subtle)] flex items-center justify-center">
                  <Award size={24} className="text-[var(--success)]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)] mb-1">ציון ממוצע</p>
                  <p className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">
                    <AnimatedCounter value={stats?.avgScore || 0} />
                  </p>
                </div>
              </div>
            </div>

            {/* Consultations */}
            <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--warning-subtle)] flex items-center justify-center">
                  <Flame size={24} className="text-[var(--warning)]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)] mb-1">ייעוצים</p>
                  <p className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">
                    <AnimatedCounter value={stats?.totalConsultations || 0} />
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Quick Links - Simple list */}
      <section className="grid md:grid-cols-2 gap-5 slide-up" style={{ animationDelay: "200ms" }}>
        <Link href="/techniques" className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-xl">
          <div className="p-5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-[var(--bg-hover)] flex items-center justify-center group-hover:bg-[var(--accent-subtle)] transition-colors">
                <BookOpen size={22} className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[var(--text-primary)]">למד טכניקות</h3>
                <p className="text-sm text-[var(--text-muted)]">18 טכניקות מקצועיות</p>
              </div>
              <ChevronLeft size={18} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:-translate-x-1 transition-all" aria-hidden="true" />
            </div>
          </div>
        </Link>

        <Link href="/history" className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-xl">
          <div className="p-5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-[var(--bg-hover)] flex items-center justify-center group-hover:bg-[var(--accent-subtle)] transition-colors">
                <Clock size={22} className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[var(--text-primary)]">היסטוריה</h3>
                <p className="text-sm text-[var(--text-muted)]">צפה באימונים קודמים</p>
              </div>
              <ChevronLeft size={18} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:-translate-x-1 transition-all" aria-hidden="true" />
            </div>
          </div>
        </Link>
      </section>

      {/* Daily Tip - Minimal design */}
      <section className="slide-up" style={{ animationDelay: "250ms" }}>
        <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center shrink-0">
              <Sparkles size={22} className="text-[var(--accent)]" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-[var(--text-primary)]">טיפ היום</h3>
                <Badge variant="gold" size="sm">{dailyTip.title}</Badge>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {dailyTip.content}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
