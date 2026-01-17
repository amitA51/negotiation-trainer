import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to Hebrew locale
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString("he-IL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format a date to relative time (e.g., "לפני 5 דקות")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return "עכשיו";
  if (minutes < 60) return `לפני ${minutes} דקות`;
  if (hours < 24) return `לפני ${hours} שעות`;
  if (days < 7) return `לפני ${days} ימים`;
  
  return formatDate(d);
}

/**
 * Format time duration (e.g., "15:30")
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

/**
 * Delay utility for animations
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get difficulty level info
 */
export function getDifficultyInfo(level: number): {
  name: string;
  color: string;
  description: string;
} {
  const levels: Record<number, { name: string; color: string; description: string }> = {
    1: { name: "מתחיל", color: "text-green-400", description: "לימוד בסיסי - היריב מוותר בקלות" },
    2: { name: "חובב", color: "text-green-400", description: "תרגול ראשוני - גמיש אבל מתנגד קצת" },
    3: { name: "מתקדם", color: "text-yellow-400", description: "אתגר בינוני - עומד על שלו" },
    4: { name: "מנוסה", color: "text-yellow-400", description: "אתגר משמעותי - משתמש בטקטיקות" },
    5: { name: "מקצוען", color: "text-orange-400", description: "קשה - מזהה ומגיב בחוכמה" },
    6: { name: "מומחה", color: "text-orange-400", description: "קשה מאוד - אגרסיבי ולוחץ" },
    7: { name: "אלוף", color: "text-red-400", description: "כמעט בלתי אפשרי - משתמש בכל הטריקים" },
    8: { name: "אגדה", color: "text-red-400", description: "בלתי אפשרי כמעט - יריב מושלם" },
  };
  
  return levels[level] || levels[1];
}

/**
 * Get score color based on value
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

/**
 * Get category info
 */
export function getCategoryInfo(category: string): {
  name: string;
  icon: string;
  color: string;
} {
  const categories: Record<string, { name: string; icon: string; color: string }> = {
    tactical_empathy: { name: "אמפתיה טקטית", icon: "Heart", color: "text-pink-400" },
    harvard: { name: "משא ומתן קלאסי", icon: "Scale", color: "text-blue-400" },
    psychology: { name: "פסיכולוגיה והשפעה", icon: "Brain", color: "text-purple-400" },
    hardball: { name: "טקטיקות קשוחות", icon: "Swords", color: "text-red-400" },
  };

  return categories[category] || { name: category, icon: "Circle", color: "text-gray-400" };
}

/**
 * Get preferred AI model from user settings
 */
import type { User, AIModel } from "@/types";

export function getPreferredModel(user: User | null | undefined): AIModel {
  return user?.settings?.preferredModel || "gemini-1.5-flash";
}

/**
 * Get AI model display name
 */
export function getAIModelName(model: AIModel): string {
  const names: Record<AIModel, string> = {
    "gemini-1.5-flash": "Gemini 1.5 Flash",
    "gemini-1.5-pro": "Gemini 1.5 Pro",
    "gemini-2.0-flash-exp": "Gemini 2.0 Flash",
  };
  return names[model];
}
