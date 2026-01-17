"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  MessageSquare, 
  Send, 
  Lightbulb, 
  Target, 
  Users, 
  TrendingUp,
  Shield,
  Sparkles,
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Textarea } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { createConsultation, addConsultationMessage } from "@/lib/firebase/firestore";
import { CONSULTATION_EXAMPLES, CONSULTATION_TIPS } from "@/data/tips";
import { MIN_CONSULTATION_CHARS } from "@/data/constants";
import { cn } from "@/lib/utils";

export default function ConsultationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [situation, setSituation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!user || !situation.trim()) return;
    
    setLoading(true);
    try {
      const consultationId = await createConsultation(user.uid, situation);
      
      await addConsultationMessage(consultationId, {
        role: "user",
        content: situation,
      });

      router.push(`/consultation/${consultationId}`);
    } catch (error) {
      console.error("Error creating consultation:", error);
      showToast("שגיאה ביצירת הייעוץ. נסה שוב.", "error");
    } finally {
      setLoading(false);
    }
  };

  const characterCount = situation.length;
  const isValidLength = characterCount >= MIN_CONSULTATION_CHARS;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header - Minimal */}
      <div className="text-center mb-10 fade-in">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] mb-4">
          <MessageSquare size={28} className="text-black" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
          ייעוץ אישי
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-lg mx-auto">
          תאר מצב אמיתי שאתה מתמודד איתו וקבל עצות מקצועיות מותאמות אישית
        </p>
      </div>

      {/* Main Card */}
      <div className="mb-8 slide-up">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden">
          {/* Card Header */}
          <div className="p-5 border-b border-[var(--border-subtle)]">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center shrink-0">
                <Lightbulb size={22} className="text-[var(--accent)]" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg text-[var(--text-primary)] mb-1">
                  ספר לי על המצב
                </h2>
                <p className="text-sm text-[var(--text-muted)]">
                  ככל שתספק יותר פרטים, העצות יהיו מדויקות יותר
                </p>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-5">
            <Textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder={`תאר את המצב שלך בפירוט…

למשל:
• אני הולך לפגישה עם הבוס שלי מחר לבקש העלאת שכר
• הוא נוטה להגיד לא בהתחלה ולדחות את הדיון
• אני עובד בחברה כבר 3 שנים וקיבלתי הצעה מחברה אחרת
• מה כדאי לי להגיד? איך להתכונן?`}
              className="min-h-[160px] mb-4 resize-none"
            />

            {/* Character count & validation */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 text-sm">
                {isValidLength ? (
                  <CheckCircle2 size={16} className="text-green-500" aria-hidden="true" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-[var(--text-muted)]" aria-hidden="true" />
                )}
                <span className={cn(
                  isValidLength ? "text-green-500" : "text-[var(--text-muted)]"
                )}>
                  {characterCount} תווים {!isValidLength && `(מינימום ${MIN_CONSULTATION_CHARS})`}
                </span>
              </div>
            </div>

            {/* Tips */}
            <div className="mb-5 p-4 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-[var(--accent)]" aria-hidden="true" />
                <span className="text-sm font-medium text-[var(--accent)]">מה כדאי לכלול:</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {CONSULTATION_TIPS.map((tip, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <div className="w-1 h-1 rounded-full bg-[var(--text-muted)]" aria-hidden="true" />
                    {tip}
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full text-lg py-5"
              onClick={handleStart}
              loading={loading}
              disabled={!isValidLength}
            >
              <Send size={18} aria-hidden="true" />
              שלח וקבל ייעוץ
            </Button>
          </div>
        </div>
      </div>

      {/* Example Situations */}
      <div className="slide-up" style={{ animationDelay: '100ms' }}>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Target size={18} className="text-[var(--accent)]" aria-hidden="true" />
          דוגמאות למצבים נפוצים
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {CONSULTATION_EXAMPLES.map((example, index) => {
            const IconComponent = example.icon;
            return (
              <button
                key={index}
                onClick={() => setSituation(example.text)}
                className={cn(
                  "group text-right p-4 rounded-xl transition-colors",
                  "bg-[var(--bg-elevated)] border border-[var(--border-subtle)]",
                  "hover:border-[var(--border-default)]",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors shrink-0">
                    <IconComponent size={20} aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-[var(--text-primary)] mb-1">
                      {example.title}
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {example.text}
                    </p>
                  </div>
                  <ArrowLeft 
                    size={16} 
                    className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-2" 
                    aria-hidden="true"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Info */}
      <div className="mt-10 text-center fade-in" style={{ animationDelay: '200ms' }}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          <Shield size={14} className="text-[var(--text-muted)]" aria-hidden="true" />
          <span className="text-sm text-[var(--text-muted)]">
            השיחות שלך פרטיות ומאובטחות
          </span>
        </div>
      </div>
    </div>
  );
}
