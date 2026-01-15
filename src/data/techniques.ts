import type { Technique } from "@/types";

export const techniques: Technique[] = [
  // ===== Tactical Empathy (Chris Voss) =====
  {
    code: "MIRROR",
    name: "שיקוף",
    nameEn: "Mirroring",
    category: "tactical_empathy",
    description: "חזרה על 1-3 מילים אחרונות של הצד השני כשאלה. זה גורם לאנשים להרחיב ולחשוף מידע נוסף.",
    examples: [
      "הם: 'אנחנו לא יכולים לאשר את המחיר הזה' - אתה: 'לא יכולים לאשר?'",
      "הם: 'יש לנו בעיה עם לוחות הזמנים' - אתה: 'בעיה עם לוחות הזמנים?'",
    ],
    whenToUse: "כשאתה רוצה שהצד השני ירחיב על מה שאמר, או כשאתה צריך זמן לחשוב.",
    counterTechniques: ["SILENCE", "REFRAME"],
    difficulty: 1,
  },
  {
    code: "LABEL",
    name: "תווית",
    nameEn: "Labeling",
    category: "tactical_empathy",
    description: "מתן שם לרגש של הצד השני. מראה הבנה ומפחית את עוצמת הרגש השלילי.",
    examples: [
      "'נראה שאתה מתוסכל מהמצב הזה'",
      "'נשמע שיש לך חששות לגבי לוח הזמנים'",
      "'מרגיש שזה חשוב לך מאוד'",
    ],
    whenToUse: "כשהצד השני מגלה רגש (כעס, תסכול, חשש) וצריך לנטרל אותו.",
    counterTechniques: ["CALIBRATED_Q"],
    difficulty: 2,
  },
  {
    code: "CALIBRATED_Q",
    name: "שאלות מכוילות",
    nameEn: "Calibrated Questions",
    category: "tactical_empathy",
    description: "שאלות 'מה' ו'איך' במקום 'למה'. שאלות פתוחות שמעבירות את הבעיה לצד השני.",
    examples: [
      "'איך אני אמור לעשות את זה?' (במקום 'אני לא יכול')",
      "'מה יקרה אם לא נעמוד בזה?'",
      "'איך אפשר לפתור את זה ביחד?'",
    ],
    whenToUse: "כשאתה רוצה להעביר את האחריות לפתרון לצד השני, או לחשוף מידע.",
    counterTechniques: ["ANCHOR", "ULTIMATUM"],
    difficulty: 2,
  },
  {
    code: "SILENCE",
    name: "שתיקה דינמית",
    nameEn: "Dynamic Silence",
    category: "tactical_empathy",
    description: "שתיקה מכוונת אחרי שהצד השני דיבר. רוב האנשים לא מרגישים בנוח בשתיקה וימשיכו לדבר.",
    examples: [
      "הם נותנים הצעה, אתה שותק 3-4 שניות ומחכה",
      "אחרי שהם מסיימים להסביר, אתה לא ממהר לענות",
    ],
    whenToUse: "כשאתה רוצה שהצד השני יחשוף עוד מידע או ישפר את ההצעה שלו.",
    counterTechniques: ["FLINCH"],
    difficulty: 3,
  },
  {
    code: "ACCUSATION_AUDIT",
    name: "בדיקת האשמות",
    nameEn: "Accusation Audit",
    category: "tactical_empathy",
    description: "העלאת כל הדברים השליליים שהצד השני עשוי לחשוב עליך מראש, כדי לנטרל אותם.",
    examples: [
      "'אתה בטח חושב שאני מנסה לסחוט אותך, שאני לא מעריך את הזמן שלך...'",
      "'אני יודע שזה נשמע חוצפני, ואולי תחשוב שאני לא מבין את המצב...'",
    ],
    whenToUse: "בתחילת שיחה קשה, כשאתה יודע שיש התנגדות או רגשות שליליים.",
    counterTechniques: ["REFRAME"],
    difficulty: 4,
  },
  {
    code: "NO_ORIENTED",
    name: "שאלות מכוונות ל'לא'",
    nameEn: "No-Oriented Questions",
    category: "tactical_empathy",
    description: "שאלות שהתשובה הרצויה עליהן היא 'לא'. אנשים מרגישים בשליטה כשהם אומרים 'לא'.",
    examples: [
      "'האם זה זמן גרוע לדבר?' (במקום 'יש לך דקה?')",
      "'האם זה יהיה נורא אם נדחה את הפגישה?'",
      "'האם ויתרת על הרעיון הזה?'",
    ],
    whenToUse: "כשאתה רוצה לפתוח שיחה או לקבל הסכמה בצורה עקיפה.",
    counterTechniques: ["ULTIMATUM"],
    difficulty: 3,
  },

  // ===== Harvard/Classical =====
  {
    code: "ANCHOR",
    name: "עוגן",
    nameEn: "Anchoring",
    category: "harvard",
    description: "זריקת המספר הראשון (בדרך כלל קיצוני) כדי לקבוע את טווח המיקוח.",
    examples: [
      "אתה: 'אני מצפה לשכר של 35,000' (כשאתה רוצה 25,000)",
      "אתה: 'המחיר שלי הוא 50,000' (כשאתה מוכן ל-35,000)",
    ],
    whenToUse: "כשאתה רוצה לשלוט בטווח המשא ומתן. עדיף להיות הראשון שזורק מספר.",
    counterTechniques: ["FLINCH", "REFRAME", "BATNA"],
    difficulty: 2,
  },
  {
    code: "BATNA",
    name: "חלופה טובה",
    nameEn: "BATNA",
    category: "harvard",
    description: "Best Alternative To Negotiated Agreement - שימוש באופציה האלטרנטיבית שלך כמנוף לחץ.",
    examples: [
      "'יש לי כבר הצעה אחרת של 20,000, אבל אני מעדיף לעבוד אתכם'",
      "'אם לא נסגור היום, יש לי פגישה מחר עם המתחרים שלכם'",
    ],
    whenToUse: "כשיש לך אלטרנטיבה אמיתית, או כשהצד השני לא מתקדם.",
    counterTechniques: ["SCARCITY", "SOCIAL_PROOF"],
    difficulty: 2,
  },
  {
    code: "LOGROLL",
    name: "החלפות",
    nameEn: "Logrolling / Trade-offs",
    category: "harvard",
    description: "ויתור בנושא שפחות חשוב לך תמורת משהו שחשוב לך מאוד.",
    examples: [
      "'אני אתן לך את המחיר שביקשת, בתנאי שתשלם הכל מראש'",
      "'אני מוכן לוותר על הבונוס אם תיתן לי עוד ימי חופשה'",
    ],
    whenToUse: "כשאתה תקוע ורוצה להגדיל את העוגה. מצא מה חשוב לכל צד.",
    counterTechniques: ["NIBBLE"],
    difficulty: 3,
  },
  {
    code: "REFRAME",
    name: "מסגור מחדש",
    nameEn: "Reframing",
    category: "harvard",
    description: "שינוי ההקשר או הפרספקטיבה של ההצעה כדי להציג אותה באור חיובי יותר.",
    examples: [
      "'זה לא עולה 100 שקל ליום, זה כמו מחיר של כוס קפה'",
      "'במקום לחשוב על העלות, תחשוב כמה תחסוך ב-5 שנים'",
      "'זו לא הוצאה, זו השקעה בעתיד שלך'",
    ],
    whenToUse: "כשהצד השני מתמקד בהיבט שלילי, או כשאתה רוצה לשנות את הדיון.",
    counterTechniques: ["ANCHOR"],
    difficulty: 3,
  },

  // ===== Psychology & Persuasion (Cialdini) =====
  {
    code: "SCARCITY",
    name: "נדירות",
    nameEn: "Scarcity",
    category: "psychology",
    description: "יצירת תחושה שההזדמנות עומדת להיעלם. דברים נדירים נתפסים כבעלי ערך גבוה יותר.",
    examples: [
      "'זה המוצר האחרון במלאי'",
      "'המחיר הזה תקף רק עד סוף החודש'",
      "'יש לי עוד שני מועמדים שמעוניינים בתפקיד'",
    ],
    whenToUse: "כשאתה רוצה ליצור דחיפות ולזרז החלטה.",
    counterTechniques: ["CALIBRATED_Q", "SILENCE"],
    difficulty: 2,
  },
  {
    code: "SOCIAL_PROOF",
    name: "הוכחה חברתית",
    nameEn: "Social Proof",
    category: "psychology",
    description: "שימוש בהתנהגות של אחרים כראיה לכך שמשהו טוב או נכון.",
    examples: [
      "'רוב הלקוחות שלנו בוחרים בחבילה הזו'",
      "'80% מהמנהלים בתעשייה כבר עברו לשיטה הזו'",
      "'החברות המובילות כבר עובדות איתנו'",
    ],
    whenToUse: "כשאתה רוצה לשכנע מישהו שמסתמך על דעת הרוב.",
    counterTechniques: ["CALIBRATED_Q"],
    difficulty: 1,
  },
  {
    code: "AUTHORITY",
    name: "סמכות",
    nameEn: "Authority",
    category: "psychology",
    description: "שימוש בתואר, מומחיות, או סמכות כדי להוסיף משקל לטענות שלך.",
    examples: [
      "'כמנהל המוצר אני אומר לך שזה הפתרון הנכון'",
      "'לפי המחקר של אוניברסיטת הרווארד...'",
      "'מניסיון של 15 שנה בתחום, אני יכול להגיד ש...'",
    ],
    whenToUse: "כשאתה צריך לבסס אמינות או לחזק עמדה.",
    counterTechniques: ["CALIBRATED_Q", "REFRAME"],
    difficulty: 2,
  },
  {
    code: "RECIPROCITY",
    name: "הדדיות",
    nameEn: "Reciprocity",
    category: "psychology",
    description: "נתינת משהו קטן כדי לגרום לצד השני להרגיש מחויב להחזיר.",
    examples: [
      "לתת הנחה קטנה מראש ואז לבקש משהו בתמורה",
      "'אני נותן לך את היום הנוסף, אבל אני צריך שתעזור לי עם...'",
    ],
    whenToUse: "כשאתה רוצה לבנות יחסי אמון או ליצור מחויבות.",
    counterTechniques: ["NIBBLE"],
    difficulty: 2,
  },

  // ===== Hardball Tactics =====
  {
    code: "FLINCH",
    name: "הירתעות",
    nameEn: "The Flinch",
    category: "hardball",
    description: "תגובה פיזית או ווקאלית מוגזמת להצעה של הצד השני. גורם להם לפקפק בעמדתם.",
    examples: [
      "'וואו! הגזמת לגמרי!'",
      "להביט בהם בהלם ולשתוק",
      "'אתה צוחק?!'",
    ],
    whenToUse: "כשאתה מקבל הצעה ראשונית ורוצה להזיז אותם מהעמדה.",
    counterTechniques: ["SILENCE", "ANCHOR"],
    difficulty: 2,
  },
  {
    code: "GOOD_BAD_COP",
    name: "שוטר טוב / שוטר רע",
    nameEn: "Good Cop / Bad Cop",
    category: "hardball",
    description: "דמות אחת קשוחה ודמות אחת נחמדה. יוצר לחץ ובו זמנית מציע מוצא.",
    examples: [
      "'אני הייתי מסכים, אבל המנהל שלי לא יאשר את זה'",
      "'הבוס שלי דורש את המחיר המלא, אבל אני אנסה לשכנע אותו'",
    ],
    whenToUse: "כשאתה רוצה לשמור על יחסים טובים אבל להפעיל לחץ.",
    counterTechniques: ["CALIBRATED_Q", "LABEL"],
    difficulty: 4,
  },
  {
    code: "ULTIMATUM",
    name: "אולטימטום",
    nameEn: "Take it or Leave it",
    category: "hardball",
    description: "הצבת גבול נוקשה והודעה שאין מקום למשא ומתן נוסף.",
    examples: [
      "'זו ההצעה הסופית שלי. קח או עזוב.'",
      "'אם לא נסגור עד מחר, אני יוצא מהעסקה'",
    ],
    whenToUse: "כשאתה באמת מוכן לעזוב, או כמהלך אחרון.",
    counterTechniques: ["SILENCE", "BATNA", "CALIBRATED_Q"],
    difficulty: 5,
  },
  {
    code: "NIBBLE",
    name: "סלאמי",
    nameEn: "Nibbling",
    category: "hardball",
    description: "בקשת תוספות קטנות רגע לפני הסגירה, כשהצד השני כבר מחויב נפשית לעסקה.",
    examples: [
      "'מעולה, אז רק תוסיף לי את המטען בחינם'",
      "'לפני שנחתום, אפשר לקבל עוד חודש אחריות?'",
    ],
    whenToUse: "אחרי שהגעתם להסכמה עקרונית, ממש לפני החתימה.",
    counterTechniques: ["ULTIMATUM", "LOGROLL"],
    difficulty: 3,
  },
];

// Helper to get techniques by category
export function getTechniquesByCategory(category: string): Technique[] {
  return techniques.filter((t) => t.category === category);
}

// Helper to get technique by code
export function getTechniqueByCode(code: string): Technique | undefined {
  return techniques.find((t) => t.code === code);
}

// Category info
export const techniqueCategories = [
  {
    id: "tactical_empathy",
    name: "אמפתיה טקטית",
    nameEn: "Tactical Empathy",
    description: "טכניקות של כריס ווס לבניית אמון ואיסוף מידע",
    icon: "Heart",
    color: "pink",
  },
  {
    id: "harvard",
    name: "משא ומתן קלאסי",
    nameEn: "Principled Negotiation",
    description: "האסכולה של הרווארד לפתרון בעיות לוגי",
    icon: "Scale",
    color: "blue",
  },
  {
    id: "psychology",
    name: "פסיכולוגיה והשפעה",
    nameEn: "Psychology & Persuasion",
    description: "עקרונות ההשפעה של צ'יאלדיני",
    icon: "Brain",
    color: "purple",
  },
  {
    id: "hardball",
    name: "טקטיקות קשוחות",
    nameEn: "Hardball Tactics",
    description: "טקטיקות אגרסיביות למצבי לחץ",
    icon: "Swords",
    color: "red",
  },
];
