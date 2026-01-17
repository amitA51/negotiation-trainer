"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Target,
  MessageSquare,
  Clock,
  Sparkles,
  Play,
  BookOpen,
  Award,
  Flame,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Badge, AnimatedCounter, SkeletonStats } from "@/components/ui";
import { useDashboardData } from "@/lib/hooks/useSWR";
import { formatRelativeTime } from "@/lib/utils";
import { BentoGrid, BentoGridItem } from "@/components/ui/BentoGrid";
import { TextReveal } from "@/components/ui/TextReveal";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

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
  const { stats, activeSession, loading } = useDashboardData(user?.uid);

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

  const firstName = user?.displayName?.split(" ")[0] || "משתמש";

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8">
      {/* Welcome Section */}
      <section className="mb-12">
        <p className="text-[var(--text-muted)] text-sm mb-2 font-medium tracking-wide uppercase">{greeting}</p>
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4 leading-tight">
          {firstName}, <br />
          <TextReveal text="מוכן לנצח?" gradient delay={0.2} className="text-5xl md:text-6xl" />
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-lg">
          כל משא ומתן הוא הזדמנות. <span className="text-[var(--text-primary)] font-medium">בוא נהפוך אותך למומחה.</span>
        </p>
      </section>

      {/* Grid Layout */}
      <BentoGrid>
        {/* Main Training Action - Large Card */}
        <div className="md:col-span-2 md:row-span-2">
          <Link href="/training">
            <SpotlightCard className="h-full border-[var(--accent-dark)] shadow-[0_0_30px_-10px_rgba(201,162,39,0.15)] group cursor-pointer">
              <div className="p-8 h-full flex flex-col justify-between relative z-10">
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] flex items-center justify-center shrink-0 mb-6 shadow-lg shadow-[var(--accent-glow)] group-hover:scale-110 transition-transform duration-500">
                    <Target size={32} className="text-black" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">התחל אימון חדש</h2>
                  <p className="text-[var(--text-secondary)] text-lg max-w-sm">
                    תרגל משא ומתן מול AI מתקדם. בחר תרחיש, קבל משוב בזמן אמת ושפר את הביצועים שלך.
                  </p>
                </div>

                <div className="mt-8">
                  <MagneticButton>
                    התחל עכשיו <Play size={16} fill="currentColor" />
                  </MagneticButton>
                </div>
              </div>
              {/* Background Graphic */}
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                <Target size={300} strokeWidth={0.5} />
              </div>
            </SpotlightCard>
          </Link>
        </div>

        {/* Active Session (if exists) or Consultation */}
        <div className="md:col-span-1 md:row-span-2">
          {activeSession ? (
            <SpotlightCard className="h-full border-[var(--info-subtle)]/30">
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <Badge variant="gold" className="animate-pulse">אימון פעיל</Badge>
                  <Clock size={18} className="text-[var(--text-muted)]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                  {activeSession.scenario.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] mb-8">
                  עודכן: {formatRelativeTime(activeSession.lastActiveAt)}
                </p>
                <div className="mt-auto">
                  <Link href={`/training/${activeSession.id}`} className="block w-full">
                    <Button variant="secondary" className="w-full justify-between group">
                      המשך אימון
                      <Play size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </SpotlightCard>
          ) : (
            <Link href="/consultation" className="h-full block">
              <BentoGridItem
                title="ייעוץ אישי"
                description="קבל אסטרטגיות מותאמות אישית למצבים אמיתיים."
                header={<div className="h-32 w-full bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-hover)] rounded-xl mb-4 flex items-center justify-center"><MessageSquare size={40} className="text-[var(--text-muted)]" /></div>}
                icon={<MessageSquare className="h-4 w-4 text-neutral-500" />}
                className="h-full"
              />
            </Link>
          )}
        </div>

        {/* Stats Row */}
        <div className="md:col-span-1 md:row-span-1">
          <SpotlightCard className="h-full flex items-center justify-center p-6">
            {loading ? <SkeletonStats cards={1} /> : (
              <div className="text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-[var(--bg-hover)] flex items-center justify-center mb-3">
                  <Target size={20} className="text-[var(--text-muted)]" />
                </div>
                <div className="text-3xl font-bold text-white mb-1"><AnimatedCounter value={stats?.totalTrainingSessions || 0} /></div>
                <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">אימונים</div>
              </div>
            )}
          </SpotlightCard>
        </div>
        <div className="md:col-span-1 md:row-span-1">
          <SpotlightCard className="h-full flex items-center justify-center p-6">
            {loading ? <SkeletonStats cards={1} /> : (
              <div className="text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-[var(--bg-hover)] flex items-center justify-center mb-3">
                  <Award size={20} className="text-[var(--accent)]" />
                </div>
                <div className="text-3xl font-bold text-[var(--accent)] mb-1"><AnimatedCounter value={stats?.avgScore || 0} /></div>
                <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">ציון ממוצע</div>
              </div>
            )}
          </SpotlightCard>
        </div>
        <div className="md:col-span-1 md:row-span-1">
          <SpotlightCard className="h-full flex items-center justify-center p-6">
            {loading ? <SkeletonStats cards={1} /> : (
              <div className="text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-[var(--bg-hover)] flex items-center justify-center mb-3">
                  <Flame size={20} className="text-orange-500" />
                </div>
                <div className="text-3xl font-bold text-white mb-1"><AnimatedCounter value={stats?.totalConsultations || 0} /></div>
                <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">ייעוצים</div>
              </div>
            )}
          </SpotlightCard>
        </div>

        {/* Daily Tip - Wide */}
        <div className="md:col-span-3 md:row-span-1">
          <SpotlightCard className="h-full border-[var(--accent-dark)]/30 bg-[var(--bg-elevated)]" spotlightColor="rgba(201, 162, 39, 0.1)">
            <div className="p-6 flex items-start gap-6 h-full">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center shrink-0 animate-pulse-soft">
                <Sparkles size={24} className="text-[var(--accent)]" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium text-[var(--accent)] uppercase tracking-wider">טיפ היומי</span>
                  <div className="h-1 w-1 rounded-full bg-[var(--text-muted)]" />
                  <span className="text-sm text-[var(--text-primary)] font-semibold">{dailyTip.title}</span>
                </div>
                <p className="text-[var(--text-secondary)] leading-relaxed text-sm md:text-base">
                  {dailyTip.content}
                </p>
              </div>
            </div>
          </SpotlightCard>
        </div>

      </BentoGrid>

      {/* Footer Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <Link href="/techniques" className="col-span-1">
          <Button variant="ghost" className="w-full justify-start text-[var(--text-muted)] hover:text-white">
            <BookOpen size={16} className="ml-2" /> טכניקות
          </Button>
        </Link>
        <Link href="/history" className="col-span-1">
          <Button variant="ghost" className="w-full justify-start text-[var(--text-muted)] hover:text-white">
            <Clock size={16} className="ml-2" /> היסטוריה
          </Button>
        </Link>
      </div>
    </div>
  );
}
