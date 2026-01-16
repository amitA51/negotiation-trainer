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
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  MoreHorizontal
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge, Skeleton } from "@/components/ui";
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
          label: "הושלם" 
        };
      case "paused":
        return { 
          icon: PauseCircle, 
          color: "text-amber-500", 
          label: "מושהה" 
        };
      case "active":
        return { 
          icon: PlayCircle, 
          color: "text-blue-500", 
          label: "פעיל" 
        };
      default:
        return { 
          icon: MoreHorizontal, 
          color: "text-[var(--text-muted)]", 
          label: status 
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 fade-in">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3">
            <Clock className="text-[var(--accent)]" size={28} />
            היסטוריית פעילות
          </h1>
          <span className="text-sm text-[var(--text-muted)] bg-[var(--bg-elevated)] px-3 py-1.5 rounded-full border border-[var(--border-subtle)]">
            סה״כ: {sessions.length}
          </span>
        </div>
        <p className="text-[var(--text-secondary)]">
          כל האימונים והייעוצים שביצעת במקום אחד
        </p>
      </div>

      {/* Controls Bar */}
      <div className="sticky top-0 z-20 py-4 -mx-4 px-4 bg-[var(--bg-primary)]/90 backdrop-blur-sm border-b border-[var(--border-subtle)] mb-6 slide-up">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input 
              type="text"
              placeholder="חפש לפי כותרת או תיאור…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pr-10 pl-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <Filter size={14} className="text-[var(--text-muted)] ml-2 shrink-0" />
            {[
              { id: "all", label: "הכל" },
              { id: "training", label: "אימונים" },
              { id: "consultation", label: "ייעוצים" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as typeof filter)}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  filter === f.id
                    ? "bg-[var(--accent)] text-black"
                    : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
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
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center fade-in">
          <div className="w-20 h-20 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center mb-5 border border-[var(--border-subtle)]">
            <Search size={32} className="text-[var(--text-muted)] opacity-50" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            לא נמצאו פעילויות
          </h3>
          <p className="text-[var(--text-secondary)] max-w-sm mb-6">
            {searchQuery 
              ? "נסה לשנות את מילות החיפוש או את הסינון"
              : "התחל את המסע שלך בעולם המשא ומתן עוד היום"}
          </p>
          {!searchQuery && (
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
              <Link href="/training" className="flex-1">
                <button className="w-full py-3 px-4 rounded-xl bg-[var(--accent)] text-black font-semibold hover:bg-[var(--accent-light)] transition-colors">
                  התחל אימון חדש
                </button>
              </Link>
              <Link href="/consultation" className="flex-1">
                <button className="w-full py-3 px-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-medium hover:border-[var(--border-default)] transition-colors">
                  בקש ייעוץ
                </button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
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
                style={{ animationDelay: `${(index % 10) * 30}ms` }}
              >
                <article
                  className={cn(
                    "rounded-xl p-5 transition-colors slide-up",
                    "bg-[var(--bg-elevated)] border border-[var(--border-subtle)]",
                    "hover:border-[var(--border-default)]",
                    "focus-within:ring-2 focus-within:ring-[var(--accent)]"
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                        isTraining
                          ? "bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] text-black"
                          : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                      )}
                    >
                      {isTraining ? <Target size={22} /> : <MessageSquare size={22} />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[var(--text-primary)] truncate">
                          {session.scenario.title}
                        </h3>
                        <div className={cn("flex items-center gap-1 text-xs", statusConfig.color)}>
                          <StatusIcon size={12} />
                          <span className="hidden sm:inline">{statusConfig.label}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatRelativeTime(session.startedAt)}
                        </span>
                        
                        {isTraining && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-[var(--border-default)]" />
                            <span className={difficultyInfo.color}>
                              רמה {session.difficulty}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronLeft 
                      size={18} 
                      className="text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] group-hover:-translate-x-1 transition-all shrink-0" 
                    />
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
