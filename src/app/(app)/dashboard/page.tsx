"use client";

import { useEffect, useState, useMemo } from "react";
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
  Zap,
  Award,
  Flame,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Card, Badge, AnimatedCounter, SkeletonStats } from "@/components/ui";
import { getUserStats, getActiveSession } from "@/lib/firebase/firestore";
import { formatRelativeTime } from "@/lib/utils";
import type { UserStats, Session } from "@/types";
import { cn } from "@/lib/utils";

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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome Section with decorative background */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-secondary)] border border-[var(--border-subtle)] p-8 animate-fade-in-up">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[var(--accent)] opacity-[0.03] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-[var(--accent)] opacity-[0.05] rounded-full blur-2xl translate-x-1/4 translate-y-1/4" aria-hidden="true" />
        
        <div className="relative">
          <p className="text-[var(--text-muted)] text-sm mb-1">{greeting}</p>
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-3 text-wrap-balance">
            {firstName}, <span className="text-gold">מוכן לנצח?</span>
          </h1>
          <p className="text-[var(--text-secondary)] max-w-lg">
            כל משא ומתן הוא הזדמנות. בוא נהפוך אותך למומחה.
          </p>
        </div>
      </section>

      {/* Main Actions - Bento Grid Style */}
      <section className="grid md:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
        {/* Training Card - Hero */}
        <Link href="/training" className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-2xl">
          <Card variant="gold" className="h-full relative overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
            
            <div className="relative flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] flex items-center justify-center shrink-0 shadow-lg group-hover:shadow-[0_0_40px_var(--accent-glow)] transition-shadow duration-300">
                <Target size={32} className="text-black" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    התחל אימון
                  </h2>
                  <Zap size={16} className="text-[var(--accent)]" aria-hidden="true" />
                </div>
                <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2">
                  תרגל משא ומתן עם AI חכם שמתאים את עצמו לרמה שלך
                </p>
                <div className="flex items-center gap-2 text-[var(--accent)] font-medium">
                  <span className="text-sm">בחר תרחיש</span>
                  <ChevronLeft size={18} className="group-hover:-translate-x-2 transition-transform duration-300" aria-hidden="true" />
                </div>
              </div>
            </div>
          </Card>
        </Link>

        {/* Consultation Card */}
        <Link href="/consultation" className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-2xl">
          <Card variant="default" className="h-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--info)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
            
            <div className="relative flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border-default)] flex items-center justify-center shrink-0 group-hover:border-[var(--accent)] group-hover:bg-[var(--accent-subtle)] transition-all duration-300">
                <MessageSquare size={32} className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors duration-300" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                  ייעוץ אישי
                </h2>
                <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2">
                  קבל עצות ואסטרטגיות למצבים אמיתיים שאתה מתמודד איתם
                </p>
                <div className="flex items-center gap-2 text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors duration-300 font-medium">
                  <span className="text-sm">שאל שאלה</span>
                  <ChevronLeft size={18} className="group-hover:-translate-x-2 transition-transform duration-300" aria-hidden="true" />
                </div>
              </div>
            </div>
          </Card>
        </Link>
      </section>

      {/* Active Session Banner */}
      {activeSession && (
        <section className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <Card 
            variant="glass" 
            className="border-[var(--accent-dark)] relative overflow-hidden"
          >
            {/* Pulsing indicator */}
            <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-[var(--accent)] animate-pulse" aria-hidden="true" />
            
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center">
                  <Play size={28} className="text-[var(--accent)] mr-[-2px]" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-[var(--text-primary)]">
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
          </Card>
        </section>
      )}

      {/* Stats Section with animated counters */}
      <section className="animate-fade-in-up" style={{ animationDelay: "150ms" }} aria-label="סטטיסטיקות">
        {loading ? (
          <SkeletonStats cards={3} />
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {/* Total Sessions */}
            <Card hover={false} className="relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-l from-[var(--info)] to-transparent" aria-hidden="true" />
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-[var(--info-subtle)] flex items-center justify-center">
                  <Target size={28} className="text-[var(--info)]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">סה״כ אימונים</p>
                  <p className="text-3xl font-bold text-[var(--text-primary)] font-variant-numeric-tabular">
                    <AnimatedCounter value={stats?.totalTrainingSessions || 0} />
                  </p>
                </div>
              </div>
            </Card>

            {/* Average Score */}
            <Card hover={false} className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-l from-[var(--success)] to-transparent" aria-hidden="true" />
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-[var(--success-subtle)] flex items-center justify-center">
                  <Award size={28} className="text-[var(--success)]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">ציון ממוצע</p>
                  <p className="text-3xl font-bold text-[var(--text-primary)] font-variant-numeric-tabular">
                    <AnimatedCounter value={stats?.avgScore || 0} />
                  </p>
                </div>
              </div>
            </Card>

            {/* Streak / Consultations */}
            <Card hover={false} className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-l from-[var(--warning)] to-transparent" aria-hidden="true" />
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-[var(--warning-subtle)] flex items-center justify-center">
                  <Flame size={28} className="text-[var(--warning)]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">ייעוצים</p>
                  <p className="text-3xl font-bold text-[var(--text-primary)] font-variant-numeric-tabular">
                    <AnimatedCounter value={stats?.totalConsultations || 0} />
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </section>

      {/* Quick Links */}
      <section className="grid md:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        {/* Learn Techniques */}
        <Link href="/techniques" className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-xl">
          <Card className="cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--bg-hover)] flex items-center justify-center group-hover:bg-[var(--accent-subtle)] transition-colors duration-300">
                <BookOpen size={24} className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors duration-300" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[var(--text-primary)]">למד טכניקות</h3>
                <p className="text-sm text-[var(--text-muted)]">18 טכניקות מקצועיות</p>
              </div>
              <ChevronLeft size={20} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:-translate-x-2 transition-all duration-300" aria-hidden="true" />
            </div>
          </Card>
        </Link>

        {/* View History */}
        <Link href="/history" className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-xl">
          <Card className="cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--bg-hover)] flex items-center justify-center group-hover:bg-[var(--accent-subtle)] transition-colors duration-300">
                <Clock size={24} className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors duration-300" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[var(--text-primary)]">היסטוריה</h3>
                <p className="text-sm text-[var(--text-muted)]">צפה באימונים קודמים</p>
              </div>
              <ChevronLeft size={20} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:-translate-x-2 transition-all duration-300" aria-hidden="true" />
            </div>
          </Card>
        </Link>
      </section>

      {/* Tips Section - More prominent */}
      <section className="animate-fade-in-up" style={{ animationDelay: "250ms" }}>
        <Card variant="glass" hover={false} className="relative overflow-hidden">
          {/* Corner decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[var(--accent)]/10 to-transparent" aria-hidden="true" />
          
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center shrink-0">
              <Sparkles size={24} className="text-[var(--accent)]" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-[var(--text-primary)]">טיפ היום</h3>
                <Badge variant="gold" size="sm">{dailyTip.title}</Badge>
              </div>
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {dailyTip.content}
              </p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
