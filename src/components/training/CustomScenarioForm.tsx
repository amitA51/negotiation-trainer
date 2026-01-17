/**
 * CustomScenarioForm Component
 * Form for creating custom training scenarios
 */

'use client';

import { Sparkles } from 'lucide-react';
import { Button, Textarea } from '@/components/ui';
import { DifficultySelector } from './DifficultySelector';
import { getDifficultyInfo } from '@/lib/utils';

interface CustomScenarioFormProps {
  value: string;
  onChange: (value: string) => void;
  difficulty: number;
  onDifficultyChange: (level: number) => void;
  onSubmit: () => void;
  loading?: boolean;
}

export function CustomScenarioForm({
  value,
  onChange,
  difficulty,
  onDifficultyChange,
  onSubmit,
  loading = false,
}: CustomScenarioFormProps) {
  const difficultyInfo = getDifficultyInfo(difficulty);
  const isValid = value.trim().length > 0;

  return (
    <div className="space-y-6 slide-up">
      {/* Tips Card */}
      <TipsCard />

      {/* Scenario Input */}
      <Textarea
        label="תאר את המצב"
        placeholder="למשל: אני הולך לפגישה עם הבוס שלי לבקש העלאת שכר. הוא נוטה להגיד לא בהתחלה ולדחות את הדיון. אני עובד בחברה 3 שנים והביצועים שלי מצוינים…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[160px]"
        hint="ככל שתתאר יותר פרטים, כך האימון יהיה יותר מציאותי"
      />

      {/* Difficulty Selection */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-4">
          רמת קושי של היריב
        </label>
        <DifficultySelector
          value={difficulty}
          onChange={onDifficultyChange}
          showDescription={false}
          showLabel={false}
        />

        {/* Compact difficulty info */}
        <p className="text-center text-sm text-[var(--text-muted)] mt-4">
          {difficultyInfo.name} - {difficultyInfo.description}
        </p>
      </div>

      {/* Submit Button */}
      <Button
        variant="primary"
        size="lg"
        className="w-full text-lg py-5"
        onClick={onSubmit}
        loading={loading}
        disabled={!isValid}
      >
        <Sparkles size={20} aria-hidden="true" />
        התחל אימון מותאם אישית
      </Button>
    </div>
  );
}

// Tips card component
function TipsCard() {
  return (
    <div className="rounded-xl p-4 bg-[var(--accent-subtle)] border border-[var(--accent-dark)]">
      <div className="flex items-start gap-3">
        <Sparkles
          size={18}
          className="text-[var(--accent)] mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <div className="text-sm">
          <p className="text-[var(--accent)] font-medium mb-1">
            טיפ ליצירת תרחיש טוב:
          </p>
          <p className="text-[var(--text-secondary)]">
            תאר את הסיטואציה, מי הצד השני, מה האינטרסים שלכם, ומה המטרה שאתה רוצה להשיג.
          </p>
        </div>
      </div>
    </div>
  );
}
