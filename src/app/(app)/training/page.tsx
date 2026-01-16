"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Building,
  ShoppingCart,
  Home,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Target,
  Shield,
  Flame,
  Crown,
  Swords,
} from "lucide-react";
import { Button, Badge, Textarea } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { createSession } from "@/lib/firebase/firestore";
import { scenarioTemplates, scenarioCategories, getScenariosByCategory } from "@/data/scenarios";
import { cn, getDifficultyInfo } from "@/lib/utils";
import type { ScenarioCategory } from "@/types";

const categoryIcons: Record<string, React.ReactNode> = {
  salary: <Briefcase size={24} />,
  business: <Building size={24} />,
  bargaining: <ShoppingCart size={24} />,
  everyday: <Home size={24} />,
};

const difficultyIcons = [
  { icon: Shield, label: "מתחיל" },
  { icon: Shield, label: "קל" },
  { icon: Target, label: "בסיסי" },
  { icon: Target, label: "בינוני" },
  { icon: Flame, label: "מאתגר" },
  { icon: Flame, label: "קשה" },
  { icon: Swords, label: "מומחה" },
  { icon: Crown, label: "אגדי" },
];

export default function TrainingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<"category" | "scenario" | "difficulty" | "custom">("category");
  const [selectedCategory, setSelectedCategory] = useState<ScenarioCategory | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<typeof scenarioTemplates[0] | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(3);
  const [customScenario, setCustomScenario] = useState("");
  const [loading, setLoading] = useState(false);

  const stepNumber = useMemo(() => {
    if (step === "category") return 1;
    if (step === "scenario") return 2;
    if (step === "difficulty") return 3;
    if (step === "custom") return 2;
    return 1;
  }, [step]);

  const totalSteps = step === "custom" ? 2 : 3;

  const handleCategorySelect = (category: ScenarioCategory) => {
    setSelectedCategory(category);
    setStep("scenario");
  };

  const handleScenarioSelect = (scenario: typeof scenarioTemplates[0]) => {
    setSelectedScenario(scenario);
    setSelectedDifficulty(scenario.difficulty);
    setStep("difficulty");
  };

  const handleCustomScenario = () => {
    setSelectedCategory(null);
    setSelectedScenario(null);
    setStep("custom");
  };

  const handleStartTraining = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let scenario;
      
      if (selectedScenario) {
        scenario = {
          title: selectedScenario.title,
          description: selectedScenario.description,
          userRole: selectedScenario.userRole,
          aiRole: selectedScenario.aiRole,
          goal: selectedScenario.goal,
          category: selectedScenario.category,
        };
      } else if (customScenario) {
        scenario = {
          title: "תרחיש מותאם אישית",
          description: customScenario,
          userRole: "המשתמש",
          aiRole: "הצד השני במשא ומתן",
          goal: "להשיג את המטרה שהגדרת",
          category: "everyday" as ScenarioCategory,
        };
      } else {
        return;
      }

      const sessionId = await createSession(user.uid, {
        userId: user.uid,
        type: "training",
        difficulty: selectedDifficulty,
        status: "active",
        scenario,
        source: "web",
      });

      router.push(`/training/${sessionId}`);
    } catch (error) {
      console.error("Error creating session:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "scenario") {
      setStep("category");
      setSelectedCategory(null);
    } else if (step === "difficulty") {
      setStep("scenario");
      setSelectedScenario(null);
    } else if (step === "custom") {
      setStep("category");
    }
  };

  const difficultyLevels = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Steps - Minimal */}
      <div className="mb-10 fade-in">
        <div className="flex items-center justify-center gap-3 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                  i + 1 === stepNumber
                    ? "bg-[var(--accent)] text-black"
                    : i + 1 < stepNumber
                    ? "bg-[var(--accent-dark)] text-[var(--accent-light)]"
                    : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
                )}
              >
                {i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div
                  className={cn(
                    "w-10 h-0.5",
                    i + 1 < stepNumber ? "bg-[var(--accent)]" : "bg-[var(--border-subtle)]"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Header */}
        {step !== "category" && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
            aria-label="חזור לשלב הקודם"
          >
            <ArrowRight size={18} />
            <span>חזור</span>
          </button>
        )}
        
        <div className="text-center mb-1">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
            {step === "category" && "בחר קטגוריה"}
            {step === "scenario" && "בחר תרחיש"}
            {step === "difficulty" && "בחר רמת קושי"}
            {step === "custom" && "תאר את התרחיש"}
          </h1>
          <p className="text-[var(--text-secondary)] text-lg">
            {step === "category" && "על איזה סוג משא ומתן תרצה להתאמן?"}
            {step === "scenario" && "בחר תרחיש מוכן או צור משלך"}
            {step === "difficulty" && "כמה קשה תרצה שהיריב יהיה?"}
            {step === "custom" && "תאר את המצב שאתה רוצה להתאמן עליו"}
          </p>
        </div>
      </div>

      {/* Step: Category Selection */}
      {step === "category" && (
        <div className="space-y-4 slide-up">
          <div className="grid md:grid-cols-2 gap-4">
            {scenarioCategories.map((category, index) => (
              <button
                key={category.id}
                className={cn(
                  "group text-right rounded-2xl p-6 transition-colors",
                  "bg-[var(--bg-elevated)] border border-[var(--border-subtle)]",
                  "hover:border-[var(--border-default)]",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleCategorySelect(category.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-[var(--accent-subtle)] group-hover:text-[var(--accent)] transition-colors">
                    {categoryIcons[category.id]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-[var(--text-primary)] mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      {category.description}
                    </p>
                  </div>
                  <ChevronLeft 
                    size={20} 
                    className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:-translate-x-1 transition-all mt-1" 
                    aria-hidden="true"
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Custom Scenario Option */}
          <button
            className={cn(
              "group w-full text-right rounded-2xl p-6 transition-colors",
              "bg-[var(--bg-elevated)] border border-[var(--accent-dark)]",
              "hover:border-[var(--accent)]",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            )}
            onClick={handleCustomScenario}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center">
                <Sparkles size={24} className="text-[var(--accent)]" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-[var(--accent)] mb-1">
                  תרחיש מותאם אישית
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  תאר מצב ספציפי שאתה רוצה להתאמן עליו
                </p>
              </div>
              <ChevronLeft 
                size={20} 
                className="text-[var(--accent)] group-hover:-translate-x-1 transition-transform" 
                aria-hidden="true"
              />
            </div>
          </button>
        </div>
      )}

      {/* Step: Scenario Selection */}
      {step === "scenario" && selectedCategory && (
        <div className="space-y-3 slide-up">
          {getScenariosByCategory(selectedCategory).map((scenario, index) => (
            <button
              key={scenario.id}
              className={cn(
                "group w-full text-right rounded-xl p-5 transition-colors",
                "bg-[var(--bg-elevated)] border border-[var(--border-subtle)]",
                "hover:border-[var(--border-default)]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => handleScenarioSelect(scenario)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      {scenario.title}
                    </h3>
                    <Badge 
                      variant={scenario.difficulty <= 3 ? "success" : scenario.difficulty <= 5 ? "warning" : "error"} 
                      size="sm"
                    >
                      רמה {scenario.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {scenario.description}
                  </p>
                </div>
                <ChevronLeft 
                  size={18} 
                  className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:-translate-x-1 transition-all mt-1" 
                  aria-hidden="true"
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step: Difficulty Selection */}
      {step === "difficulty" && selectedScenario && (
        <div className="space-y-8 slide-up">
          {/* Selected Scenario Summary */}
          <div className="rounded-2xl p-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            <Badge variant="info" size="sm" className="mb-3">תרחיש נבחר</Badge>
            <h3 className="font-semibold text-xl text-[var(--text-primary)] mb-2">
              {selectedScenario.title}
            </h3>
            <p className="text-[var(--text-secondary)]">
              {selectedScenario.description}
            </p>
          </div>

          {/* Difficulty Grid */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-5 text-center">
              בחר את רמת הקושי של היריב שלך
            </label>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {difficultyLevels.map((level) => {
                const isSelected = selectedDifficulty === level;
                const IconComponent = difficultyIcons[level - 1].icon;
                
                return (
                  <button
                    key={level}
                    onClick={() => setSelectedDifficulty(level)}
                    className={cn(
                      "aspect-square rounded-xl flex flex-col items-center justify-center transition-colors",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                      isSelected
                        ? "bg-[var(--accent)] text-black"
                        : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)]"
                    )}
                    aria-label={`רמת קושי ${level}: ${difficultyIcons[level - 1].label}`}
                    aria-pressed={isSelected}
                  >
                    <IconComponent 
                      size={16} 
                      className={cn("mb-1", isSelected ? "text-black" : "text-[var(--text-muted)]")} 
                      aria-hidden="true"
                    />
                    <span className="text-lg font-bold">{level}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Description */}
          <div className="rounded-xl p-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold bg-[var(--accent)] text-black">
                {selectedDifficulty}
              </div>
              <div className="flex-1">
                <span className={cn("text-lg font-semibold", getDifficultyInfo(selectedDifficulty).color)}>
                  {getDifficultyInfo(selectedDifficulty).name}
                </span>
                <p className="text-[var(--text-secondary)] text-sm mt-1">
                  {getDifficultyInfo(selectedDifficulty).description}
                </p>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full text-lg py-5"
            onClick={handleStartTraining}
            loading={loading}
          >
            <Swords size={20} aria-hidden="true" />
            התחל אימון
          </Button>
        </div>
      )}

      {/* Step: Custom Scenario */}
      {step === "custom" && (
        <div className="space-y-6 slide-up">
          {/* Tips Card */}
          <div className="rounded-xl p-4 bg-[var(--accent-subtle)] border border-[var(--accent-dark)]">
            <div className="flex items-start gap-3">
              <Sparkles size={18} className="text-[var(--accent)] mt-0.5 shrink-0" aria-hidden="true" />
              <div className="text-sm">
                <p className="text-[var(--accent)] font-medium mb-1">טיפ ליצירת תרחיש טוב:</p>
                <p className="text-[var(--text-secondary)]">
                  תאר את הסיטואציה, מי הצד השני, מה האינטרסים שלכם, ומה המטרה שאתה רוצה להשיג.
                </p>
              </div>
            </div>
          </div>

          <Textarea
            label="תאר את המצב"
            placeholder="למשל: אני הולך לפגישה עם הבוס שלי לבקש העלאת שכר. הוא נוטה להגיד לא בהתחלה ולדחות את הדיון. אני עובד בחברה 3 שנים והביצועים שלי מצוינים…"
            value={customScenario}
            onChange={(e) => setCustomScenario(e.target.value)}
            className="min-h-[160px]"
            hint="ככל שתתאר יותר פרטים, כך האימון יהיה יותר מציאותי"
          />

          {/* Difficulty Selection for Custom */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-4">
              רמת קושי של היריב
            </label>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {difficultyLevels.map((level) => {
                const isSelected = selectedDifficulty === level;
                const IconComponent = difficultyIcons[level - 1].icon;
                
                return (
                  <button
                    key={level}
                    onClick={() => setSelectedDifficulty(level)}
                    className={cn(
                      "aspect-square rounded-xl flex flex-col items-center justify-center transition-colors",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                      isSelected
                        ? "bg-[var(--accent)] text-black"
                        : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)]"
                    )}
                    aria-label={`רמת קושי ${level}`}
                    aria-pressed={isSelected}
                  >
                    <IconComponent 
                      size={16} 
                      className={cn("mb-1", isSelected ? "text-black" : "text-[var(--text-muted)]")} 
                      aria-hidden="true"
                    />
                    <span className="text-lg font-bold">{level}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Selected difficulty info */}
            <p className="text-center text-sm text-[var(--text-muted)] mt-4">
              {getDifficultyInfo(selectedDifficulty).name} - {getDifficultyInfo(selectedDifficulty).description}
            </p>
          </div>

          {/* Start Button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full text-lg py-5"
            onClick={handleStartTraining}
            loading={loading}
            disabled={!customScenario.trim()}
          >
            <Sparkles size={20} aria-hidden="true" />
            התחל אימון מותאם אישית
          </Button>
        </div>
      )}
    </div>
  );
}
