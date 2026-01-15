"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  AlertCircle,
  Lightbulb,
  RotateCcw,
  ArrowLeft,
  Home,
  Target,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Card, Badge, ScoreCircle, Spinner, Skeleton } from "@/components/ui";
import { getSession, getMessages, saveAnalysis, getAnalysis, updateUserStats } from "@/lib/firebase/firestore";
import { getTechniqueByCode } from "@/data/techniques";
import { cn, getDifficultyInfo } from "@/lib/utils";
import type { Session, Message, SessionAnalysis, TechniqueUsage } from "@/types";

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default function TrainingSummaryPage({ params }: Props) {
  const { sessionId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  
  const [session, setSession] = useState<Session | null>(null);
  const [analysis, setAnalysis] = useState<SessionAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    async function loadAndAnalyze() {
      if (!user) return;

      try {
        // Load session
        const sessionData = await getSession(sessionId);
        if (!sessionData || sessionData.userId !== user.uid) {
          router.push("/training");
          return;
        }
        setSession(sessionData);

        // Check if analysis already exists
        const existingAnalysis = await getAnalysis(sessionId);
        if (existingAnalysis) {
          setAnalysis(existingAnalysis);
          setLoading(false);
          return;
        }

        // Load messages and analyze
        setLoading(false);
        setAnalyzing(true);

        const messages = await getMessages(sessionId);
        
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: messages.map((m) => ({ role: m.role, content: m.content })),
            userGoal: sessionData.scenario.goal,
            difficulty: sessionData.difficulty,
          }),
        });

        const analysisData = await response.json();
        
        // Save analysis
        await saveAnalysis(sessionId, analysisData);
        
        // Update user stats
        await updateUserStats(
          user.uid,
          sessionId,
          analysisData.score,
          analysisData.techniquesUsed.map((t: TechniqueUsage) => t.code)
        );

        setAnalysis({
          id: sessionId,
          sessionId,
          createdAt: new Date(),
          ...analysisData,
        });
      } catch (error) {
        console.error("Error loading analysis:", error);
      } finally {
        setAnalyzing(false);
        setLoading(false);
      }
    }

    loadAndAnalyze();
  }, [sessionId, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--text-secondary)]">סשן לא נמצא</p>
      </div>
    );
  }

  const difficultyInfo = getDifficultyInfo(session.difficulty);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          חזור לדף הבית
        </Link>
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">סיכום אימון</h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[var(--text-secondary)]">{session.scenario.title}</span>
          <Badge variant="gold" size="sm">רמה {session.difficulty}</Badge>
        </div>
      </div>

      {analyzing ? (
        // Analyzing State
        <Card variant="glass" className="text-center py-12 animate-fade-in-up stagger-1">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--accent-subtle)] mb-6 animate-pulse">
            <Target size={32} className="text-[var(--accent)]" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            מנתח את המשא ומתן...
          </h2>
          <p className="text-[var(--text-secondary)]">
            זה עשוי לקחת מספר שניות
          </p>
          <Spinner className="mx-auto mt-6" />
        </Card>
      ) : analysis ? (
        <>
          {/* Score Card */}
          <Card variant="gold" className="animate-fade-in-up stagger-1">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <ScoreCircle score={analysis.score} size={140} />
              <div className="text-center md:text-right flex-1">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  {analysis.score >= 80 && "מעולה! 🎉"}
                  {analysis.score >= 60 && analysis.score < 80 && "כל הכבוד! 👏"}
                  {analysis.score >= 40 && analysis.score < 60 && "יש מקום לשיפור 💪"}
                  {analysis.score < 40 && "נסה שוב, אתה יכול! 🔄"}
                </h2>
                <p className="text-[var(--text-secondary)]">
                  {analysis.dealSummary}
                </p>
              </div>
            </div>
          </Card>

          {/* Techniques Used */}
          {analysis.techniquesUsed.length > 0 && (
            <Card className="animate-fade-in-up stagger-2">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Target size={20} className="text-[var(--accent)]" />
                טכניקות שזוהו
              </h3>
              <div className="space-y-4">
                {analysis.techniquesUsed.map((tech, index) => {
                  const techniqueInfo = getTechniqueByCode(tech.code);
                  return (
                    <div
                      key={index}
                      className="p-4 rounded-[var(--radius-md)] bg-[var(--bg-secondary)] border border-[var(--border-subtle)]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[var(--text-primary)]">
                            {techniqueInfo?.name || tech.code}
                          </span>
                          <Badge variant="gold" size="sm">
                            {tech.effectiveness}/5
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] italic">
                        "{tech.example}"
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Strengths & Improvements */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Strengths */}
            <Card className="animate-fade-in-up stagger-3">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-[var(--success)]" />
                נקודות חוזק
              </h3>
              <ul className="space-y-2">
                {analysis.strengths.map((strength, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-[var(--text-secondary)]"
                  >
                    <span className="text-[var(--success)] mt-1">✓</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Improvements */}
            <Card className="animate-fade-in-up stagger-4">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <AlertCircle size={20} className="text-[var(--warning)]" />
                לשיפור
              </h3>
              <ul className="space-y-2">
                {analysis.improvements.map((improvement, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-[var(--text-secondary)]"
                  >
                    <span className="text-[var(--warning)] mt-1">→</span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Recommendations */}
          <Card variant="glass" className="animate-fade-in-up stagger-5">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Lightbulb size={20} className="text-[var(--accent)]" />
              המלצות ללמידה
            </h3>
            <ul className="space-y-2">
              {analysis.recommendations.map((rec, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-[var(--text-secondary)]"
                >
                  <span className="text-[var(--accent)] mt-1">💡</span>
                  {rec}
                </li>
              ))}
            </ul>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up stagger-6">
            <Link href="/training" className="flex-1">
              <Button variant="primary" className="w-full" icon={<RotateCcw size={20} />}>
                אימון חדש
              </Button>
            </Link>
            <Link href="/dashboard" className="flex-1">
              <Button variant="secondary" className="w-full" icon={<Home size={20} />}>
                חזור לדף הבית
              </Button>
            </Link>
          </div>
        </>
      ) : (
        <Card className="text-center py-12">
          <p className="text-[var(--text-secondary)]">לא ניתן לטעון את הניתוח</p>
        </Card>
      )}
    </div>
  );
}
