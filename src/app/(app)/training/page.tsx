/**
 * Training Page
 * Multi-step wizard for starting a new training session
 * Refactored to use modular components
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Swords } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { createSession } from '@/lib/firebase/firestore';
import { RECENT_SCENARIOS_LIMIT } from '@/data/scenarios';
import type { ScenarioCategory } from '@/types';

// Training components
import {
  TrainingWizardHeader,
  CategoryGrid,
  ScenarioList,
  ScenarioSummary,
  DifficultySelector,
  CustomScenarioForm,
} from '@/components/training';
import type { TrainingStep, ScenarioTemplate } from '@/components/training';

export default function TrainingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  // Form state
  const [step, setStep] = useState<TrainingStep>('category');
  const [selectedCategory, setSelectedCategory] = useState<ScenarioCategory | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioTemplate | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(3);
  const [customScenario, setCustomScenario] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentScenarios, setRecentScenarios] = useState<string[]>([]);

  // Calculate step numbers
  const { stepNumber, totalSteps } = useMemo(() => {
    const isCustom = step === 'custom';
    const total = isCustom ? 2 : 3;
    let current = 1;

    if (step === 'category') current = 1;
    else if (step === 'scenario') current = 2;
    else if (step === 'difficulty') current = 3;
    else if (step === 'custom') current = 2;

    return { stepNumber: current, totalSteps: total };
  }, [step]);

  // Handlers
  const handleCategorySelect = useCallback((category: ScenarioCategory) => {
    setSelectedCategory(category);
    setStep('scenario');
  }, []);

  const handleScenarioSelect = useCallback((scenario: ScenarioTemplate) => {
    setSelectedScenario(scenario);
    setSelectedDifficulty(scenario.difficulty);
    setStep('difficulty');
  }, []);

  const handleCustomScenario = useCallback(() => {
    setSelectedCategory(null);
    setSelectedScenario(null);
    setStep('custom');
  }, []);

  const handleBack = useCallback(() => {
    if (step === 'scenario') {
      setStep('category');
      setSelectedCategory(null);
    } else if (step === 'difficulty') {
      setStep('scenario');
      setSelectedScenario(null);
    } else if (step === 'custom') {
      setStep('category');
    }
  }, [step]);

  const handleStartTraining = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const scenario = selectedScenario
        ? {
            title: selectedScenario.title,
            description: selectedScenario.description,
            userRole: selectedScenario.userRole,
            aiRole: selectedScenario.aiRole,
            goal: selectedScenario.goal,
            category: selectedScenario.category,
          }
        : customScenario
        ? {
            title: 'תרחיש מותאם אישית',
            description: customScenario,
            userRole: 'המשתמש',
            aiRole: 'הצד השני במשא ומתן',
            goal: 'להשיג את המטרה שהגדרת',
            category: 'everyday' as ScenarioCategory,
          }
        : null;

      if (!scenario) return;

      const sessionId = await createSession(user.uid, {
        userId: user.uid,
        type: 'training',
        difficulty: selectedDifficulty,
        status: 'active',
        scenario,
        source: 'web',
      });

      // Track recent scenarios
      setRecentScenarios((prev) => {
        const id = selectedScenario?.id || 'custom';
        const updated = [id, ...prev.filter((i) => i !== id)];
        return updated.slice(0, RECENT_SCENARIOS_LIMIT);
      });

      router.push(`/training/${sessionId}`);
    } catch (error) {
      console.error('Error creating session:', error);
      showToast('שגיאה ביצירת האימון. נסה שוב.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, selectedScenario, customScenario, selectedDifficulty, router, showToast]);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header with progress */}
      <TrainingWizardHeader
        step={step}
        totalSteps={totalSteps}
        currentStepNumber={stepNumber}
        onBack={step !== 'category' ? handleBack : undefined}
      />

      {/* Step: Category Selection */}
      {step === 'category' && (
        <CategoryGrid
          onCategorySelect={handleCategorySelect}
          onCustomSelect={handleCustomScenario}
          recentScenarios={recentScenarios}
          onRecentSelect={handleScenarioSelect}
        />
      )}

      {/* Step: Scenario Selection */}
      {step === 'scenario' && selectedCategory && (
        <ScenarioList
          category={selectedCategory}
          onSelect={handleScenarioSelect}
        />
      )}

      {/* Step: Difficulty Selection */}
      {step === 'difficulty' && selectedScenario && (
        <div className="space-y-8 slide-up">
          <ScenarioSummary scenario={selectedScenario} />
          
          <DifficultySelector
            value={selectedDifficulty}
            onChange={setSelectedDifficulty}
          />

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
      {step === 'custom' && (
        <CustomScenarioForm
          value={customScenario}
          onChange={setCustomScenario}
          difficulty={selectedDifficulty}
          onDifficultyChange={setSelectedDifficulty}
          onSubmit={handleStartTraining}
          loading={loading}
        />
      )}
    </div>
  );
}
