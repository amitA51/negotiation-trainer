import { techniques } from "@/data/techniques";
import type { Technique } from "@/types";

export interface DetectedTechnique {
  technique: Technique;
  confidence: "high" | "medium" | "low";
  matchedPattern: string;
}

interface TechniquePattern {
  code: string;
  patterns: RegExp[];
  keywords: string[];
}

// Hebrew patterns for technique detection
const techniquePatterns: TechniquePattern[] = [
  // MIRROR - Repeating last words as question
  {
    code: "MIRROR",
    patterns: [
      /^.{1,30}\?$/,  // Short question (likely repeating)
      /^[^?]{1,20}\?$/,
    ],
    keywords: [],
  },
  
  // LABEL - Identifying emotions
  {
    code: "LABEL",
    patterns: [
      /נראה ש(אתה|את|אתם)/i,
      /נשמע ש(אתה|את|אתם)/i,
      /מרגיש ש/i,
      /אני מבין ש(אתה|את)/i,
      /אני רואה ש(אתה|את)/i,
      /אני שומע ש(אתה|את)/i,
    ],
    keywords: ["נראה", "נשמע", "מרגיש", "מתוסכל", "מודאג", "חושש", "שמח", "מופתע"],
  },
  
  // CALIBRATED_Q - What/How questions
  {
    code: "CALIBRATED_Q",
    patterns: [
      /^(מה|איך)\s/i,
      /מה (יקרה|אפשר|אתה מציע|הבעיה)/i,
      /איך (אפשר|נוכל|אתה רוצה|אמור)/i,
      /מה הדרך/i,
    ],
    keywords: ["מה יקרה", "איך אפשר", "מה אפשר", "איך נוכל"],
  },
  
  // SILENCE - Detected by short/empty response (handled separately)
  {
    code: "SILENCE",
    patterns: [
      /^\.{2,}$/,  // Just dots
      /^(הממ|אממ|אוקיי|אוקי|או\.?קיי?)\.?$/i,
    ],
    keywords: ["הממ", "אממ"],
  },
  
  // ACCUSATION_AUDIT - Preempting negative thoughts
  {
    code: "ACCUSATION_AUDIT",
    patterns: [
      /אתה בטח חושב/i,
      /אני יודע ש(זה נשמע|אתה חושב)/i,
      /אולי (תחשוב|נראה לך)/i,
      /זה עלול להישמע/i,
    ],
    keywords: ["בטח חושב", "יודע שזה", "נראה חוצפני", "נשמע גרוע"],
  },
  
  // NO_ORIENTED - Questions designed to get "no"
  {
    code: "NO_ORIENTED",
    patterns: [
      /האם (זה|זו) (יהיה|תהיה) (נורא|גרוע|בעיה)/i,
      /האם (ויתרת|וויתרת)/i,
      /האם זה זמן גרוע/i,
      /האם יפריע לך/i,
    ],
    keywords: ["האם זה יהיה נורא", "האם ויתרת", "האם תפריע"],
  },
  
  // ANCHOR - First extreme number
  {
    code: "ANCHOR",
    patterns: [
      /אני (מצפה|רוצה|דורש|מבקש).*(שכר|מחיר|תשלום).*\d+/i,
      /(המחיר|השכר|העלות) (שלי|שאני).*(הוא|היא)\s*\d+/i,
      /\d{4,}.*₪/,  // Large number with shekel
    ],
    keywords: ["אני מצפה ל", "המחיר שלי", "אני מבקש"],
  },
  
  // BATNA - Mentioning alternatives
  {
    code: "BATNA",
    patterns: [
      /יש לי (כבר |)(הצעה|אפשרות|אלטרנטיבה)/i,
      /אם לא (נסגור|נגיע להסכמה)/i,
      /יש לי פגישה עם/i,
      /המתחרים (שלכם|שלך)/i,
      /(קיבלתי|יש לי) הצעה (אחרת|נוספת)/i,
    ],
    keywords: ["הצעה אחרת", "אלטרנטיבה", "מתחרים", "אפשרות אחרת"],
  },
  
  // LOGROLL - Trade-offs
  {
    code: "LOGROLL",
    patterns: [
      /אני (מוכן|מוכנה) (לוותר|לתת).*בתנאי/i,
      /אם (תיתן|תתן|תתני).*אני/i,
      /בתמורה ל/i,
      /מה אם.*(תמורת|בתמורה)/i,
    ],
    keywords: ["בתנאי ש", "בתמורה ל", "מוכן לוותר", "אם תיתן"],
  },
  
  // REFRAME - Changing perspective
  {
    code: "REFRAME",
    patterns: [
      /זה לא.*זה/i,
      /במקום לחשוב על/i,
      /תחשוב על זה (ככה|כך)/i,
      /זו (לא הוצאה|השקעה)/i,
      /כמו (מחיר של|עלות של)/i,
    ],
    keywords: ["תחשוב על זה", "זו השקעה", "במקום לחשוב", "זה כמו"],
  },
  
  // SCARCITY - Creating urgency
  {
    code: "SCARCITY",
    patterns: [
      /(אחרון|אחרונה) (במלאי|בסטוק)/i,
      /רק עד (סוף|ה)/i,
      /ההצעה (תקפה|בתוקף) (רק |)עד/i,
      /יש (עוד |רק )\d+/i,
      /מוגבל (בזמן|בכמות)/i,
    ],
    keywords: ["אחרון במלאי", "עד סוף החודש", "הזדמנות אחרונה", "מוגבל"],
  },
  
  // SOCIAL_PROOF - Using others as proof
  {
    code: "SOCIAL_PROOF",
    patterns: [
      /רוב (ה|)(לקוחות|החברות|האנשים)/i,
      /\d+%\s*(מ|של)/i,
      /החברות (המובילות|הגדולות)/i,
      /כולם (עושים|בוחרים|משתמשים)/i,
    ],
    keywords: ["רוב הלקוחות", "החברות המובילות", "80%", "כולם"],
  },
  
  // AUTHORITY - Using credentials
  {
    code: "AUTHORITY",
    patterns: [
      /כ(מנהל|מומחה|בעל ניסיון)/i,
      /לפי (המחקר|מחקר|מומחים)/i,
      /מניסיון של \d+/i,
      /אוניברסיט(ה|ת)/i,
    ],
    keywords: ["כמומחה", "מניסיון של", "לפי המחקר", "מומחים אומרים"],
  },
  
  // RECIPROCITY - Give to get
  {
    code: "RECIPROCITY",
    patterns: [
      /אני (נותן|אתן) לך.*אבל/i,
      /עשיתי לך.*עכשיו/i,
      /אחרי ש(נתתי|עזרתי)/i,
    ],
    keywords: ["אני נותן לך", "עשיתי בשבילך", "בתמורה"],
  },
  
  // FLINCH - Shocked reaction
  {
    code: "FLINCH",
    patterns: [
      /^(וואו|וואלה|מה|אתה צוחק)[\?!]+$/i,
      /הגזמת/i,
      /^(מה|וואו|רצינית?)[\?!]*$/i,
      /זה (מטורף|מוגזם|הגזמה)/i,
    ],
    keywords: ["וואו", "הגזמת", "אתה צוחק", "מטורף", "מוגזם"],
  },
  
  // GOOD_BAD_COP - Blaming someone else
  {
    code: "GOOD_BAD_COP",
    patterns: [
      /אני (הייתי|אשמח) (מסכים|לאשר).*אבל (המנהל|הבוס|ההנהלה)/i,
      /(המנהל|הבוס) שלי (לא יאשר|דורש)/i,
      /אני אנסה לשכנע/i,
    ],
    keywords: ["המנהל שלי", "הבוס לא יאשר", "ההנהלה דורשת"],
  },
  
  // ULTIMATUM - Take it or leave it
  {
    code: "ULTIMATUM",
    patterns: [
      /(הצעה |)סופית/i,
      /קח או עזוב/i,
      /אם לא.*אני (עוזב|יוצא|מבטל)/i,
      /זו (ה|)הצעה (ה|)אחרונה/i,
    ],
    keywords: ["הצעה סופית", "קח או עזוב", "זו הצעה אחרונה", "אחרת אני עוזב"],
  },
  
  // NIBBLE - Last minute asks
  {
    code: "NIBBLE",
    patterns: [
      /רק (עוד |)(דבר קטן|משהו קטן)/i,
      /(רגע |)לפני (שנחתום|שנסגור)/i,
      /אפשר (גם |רק |)(לקבל|להוסיף)/i,
      /תוסיף (לי |)גם/i,
    ],
    keywords: ["רק עוד דבר", "לפני שנחתום", "תוסיף גם", "אפשר גם"],
  },
];

/**
 * Detect techniques used in a message
 */
export function detectTechniques(message: string): DetectedTechnique[] {
  const detected: DetectedTechnique[] = [];
  const normalizedMessage = message.trim();
  
  // Skip very short messages
  if (normalizedMessage.length < 3) {
    return detected;
  }
  
  for (const pattern of techniquePatterns) {
    const technique = techniques.find(t => t.code === pattern.code);
    if (!technique) continue;
    
    let matched = false;
    let matchedPattern = "";
    let confidence: "high" | "medium" | "low" = "low";
    
    // Check regex patterns (high confidence)
    for (const regex of pattern.patterns) {
      if (regex.test(normalizedMessage)) {
        matched = true;
        matchedPattern = regex.toString();
        confidence = "high";
        break;
      }
    }
    
    // Check keywords (medium confidence)
    if (!matched) {
      for (const keyword of pattern.keywords) {
        if (normalizedMessage.includes(keyword)) {
          matched = true;
          matchedPattern = keyword;
          confidence = "medium";
          break;
        }
      }
    }
    
    if (matched) {
      detected.push({
        technique,
        confidence,
        matchedPattern,
      });
    }
  }
  
  // Sort by confidence (high first)
  detected.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.confidence] - order[b.confidence];
  });
  
  // Return max 3 techniques per message
  return detected.slice(0, 3);
}

/**
 * Get a tip for using a technique better
 */
export function getTechniqueTip(code: string): string {
  const tips: Record<string, string> = {
    MIRROR: "נסה לשאול את השיקוף בטון סקרני, לא אגרסיבי",
    LABEL: "התחל עם 'נראה ש...' או 'נשמע ש...' - לא 'אני חושב ש...'",
    CALIBRATED_Q: "שאלות 'איך' ו'מה' גורמות לצד השני לעבוד בשבילך",
    SILENCE: "ספור עד 4 בראש לפני שאתה עונה - השתיקה עובדת!",
    ACCUSATION_AUDIT: "תעלה את החששות מראש - זה מנטרל אותם",
    NO_ORIENTED: "אנשים אוהבים לומר 'לא' - תן להם את ההזדמנות",
    ANCHOR: "המספר הראשון קובע את הטווח - תהיה אמיץ!",
    BATNA: "אלטרנטיבה טובה נותנת לך כוח לסרב",
    LOGROLL: "מצא מה חשוב לכל צד ותעשה החלפות",
    REFRAME: "שנה את הפרספקטיבה - מהוצאה להשקעה",
    SCARCITY: "דחיפות אמיתית עובדת - מזויפת לא",
    SOCIAL_PROOF: "אנשים עוקבים אחרי אנשים דומים להם",
    AUTHORITY: "מומחיות בונה אמון מיידי",
    RECIPROCITY: "תן משהו קטן לפני שאתה מבקש",
    FLINCH: "תגובה דרמטית גורמת לצד השני לפקפק",
    GOOD_BAD_COP: "השתמש ב'גורם חיצוני' כדי לשמור על יחסים",
    ULTIMATUM: "השתמש בזה רק כשאתה באמת מוכן לעזוב!",
    NIBBLE: "בקשות קטנות בסוף קל יותר לאשר",
  };
  
  return tips[code] || "כל הכבוד על השימוש בטכניקה!";
}

/**
 * Get encouragement message based on technique count
 */
export function getEncouragement(count: number): string {
  if (count === 0) return "";
  if (count === 1) return "יפה! זיהית טכניקה";
  if (count <= 3) return "מעולה! אתה משתמש בכמה טכניקות";
  if (count <= 5) return "וואו! אתה מנהל משא ומתן כמו מקצוען";
  return "אלוף! אתה שולט בטכניקות כמו כריס ווס";
}
