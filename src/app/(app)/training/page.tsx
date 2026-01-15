"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Building,
  ShoppingCart,
  Home,
  ChevronLeft,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button, Card, Badge, Textarea } from "@/components/ui";
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

export default function TrainingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<"category" | "scenario" | "difficulty" | "custom">("category");
  const [selectedCategory, setSelectedCategory] = useState<ScenarioCategory | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<typeof scenarioTemplates[0] | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(3);
  const [customScenario, setCustomScenario] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        {step !== "category" && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4 transition-colors"
          >
            <ArrowRight size={20} />
            <span>חזור</span>
          </button>
        )}
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          {step === "category" && "בחר קטגוריה"}
          {step === "scenario" && "בחר תרחיש"}
          {step === "difficulty" && "בחר רמת קושי"}
          {step === "custom" && "תאר את התרחיש"}
        </h1>
        <p className="text-[var(--text-secondary)] mt-2">
          {step === "category" && "על איזה סוג משא ומתן תרצה להתאמן?"}
          {step === "scenario" && "בחר תרחיש מוכן או צור משלך"}
          {step === "difficulty" && "כמה קשה תרצה שהיריב יהיה?"}
          {step === "custom" && "תאר את המצב שאתה רוצה להתאמן עליו"}
        </p>
      </div>

      {/* Step: Category Selection */}
      {step === "category" && (
        <div className="space-y-4 animate-fade-in-up stagger-1">
          <div className="grid md:grid-cols-2 gap-4">
            {scenarioCategories.map((category, index) => (
              <Card
                key={category.id}
                variant="default"
                className={cn(
                  "cursor-pointer group",
                  `stagger-${index + 1}`
                )}
                onClick={() => handleCategorySelect(category.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-[var(--accent-subtle)] group-hover:text-[var(--accent)] transition-colors">
                    {categoryIcons[category.id]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)]">
                      {category.description}
                    </p>
                  </div>
                  <ChevronLeft size={20} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:-translate-x-1 transition-all" />
                </div>
              </Card>
            ))}
          </div>

          {/* Custom Scenario Option */}
          <Card
            variant="gold"
            className="cursor-pointer group"
            onClick={handleCustomScenario}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center">
                <Sparkles size={24} className="text-[var(--accent)]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[var(--text-primary)] mb-1">
                  תרחיש מותאם אישית
                </h3>
                <p className="text-sm text-[var(--text-muted)]">
                  תאר מצב ספציפי שאתה רוצה להתאמן עליו
                </p>
              </div>
              <ChevronLeft size={20} className="text-[var(--accent)] group-hover:-translate-x-1 transition-transform" />
            </div>
          </Card>
        </div>
      )}

      {/* Step: Scenario Selection */}
      {step === "scenario" && selectedCategory && (
        <div className="space-y-4 animate-fade-in-up">
          {getScenariosByCategory(selectedCategory).map((scenario, index) => (
            <Card
              key={scenario.id}
              className={cn("cursor-pointer group", `stagger-${index + 1}`)}
              onClick={() => handleScenarioSelect(scenario)}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-[var(--text-primary)]">
                      {scenario.title}
                    </h3>
                    <Badge variant="default" size="sm">
                      רמה {scenario.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {scenario.description}
                  </p>
                </div>
                <ChevronLeft size={20} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:-translate-x-1 transition-all mt-1" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Step: Difficulty Selection */}
      {step === "difficulty" && selectedScenario && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Selected Scenario Summary */}
          <Card variant="glass" hover={false} className="border-[var(--accent-dark)]">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">
              {selectedScenario.title}
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {selectedScenario.description}
            </p>
          </Card>

          {/* Difficulty Grid */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {difficultyLevels.map((level) => {
              const info = getDifficultyInfo(level);
              const isSelected = selectedDifficulty === level;
              
              return (
                <button
                  key={level}
                  onClick={() => setSelectedDifficulty(level)}
                  className={cn(
                    "aspect-square rounded-[var(--radius-md)] flex flex-col items-center justify-center transition-all",
                    isSelected
                      ? "bg-[var(--accent)] text-black shadow-[0_0_20px_var(--accent-glow)]"
                      : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)]"
                  )}
                >
                  <span className="text-2xl font-bold">{level}</span>
                </button>
              );
            })}
          </div>

          {/* Difficulty Description */}
          <Card hover={false}>
            <div className="flex items-center gap-3 mb-2">
              <span className={cn("text-lg font-semibold", getDifficultyInfo(selectedDifficulty).color)}>
                רמה {selectedDifficulty}: {getDifficultyInfo(selectedDifficulty).name}
              </span>
            </div>
            <p className="text-[var(--text-secondary)]">
              {getDifficultyInfo(selectedDifficulty).description}
            </p>
          </Card>

          {/* Start Button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleStartTraining}
            loading={loading}
          >
            התחל אימון
          </Button>
        </div>
      )}

      {/* Step: Custom Scenario */}
      {step === "custom" && (
        <div className="space-y-6 animate-fade-in-up">
          <Textarea
            label="תאר את המצב"
            placeholder="למשל: אני הולך לפגישה עם הבוס שלי לבקש העלאת שכר. הוא נוטה להגיד לא בהתחלה ולדחות את הדיון..."
            value={customScenario}
            onChange={(e) => setCustomScenario(e.target.value)}
            className="min-h-[200px]"
            hint="תאר את המצב, מי הצד השני, ומה המטרה שלך"
          />

          {/* Difficulty Selection for Custom */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
              רמת קושי
            </label>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {difficultyLevels.map((level) => {
                const isSelected = selectedDifficulty === level;
                
                return (
                  <button
                    key={level}
                    onClick={() => setSelectedDifficulty(level)}
                    className={cn(
                      "aspect-square rounded-[var(--radius-md)] flex flex-col items-center justify-center transition-all",
                      isSelected
                        ? "bg-[var(--accent)] text-black shadow-[0_0_20px_var(--accent-glow)]"
                        : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] border border-[var(--border-subtle)]"
                    )}
                  >
                    <span className="text-xl font-bold">{level}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start Button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleStartTraining}
            loading={loading}
            disabled={!customScenario.trim()}
          >
            התחל אימון
          </Button>
        </div>
      )}
    </div>
  );
}
