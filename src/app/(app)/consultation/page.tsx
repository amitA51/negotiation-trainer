"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Send, Paperclip } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Card, Textarea } from "@/components/ui";
import { createConsultation, addConsultationMessage } from "@/lib/firebase/firestore";

export default function ConsultationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [situation, setSituation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!user || !situation.trim()) return;
    
    setLoading(true);
    try {
      // Create consultation
      const consultationId = await createConsultation(user.uid, situation);
      
      // Add the initial situation as first message
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

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">ייעוץ אישי</h1>
        <p className="text-[var(--text-secondary)] mt-2">
          תאר מצב אמיתי שאתה מתמודד איתו וקבל עצות מקצועיות
        </p>
      </div>

      {/* Main Card */}
      <Card variant="default" className="animate-fade-in-up stagger-1" hover={false}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center">
            <MessageSquare size={24} className="text-[var(--accent)]" />
          </div>
          <div>
            <h2 className="font-semibold text-[var(--text-primary)]">ספר לי על המצב</h2>
            <p className="text-sm text-[var(--text-muted)]">ככל שתתן יותר פרטים, העצות יהיו יותר מדויקות</p>
          </div>
        </div>

        <Textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          placeholder={`למשל:
• אני הולך לפגישה עם הבוס שלי מחר לבקש העלאת שכר
• הוא נוטה להגיד לא בהתחלה ולדחות את הדיון
• אני עובד בחברה כבר 3 שנים וקיבלתי הצעה מחברה אחרת
• מה כדאי לי להגיד? איך להתכונן?`}
          className="min-h-[200px] mb-4"
        />

        <p className="text-sm text-[var(--text-muted)] mb-6">
          💡 טיפ: כלול פרטים כמו מי הצד השני, מה המטרה שלך, מה האתגרים שאתה צופה
        </p>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={handleStart}
          loading={loading}
          disabled={!situation.trim()}
          icon={<Send size={20} />}
        >
          שלח וקבל ייעוץ
        </Button>
      </Card>

      {/* Examples */}
      <div className="mt-8 animate-fade-in-up stagger-2">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">דוגמאות למצבים:</h3>
        <div className="grid gap-3">
          {[
            "אני צריך לבקש מהבוס לעבוד מהבית יותר ימים בשבוע",
            "יש לי פגישה עם ספק ואני רוצה להוריד את המחירים",
            "השכן שלי עושה רעש בלילות ואני לא יודע איך לגשת לזה",
            "קיבלתי הצעת עבודה ואני רוצה לנהל משא ומתן על השכר",
          ].map((example, index) => (
            <button
              key={index}
              onClick={() => setSituation(example)}
              className="text-right p-4 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-all"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
