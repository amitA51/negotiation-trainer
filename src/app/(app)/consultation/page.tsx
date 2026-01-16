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
import { Button, Card, Textarea } from "@/components/ui";
import { createConsultation, addConsultationMessage } from "@/lib/firebase/firestore";
import { cn } from "@/lib/utils";

const exampleSituations = [
  {
    icon: TrendingUp,
    title: "משא ומתן שכר",
    text: "קיבלתי הצעת עבודה ואני רוצה לנהל משא ומתן על השכר",
    gradient: "from-emerald-500/20 to-teal-500/10",
  },
  {
    icon: Users,
    title: "מול הבוס",
    text: "אני צריך לבקש מהבוס לעבוד מהבית יותר ימים בשבוע",
    gradient: "from-blue-500/20 to-indigo-500/10",
  },
  {
    icon: Target,
    title: "משא ומתן עסקי",
    text: "יש לי פגישה עם ספק ואני רוצה להוריד את המחירים",
    gradient: "from-orange-500/20 to-amber-500/10",
  },
  {
    icon: Shield,
    title: "קונפליקט אישי",
    text: "השכן שלי עושה רעש בלילות ואני לא יודע איך לגשת לזה",
    gradient: "from-purple-500/20 to-pink-500/10",
  },
];

const tips = [
  "מי הצד השני ומה הקשר שלכם?",
  "מה המטרה הסופית שלך?",
  "מה האתגרים או ההתנגדויות הצפויות?",
  "יש לך אלטרנטיבות (BATNA)?",
];

export default function ConsultationPage() {
  const router = useRouter();
  const { user } = useAuth();
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
    } finally {
      setLoading(false);
    }
  };

  const characterCount = situation.length;
  const isValidLength = characterCount >= 20;

  return (
    <div className="max-w-4xl mx-auto relative">
      {/* Decorative Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Hero Header */}
      <div className="text-center mb-10 animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] mb-4 shadow-[0_0_30px_var(--accent-glow)]">
          <MessageSquare size={32} className="text-black" aria-hidden="true" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3">
          ייעוץ אישי
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-lg mx-auto">
          תאר מצב אמיתי שאתה מתמודד איתו וקבל עצות מקצועיות מותאמות אישית
        </p>
      </div>

      {/* Main Card */}
      <div className="relative mb-8 animate-fade-in-up">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/5 to-transparent rounded-3xl" aria-hidden="true" />
        
        <div className="relative overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
          {/* Card Header */}
          <div className="p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center shrink-0">
                <Lightbulb size={24} className="text-[var(--accent)]" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-lg text-[var(--text-primary)] mb-1">
                  ספר לי על המצב
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  ככל שתספק יותר פרטים, העצות יהיו מדויקות ויעילות יותר
                </p>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6">
            <Textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder={`תאר את המצב שלך בפירוט…

למשל:
• אני הולך לפגישה עם הבוס שלי מחר לבקש העלאת שכר
• הוא נוטה להגיד לא בהתחלה ולדחות את הדיון
• אני עובד בחברה כבר 3 שנים וקיבלתי הצעה מחברה אחרת
• מה כדאי לי להגיד? איך להתכונן?`}
              className="min-h-[180px] mb-4 resize-none"
            />

            {/* Character count & validation */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-sm">
                {isValidLength ? (
                  <CheckCircle2 size={16} className="text-green-500" aria-hidden="true" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-[var(--text-muted)]" aria-hidden="true" />
                )}
                <span className={cn(
                  "transition-colors",
                  isValidLength ? "text-green-500" : "text-[var(--text-muted)]"
                )}>
                  {characterCount} תווים {!isValidLength && "(מינימום 20)"}
                </span>
              </div>
            </div>

            {/* Tips */}
            <div className="mb-6 p-4 rounded-xl bg-[var(--bg-hover)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-[var(--accent)]" aria-hidden="true" />
                <span className="text-sm font-medium text-[var(--accent)]">מה כדאי לכלול:</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {tips.map((tip, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                    {tip}
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full text-lg py-6 group"
              onClick={handleStart}
              loading={loading}
              disabled={!isValidLength}
            >
              <span className="flex items-center justify-center gap-2">
                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" aria-hidden="true" />
                שלח וקבל ייעוץ
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Example Situations */}
      <div className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Target size={20} className="text-[var(--accent)]" aria-hidden="true" />
          דוגמאות למצבים נפוצים
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {exampleSituations.map((example, index) => {
            const IconComponent = example.icon;
            return (
              <button
                key={index}
                onClick={() => setSituation(example.text)}
                className={cn(
                  "group relative overflow-hidden text-right p-4 rounded-xl transition-all duration-300",
                  "bg-[var(--bg-card)] border border-[var(--border-subtle)]",
                  "hover:border-[var(--accent-dark)] hover:shadow-lg",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                )}
                style={{ animationDelay: `${index * 75}ms` }}
              >
                {/* Gradient overlay on hover */}
                <div 
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    example.gradient
                  )}
                  aria-hidden="true"
                />

                <div className="relative flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors shrink-0">
                    <IconComponent size={20} aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent)] transition-colors">
                      {example.title}
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {example.text}
                    </p>
                  </div>
                  <ArrowLeft 
                    size={18} 
                    className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all shrink-0 mt-2" 
                    aria-hidden="true"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Info */}
      <div className="mt-10 text-center animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          <Shield size={16} className="text-[var(--accent)]" aria-hidden="true" />
          <span className="text-sm text-[var(--text-muted)]">
            השיחות שלך פרטיות ומאובטחות
          </span>
        </div>
      </div>
    </div>
  );
}
