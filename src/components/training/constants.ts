/**
 * Training Constants
 * Shared constants for training wizard
 */

import {
  Briefcase,
  Building,
  ShoppingCart,
  Home,
  Shield,
  Target,
  Flame,
  Swords,
  Crown,
} from 'lucide-react';
import { createElement } from 'react';
import type { ScenarioCategory } from '@/types';

// Category icons mapping
export const categoryIcons: Record<ScenarioCategory, React.ReactNode> = {
  salary: createElement(Briefcase, { size: 24 }),
  business: createElement(Building, { size: 24 }),
  bargaining: createElement(ShoppingCart, { size: 24 }),
  everyday: createElement(Home, { size: 24 }),
};

// Difficulty configuration
export const DIFFICULTY_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export const difficultyConfig = [
  { icon: Shield, label: 'מתחיל' },
  { icon: Shield, label: 'קל' },
  { icon: Target, label: 'בסיסי' },
  { icon: Target, label: 'בינוני' },
  { icon: Flame, label: 'מאתגר' },
  { icon: Flame, label: 'קשה' },
  { icon: Swords, label: 'מומחה' },
  { icon: Crown, label: 'אגדי' },
] as const;

// Step configuration
export const stepLabels: Record<string, { title: string; subtitle: string }> = {
  category: {
    title: 'בחר קטגוריה',
    subtitle: 'על איזה סוג משא ומתן תרצה להתאמן?',
  },
  scenario: {
    title: 'בחר תרחיש',
    subtitle: 'בחר תרחיש מוכן או צור משלך',
  },
  difficulty: {
    title: 'בחר רמת קושי',
    subtitle: 'כמה קשה תרצה שהיריב יהיה?',
  },
  custom: {
    title: 'תאר את התרחיש',
    subtitle: 'תאר את המצב שאתה רוצה להתאמן עליו',
  },
};
