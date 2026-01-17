/**
 * CategoryGrid Component
 * Displays training category options in a grid layout
 */

'use client';

import { ChevronLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { scenarioCategories, scenarioTemplates } from '@/data/scenarios';
import { categoryIcons } from './constants';
import type { ScenarioCategory } from '@/types';
import type { ScenarioTemplate } from './types';

interface CategoryGridProps {
  onCategorySelect: (category: ScenarioCategory) => void;
  onCustomSelect: () => void;
  recentScenarios?: string[];
  onRecentSelect?: (scenario: ScenarioTemplate) => void;
}

export function CategoryGrid({
  onCategorySelect,
  onCustomSelect,
  recentScenarios = [],
  onRecentSelect,
}: CategoryGridProps) {
  return (
    <div className="space-y-4 slide-up">
      {/* Recent Scenarios */}
      {recentScenarios.length > 0 && onRecentSelect && (
        <RecentScenarios
          scenarioIds={recentScenarios}
          onSelect={onRecentSelect}
        />
      )}

      {/* Category Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {scenarioCategories.map((category, index) => (
          <button
            key={category.id}
            className={cn(
              'group text-right rounded-2xl p-6 transition-colors',
              'bg-[var(--bg-elevated)] border border-[var(--border-subtle)]',
              'hover:border-[var(--border-default)]',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => onCategorySelect(category.id)}
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
      <CustomScenarioButton onClick={onCustomSelect} />
    </div>
  );
}

// Recent scenarios quick access
function RecentScenarios({
  scenarioIds,
  onSelect,
}: {
  scenarioIds: string[];
  onSelect: (scenario: ScenarioTemplate) => void;
}) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-[var(--text-muted)] mb-3">
        תרחישים שהשתמשת לאחרונה
      </h3>
      <div className="flex flex-wrap gap-2">
        {scenarioIds.map((scenarioId) => {
          const scenario = scenarioTemplates.find((s) => s.id === scenarioId);
          if (!scenario) return null;

          return (
            <button
              key={scenarioId}
              onClick={() => onSelect(scenario)}
              className="px-3 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
            >
              {scenario.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Custom scenario button
function CustomScenarioButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className={cn(
        'group w-full text-right rounded-2xl p-6 transition-colors',
        'bg-[var(--bg-elevated)] border border-[var(--accent-dark)]',
        'hover:border-[var(--accent)]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]'
      )}
      onClick={onClick}
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
  );
}
