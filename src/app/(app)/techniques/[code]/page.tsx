"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowRight, Heart, Scale, Brain, Swords, Target, BookOpen, Zap } from "lucide-react";
import { Button, Card, Badge } from "@/components/ui";
import { getTechniqueByCode, techniques } from "@/data/techniques";
import { cn, getCategoryInfo } from "@/lib/utils";

interface Props {
  params: Promise<{ code: string }>;
}

const categoryIcons: Record<string, React.ReactNode> = {
  tactical_empathy: <Heart size={32} />,
  harvard: <Scale size={32} />,
  psychology: <Brain size={32} />,
  hardball: <Swords size={32} />,
};

const categoryColors: Record<string, string> = {
  tactical_empathy: "from-pink-500 to-pink-700",
  harvard: "from-blue-500 to-blue-700",
  psychology: "from-purple-500 to-purple-700",
  hardball: "from-red-500 to-red-700",
};

export default function TechniqueDetailPage({ params }: Props) {
  const { code } = use(params);
  const technique = getTechniqueByCode(code);

  if (!technique) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--text-secondary)]">טכניקה לא נמצאה</p>
        <Link href="/techniques" className="text-[var(--accent)] mt-4 inline-block">
          חזור לספריית הטכניקות
        </Link>
      </div>
    );
  }

  const catInfo = getCategoryInfo(technique.category);
  const counterTechniques = technique.counterTechniques
    .map((code) => techniques.find((t) => t.code === code))
    .filter(Boolean);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Link */}
      <Link
        href="/techniques"
        className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors animate-fade-in"
      >
        <ArrowRight size={20} />
        חזור לספריית הטכניקות
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8 animate-fade-in-up">
        <div
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0",
            `bg-gradient-to-br ${categoryColors[technique.category]} text-white`
          )}
        >
          {categoryIcons[technique.category]}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">{technique.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="gold">{technique.nameEn}</Badge>
            <span className={cn("text-sm", catInfo.color)}>{catInfo.name}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <Card className="mb-6 animate-fade-in-up stagger-1" hover={false}>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={20} className="text-[var(--accent)]" />
          <h2 className="font-semibold text-[var(--text-primary)]">תיאור</h2>
        </div>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          {technique.description}
        </p>
      </Card>

      {/* When to Use */}
      <Card className="mb-6 animate-fade-in-up stagger-2" hover={false}>
        <div className="flex items-center gap-2 mb-3">
          <Target size={20} className="text-[var(--accent)]" />
          <h2 className="font-semibold text-[var(--text-primary)]">מתי להשתמש?</h2>
        </div>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          {technique.whenToUse}
        </p>
      </Card>

      {/* Examples */}
      <Card className="mb-6 animate-fade-in-up stagger-3" hover={false}>
        <div className="flex items-center gap-2 mb-4">
          <Zap size={20} className="text-[var(--accent)]" />
          <h2 className="font-semibold text-[var(--text-primary)]">דוגמאות</h2>
        </div>
        <div className="space-y-3">
          {technique.examples.map((example, index) => (
            <div
              key={index}
              className="p-4 rounded-[var(--radius-md)] bg-[var(--bg-secondary)] border border-[var(--border-subtle)]"
            >
              <p className="text-[var(--text-primary)] italic">"{example}"</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Counter Techniques */}
      {counterTechniques.length > 0 && (
        <Card className="mb-6 animate-fade-in-up stagger-4" hover={false}>
          <div className="flex items-center gap-2 mb-4">
            <Swords size={20} className="text-[var(--warning)]" />
            <h2 className="font-semibold text-[var(--text-primary)]">טכניקות נגד</h2>
          </div>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            טכניקות שיכולות לנטרל או להגיב לטכניקה זו:
          </p>
          <div className="flex flex-wrap gap-2">
            {counterTechniques.map((ct) => (
              <Link key={ct!.code} href={`/techniques/${ct!.code}`}>
                <Badge variant="default" size="md" className="cursor-pointer hover:bg-[var(--bg-hover)]">
                  {ct!.name}
                </Badge>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Difficulty */}
      <Card className="mb-8 animate-fade-in-up stagger-5" hover={false}>
        <div className="flex items-center justify-between">
          <span className="text-[var(--text-secondary)]">רמת קושי ללמידה</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={cn(
                  "w-4 h-4 rounded-full",
                  level <= technique.difficulty
                    ? "bg-[var(--accent)]"
                    : "bg-[var(--bg-secondary)]"
                )}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Practice Button */}
      <div className="animate-fade-in-up stagger-6">
        <Link href="/training">
          <Button variant="primary" size="lg" className="w-full" icon={<Target size={20} />}>
            תרגל טכניקה זו
          </Button>
        </Link>
      </div>
    </div>
  );
}
