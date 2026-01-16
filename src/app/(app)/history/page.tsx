"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  Clock, 
  Target, 
  MessageSquare, 
  ChevronLeft, 
  Calendar, 
  Search,
  Filter,
  ArrowUpRight,
  MoreHorizontal,
  PlayCircle,
  CheckCircle2,
  PauseCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, Badge, Skeleton, Input } from "@/components/ui";
import { getUserSessions } from "@/lib/firebase/firestore";
import { formatRelativeTime, getDifficultyInfo, cn } from "@/lib/utils";
import type { Session } from "@/types";

export default function HistoryPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "training" | "consultation">("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      const matchesFilter = filter === "all" || session.type === filter;
      const matchesSearch = searchQuery === "" || 
        session.scenario.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.scenario.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });
  }, [sessions, filter, searchQuery]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return { 
          icon: CheckCircle2, 
          color: "text-emerald-500", 
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/20",
          label: "הושלם" 
        };
      case "paused":
        return { 
          icon: PauseCircle, 
          color: "text-amber-500", 
          bg: "bg-amber-500/10",
          border: "border-amber-500/20",
          label: "מושהה" 
        };
      case "active":
        return { 
          icon: PlayCircle, 
          color: "text-blue-500", 
          bg: "bg-blue-500/10",
          border: "border-blue-500/20",
          label: "פעיל" 
        };
      default:
        return { 
          icon: MoreHorizontal, 
          color: "text-[var(--text-muted)]", 
          bg: "bg-[var(--bg-elevated)]",
          border: "border-[var(--border-subtle)]",
          label: status 
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto relative min-h-screen pb-20">
       {/* Decorative Background */}
       <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-20 left-[-100px] w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-40 right-[-100px] w-80 h-80 bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
            <Clock className="text-[var(--accent)]" />
            היסטוריית פעילות
          </h1>
          <div className="hidden md:flex items-center gap-2 text-sm text-[var(--text-muted)] bg-[var(--bg-elevated)] px-3 py-1.5 rounded-full border border-[var(--border-subtle)]">
            <span>סה״כ: {sessions.length}</span>
          </div>
        </div>
        <p className="text-[var(--text-secondary)]">
          כל האימונים והייעוצים שביצעת במקום אחד
        </p>
      </div>

      {/* Controls Bar */}
      <div className="sticky top-0 z-20 py-4 -mx-4 px-4 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-subtle)] mb-8 animate-fade-in-up stagger-1">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input 
              type="text"
              placeholder="חפש לפי כותרת או תיאור..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pr-10 pl-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            <Filter size={16} className="text-[var(--text-muted)] ml-2 shrink-0" />
            {[
              { id: "all", label: "הכל" },
              { id: "training", label: "אימונים" },
              { id: "consultation", label: "ייעוצים" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as typeof filter)}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300",
                  filter === f.id
                    ? "bg-[var(--accent)] text-black shadow-[0_0_15px_var(--accent-glow)] scale-105"
                    : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-dark)]"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
          <div className="w-24 h-24 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center mb-6 border border-[var(--border-subtle)]">
            <Search size={40} className="text-[var(--text-muted)] opacity-50" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            לא נמצאו פעילויות
          </h3>
          <p className="text-[var(--text-secondary)] max-w-sm mb-8">
            {searchQuery 
              ? "נסה לשנות את מילות החיפוש או את הסינון"
              : "התחל את המסע שלך בעולם המשא ומתן עוד היום"}
          </p>
          {!searchQuery && (
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
              <Link href="/training" className="flex-1">
                <button className="w-full py-3 px-4 rounded-xl bg-[var(--accent)] text-black font-bold hover:bg-[var(--accent-light)] transition-colors shadow-[0_0_20px_var(--accent-glow)]">
                  התחל אימון חדש
                </button>
              </Link>
              <Link href="/consultation" className="flex-1">
                <button className="w-full py-3 px-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium hover:border-[var(--accent)] transition-colors">
                  בקש ייעוץ
                </button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session, index) => {
            const difficultyInfo = getDifficultyInfo(session.difficulty);
            const isTraining = session.type === "training";
            const statusConfig = getStatusConfig(session.status);
            const StatusIcon = statusConfig.icon;
            
            const link = isTraining
              ? session.status === "completed"
                ? `/training/summary/${session.id}`
                : `/training/${session.id}`
              : `/consultation/${session.id}`;

            return (
              <Link 
                key={session.id} 
                href={link}
                className="block group"
                style={{ animationDelay: `${(index % 10) * 50}ms` }}
              >
                <article
                  className={cn(
                    "relative overflow-hidden rounded-2xl p-1 transition-all duration-300 animate-fade-in-up",
                    "bg-gradient-to-br from-[var(--border-subtle)] to-transparent",
                    "hover:from-[var(--accent-dark)] hover:to-[var(--accent)]/20",
                    "focus-within:ring-2 focus-within:ring-[var(--accent)]"
                  )}
                >
                  <div className="relative h-full bg-[var(--bg-card)] rounded-xl p-5 flex items-center gap-5">
                    {/* Icon */}
                    <div
                      className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform duration-300 group-hover:scale-110",
                        isTraining
                          ? "bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] text-black"
                          : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                      )}
                    >
                      {isTraining ? <Target size={26} /> : <MessageSquare size={26} />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="font-bold text-lg text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">
                          {session.scenario.title}
                        </h3>
                        <div className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                          statusConfig.bg,
                          statusConfig.color,
                          statusConfig.border
                        )}>
                          <StatusIcon size={12} />
                          <span className="hidden sm:inline">{statusConfig.label}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-[var(--text-muted)]" />
                          {formatRelativeTime(session.startedAt)}
                        </span>
                        
                        {isTraining && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-[var(--text-muted)] opacity-50" />
                            <span className={cn("flex items-center gap-1.5", difficultyInfo.color)}>
                              רמה {session.difficulty}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Arrow Action */}
                    <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--text-muted)] border border-[var(--border-subtle)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] transition-all duration-300">
                      <ArrowUpRight size={20} className="group-hover:rotate-45 transition-transform duration-300" />
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
