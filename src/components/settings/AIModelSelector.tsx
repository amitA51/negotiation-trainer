/**
 * AIModelSelector Component
 * Settings section for selecting preferred AI model
 */

'use client';

import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AI_MODELS } from '@/data/constants';
import type { AIModel } from '@/types';

interface AIModelSelectorProps {
  value: AIModel;
  onChange: (model: AIModel) => void;
}

export function AIModelSelector({ value, onChange }: AIModelSelectorProps) {
  return (
    <section
      className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 slide-up"
      style={{ animationDelay: '75ms' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">מודל AI</h3>
            <p className="text-sm text-[var(--text-muted)]">
              בחר את המודל שישמש לאימונים
            </p>
          </div>
        </div>
      </div>

      {/* Model Options */}
      <div className="space-y-2">
        {AI_MODELS.map((model) => (
          <button
            key={model.id}
            onClick={() => onChange(model.id)}
            className={cn(
              'w-full text-right p-4 rounded-xl border transition-all',
              value === model.id
                ? 'bg-purple-500/10 border-purple-500/50 text-[var(--text-primary)]'
                : 'bg-[var(--bg-hover)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-default)]'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RadioIndicator selected={value === model.id} />
                <span className="font-medium">{model.name}</span>
              </div>
            </div>
            <p className="text-sm text-[var(--text-muted)] mt-1 mr-7">
              {model.description}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

// Radio indicator component
function RadioIndicator({ selected }: { selected: boolean }) {
  return (
    <div
      className={cn(
        'w-4 h-4 rounded-full border-2 flex items-center justify-center',
        selected ? 'border-purple-500' : 'border-[var(--text-muted)]'
      )}
    >
      {selected && <div className="w-2 h-2 rounded-full bg-purple-500" />}
    </div>
  );
}
