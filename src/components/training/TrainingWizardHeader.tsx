/**
 * TrainingWizardHeader Component
 * Progress steps and header for training wizard
 */

'use client';

import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { stepLabels } from './constants';
import type { TrainingStep } from './types';

interface TrainingWizardHeaderProps {
  step: TrainingStep;
  totalSteps: number;
  currentStepNumber: number;
  onBack?: () => void;
}

export function TrainingWizardHeader({
  step,
  totalSteps,
  currentStepNumber,
  onBack,
}: TrainingWizardHeaderProps) {
  const { title, subtitle } = stepLabels[step] || { title: '', subtitle: '' };

  return (
    <div className="mb-10 fade-in">
      {/* Progress Steps */}
      <ProgressSteps
        total={totalSteps}
        current={currentStepNumber}
      />

      {/* Back Button */}
      {step !== 'category' && onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
          aria-label="חזור לשלב הקודם"
        >
          <ArrowRight size={18} />
          <span>חזור</span>
        </button>
      )}

      {/* Header Text */}
      <div className="text-center mb-1">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
          {title}
        </h1>
        <p className="text-[var(--text-secondary)] text-lg">{subtitle}</p>
      </div>
    </div>
  );
}

// Progress steps indicator
function ProgressSteps({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
              i + 1 === current
                ? 'bg-[var(--accent)] text-black'
                : i + 1 < current
                ? 'bg-[var(--accent-dark)] text-[var(--accent-light)]'
                : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
            )}
          >
            {i + 1}
          </div>
          {i < total - 1 && (
            <div
              className={cn(
                'w-10 h-0.5',
                i + 1 < current ? 'bg-[var(--accent)]' : 'bg-[var(--border-subtle)]'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
