/**
 * ScenarioList Component
 * Displays list of scenarios for a selected category
 */

'use client';

import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui';
import { getScenariosByCategory } from '@/data/scenarios';
import type { ScenarioCategory } from '@/types';
import type { ScenarioTemplate } from './types';

interface ScenarioListProps {
  category: ScenarioCategory;
  onSelect: (scenario: ScenarioTemplate) => void;
}

export function ScenarioList({ category, onSelect }: ScenarioListProps) {
  const scenarios = getScenariosByCategory(category);

  return (
    <div className="space-y-3 slide-up">
      {scenarios.map((scenario, index) => (
        <ScenarioCard
          key={scenario.id}
          scenario={scenario}
          index={index}
          onSelect={() => onSelect(scenario)}
        />
      ))}
    </div>
  );
}

interface ScenarioCardProps {
  scenario: ScenarioTemplate;
  index: number;
  onSelect: () => void;
}

function ScenarioCard({ scenario, index, onSelect }: ScenarioCardProps) {
  const getBadgeVariant = (difficulty: number) => {
    if (difficulty <= 3) return 'success';
    if (difficulty <= 5) return 'warning';
    return 'error';
  };

  return (
    <button
      className={cn(
        'group w-full text-right rounded-xl p-5 transition-colors',
        'bg-[var(--bg-elevated)] border border-[var(--border-subtle)]',
        'hover:border-[var(--border-default)]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onSelect}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-[var(--text-primary)]">
              {scenario.title}
            </h3>
            <Badge
              variant={getBadgeVariant(scenario.difficulty)}
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
  );
}

// Scenario summary card for confirmation step
export function ScenarioSummary({ scenario }: { scenario: ScenarioTemplate }) {
  return (
    <div className="rounded-2xl p-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
      <Badge variant="info" size="sm" className="mb-3">
        תרחיש נבחר
      </Badge>
      <h3 className="font-semibold text-xl text-[var(--text-primary)] mb-2">
        {scenario.title}
      </h3>
      <p className="text-[var(--text-secondary)]">{scenario.description}</p>
    </div>
  );
}
