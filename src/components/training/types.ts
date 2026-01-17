/**
 * Training Component Types
 * Shared types for training wizard components
 */

import type { ScenarioCategory } from '@/types';
import type { scenarioTemplates } from '@/data/scenarios';

export type TrainingStep = 'category' | 'scenario' | 'difficulty' | 'custom';

export type ScenarioTemplate = typeof scenarioTemplates[0];

export interface DifficultyLevel {
  level: number;
  label: string;
  icon: 'shield' | 'target' | 'flame' | 'swords' | 'crown';
}

export interface CategoryOption {
  id: ScenarioCategory;
  name: string;
  description: string;
  icon: React.ReactNode;
}

export interface TrainingFormState {
  step: TrainingStep;
  selectedCategory: ScenarioCategory | null;
  selectedScenario: ScenarioTemplate | null;
  selectedDifficulty: number;
  customScenario: string;
  recentScenarios: string[];
}

export interface TrainingFormActions {
  setStep: (step: TrainingStep) => void;
  setSelectedCategory: (category: ScenarioCategory | null) => void;
  setSelectedScenario: (scenario: ScenarioTemplate | null) => void;
  setSelectedDifficulty: (difficulty: number) => void;
  setCustomScenario: (scenario: string) => void;
  handleBack: () => void;
}
