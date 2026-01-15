"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Target, MessageSquare, ChevronLeft, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, Badge, Spinner, Skeleton } from "@/components/ui";
import { getUserSessions } from "@/lib/firebase/firestore";
import { formatRelativeTime, getDifficultyInfo, cn } from "@/lib/utils";
import type { Session } from "@/types";

export default function HistoryPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "training" | "consultation">("all");

  useEffect(() => {
    async function loadSessions() {
      if (!user) return;
      
      try {
        const sessionsData = await getUserSessions(user.uid, 50);
        setSessions(sessionsData);
      } catch (error) {
        console.error("Error loading sessions:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSessions();
  }, [user]);

  const filteredSessions = sessions.filter((session) => {
    if (filter === "all") return true;
    return session.type === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success" size="sm">הושלם</Badge>;
      case "paused":
        return <Badge variant="warning" size="sm">מושהה</Badge>;
      case "active":
        return <Badge variant="info" size="sm">פעיל</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">היסטוריה</h1>
        <p className="text-[var(--text-secondary)] mt-2">
          צפה באימונים ובייעוצים קודמים
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 animate-fade-in-up stagger-1">
        {[
          { id: "all", label: "הכל" },
          { id: "training", label: "אימונים" },
          { id: "consultation", label: "ייעוצים" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as typeof filter)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              filter === f.id
                ? "bg-[var(--accent)] text-black"
                : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <Card className="text-center py-12" hover={false}>
          <Clock size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            אין היסטוריה עדיין
          </h3>
          <p className="text-[var(--text-secondary)] mb-6">
            התחל אימון או ייעוץ כדי לראות אותם כאן
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/training">
              <button className="btn btn-primary">התחל אימון</button>
            </Link>
            <Link href="/consultation">
              <button className="btn btn-secondary">בקש ייעוץ</button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session, index) => {
            const difficultyInfo = getDifficultyInfo(session.difficulty);
            const isTraining = session.type === "training";
            const link = isTraining
              ? session.status === "completed"
                ? `/training/summary/${session.id}`
                : `/training/${session.id}`
              : `/consultation/${session.id}`;

            return (
              <Link key={session.id} href={link}>
                <Card
                  className={cn("group cursor-pointer animate-fade-in-up", `stagger-${(index % 5) + 1}`)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                        isTraining
                          ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
                          : "bg-[var(--info-subtle)] text-[var(--info)]"
                      )}
                    >
                      {isTraining ? <Target size={24} /> : <MessageSquare size={24} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-[var(--text-primary)] truncate">
                          {session.scenario.title}
                        </h3>
                        {getStatusBadge(session.status)}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatRelativeTime(session.startedAt)}
                        </span>
                        {isTraining && (
                          <span className={difficultyInfo.color}>
                            רמה {session.difficulty}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronLeft size={20} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:-translate-x-1 transition-all shrink-0" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
