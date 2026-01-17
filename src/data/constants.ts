import type { AIModel } from "@/types";

export const AI_MODELS: { id: AIModel; name: string; description: string }[] = [
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", description: "מהיר ויעיל - מומלץ לרוב המשתמשים" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "איכות גבוהה יותר, זמן תגובה ארוך יותר" },
  { id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash", description: "הגרסה החדשה ביותר (ניסיוני)" },
];

export const DEFAULT_AI_MODEL: AIModel = "gemini-1.5-flash";
export const DEFAULT_ANALYSIS_MODEL: AIModel = "gemini-1.5-pro";

export const API_TIMEOUT_MS = 30000;
export const ANALYSIS_TIMEOUT_MS = 60000;

export const MIN_CONSULTATION_CHARS = 20;

export const MAX_MESSAGE_LENGTH = 5000;
export const MAX_CONSULTATION_LENGTH = 2000;
