import type { Scenario, ScenarioCategory } from "@/types";

interface ScenarioTemplate {
  id: string;
  title: string;
  description: string;
  category: ScenarioCategory;
  userRole: string;
  aiRole: string;
  goal: string;
  difficulty: number;
}

export const scenarioTemplates: ScenarioTemplate[] = [
  // ===== Salary Negotiations =====
  {
    id: "salary-raise",
    title: "בקשת העלאת שכר",
    description: "אתה עובד כבר שנתיים בחברה ומרגיש שמגיעה לך העלאה",
    category: "salary",
    userRole: "עובד בחברה שמבקש העלאת שכר",
    aiRole: "מנהל ישיר שצריך לאשר את הבקשה",
    goal: "לקבל העלאה של לפחות 15%",
    difficulty: 3,
  },
  {
    id: "salary-new-job",
    title: "משא ומתן על שכר בעבודה חדשה",
    description: "קיבלת הצעת עבודה ואתה רוצה לשפר את התנאים",
    category: "salary",
    userRole: "מועמד שקיבל הצעת עבודה",
    aiRole: "מנהלת גיוס שרוצה לסגור אותך",
    goal: "לשפר את ההצעה ב-20% או לקבל הטבות נוספות",
    difficulty: 4,
  },
  {
    id: "salary-counter-offer",
    title: "הצעה נגדית ממעסיק נוכחי",
    description: "קיבלת הצעה מחברה אחרת והמעסיק הנוכחי רוצה לשמור אותך",
    category: "salary",
    userRole: "עובד עם הצעה מחברה מתחרה",
    aiRole: "מנהל שרוצה לשמור אותך בחברה",
    goal: "לקבל הצעה טובה יותר מההצעה החיצונית",
    difficulty: 5,
  },

  // ===== Business Negotiations =====
  {
    id: "business-contract",
    title: "חוזה עם לקוח חדש",
    description: "אתה מנהל משא ומתן על חוזה שירות עם לקוח פוטנציאלי גדול",
    category: "business",
    userRole: "נציג חברה שמוכר שירות",
    aiRole: "מנהל רכש בחברה גדולה",
    goal: "לסגור עסקה במחיר טוב עם תנאי תשלום נוחים",
    difficulty: 4,
  },
  {
    id: "business-supplier",
    title: "משא ומתן עם ספק",
    description: "אתה מנסה לקבל תנאים טובים יותר מספק קיים",
    category: "business",
    userRole: "מנהל רכש",
    aiRole: "נציג מכירות של חברת ספק",
    goal: "להוריד מחירים ב-10% ולשפר תנאי אספקה",
    difficulty: 3,
  },
  {
    id: "business-partnership",
    title: "הסכם שותפות",
    description: "אתה מנהל משא ומתן על תנאי שותפות עסקית",
    category: "business",
    userRole: "יזם שמחפש שותף",
    aiRole: "משקיע פוטנציאלי",
    goal: "להשיג מימון תוך שמירה על שליטה בחברה",
    difficulty: 6,
  },

  // ===== Bargaining =====
  {
    id: "bargaining-car",
    title: "קניית רכב משומש",
    description: "מצאת רכב שאתה רוצה ומנסה להוריד את המחיר",
    category: "bargaining",
    userRole: "קונה פוטנציאלי",
    aiRole: "מוכר רכב פרטי",
    goal: "להוריד את המחיר ב-10-15%",
    difficulty: 2,
  },
  {
    id: "bargaining-rent",
    title: "משא ומתן על שכר דירה",
    description: "מצאת דירה מעולה ורוצה לנסות להוריד את השכירות",
    category: "bargaining",
    userRole: "שוכר פוטנציאלי",
    aiRole: "בעל הדירה",
    goal: "להוריד את השכירות או לקבל תנאים טובים יותר",
    difficulty: 3,
  },
  {
    id: "bargaining-market",
    title: "מיקוח בשוק",
    description: "אתה בשוק ורוצה לקנות מוצר במחיר טוב",
    category: "bargaining",
    userRole: "קונה בשוק",
    aiRole: "מוכר בדוכן",
    goal: "לקבל הנחה משמעותית על המחיר הנקוב",
    difficulty: 1,
  },

  // ===== Everyday =====
  {
    id: "everyday-deadline",
    title: "בקשת דחיית דדליין",
    description: "יש לך פרויקט שלא תספיק לסיים בזמן",
    category: "everyday",
    userRole: "עובד שצריך יותר זמן",
    aiRole: "מנהל פרויקט לחוץ",
    goal: "לקבל הארכה בלי לפגוע במוניטין",
    difficulty: 3,
  },
  {
    id: "everyday-work-from-home",
    title: "בקשה לעבודה מהבית",
    description: "אתה רוצה לעבוד יותר ימים מהבית",
    category: "everyday",
    userRole: "עובד שרוצה גמישות",
    aiRole: "מנהל שמעדיף עבודה מהמשרד",
    goal: "לקבל לפחות 3 ימי עבודה מהבית",
    difficulty: 4,
  },
  {
    id: "everyday-neighbor",
    title: "סכסוך שכנים",
    description: "השכן עושה רעש בלילות ואתה רוצה לפתור את הבעיה",
    category: "everyday",
    userRole: "שכן שסובל מרעש",
    aiRole: "שכן שלא מודע לבעיה",
    goal: "להגיע להסכמה על שעות שקט",
    difficulty: 2,
  },
  {
    id: "everyday-refund",
    title: "בקשת החזר כספי",
    description: "קנית מוצר פגום ורוצה החזר מלא",
    category: "everyday",
    userRole: "לקוח לא מרוצה",
    aiRole: "נציג שירות לקוחות",
    goal: "לקבל החזר כספי מלא או פיצוי משמעותי",
    difficulty: 2,
  },
];

// Helper to get scenarios by category
export function getScenariosByCategory(category: ScenarioCategory): ScenarioTemplate[] {
  return scenarioTemplates.filter((s) => s.category === category);
}

// Category info
export const scenarioCategories = [
  {
    id: "salary" as ScenarioCategory,
    name: "שכר וקריירה",
    icon: "Briefcase",
    description: "העלאות שכר, הצעות עבודה, קידום",
    color: "green",
  },
  {
    id: "business" as ScenarioCategory,
    name: "עסקי",
    icon: "Building",
    description: "חוזים, ספקים, שותפויות",
    color: "blue",
  },
  {
    id: "bargaining" as ScenarioCategory,
    name: "מקח וממכר",
    icon: "ShoppingCart",
    description: "קניות, שכירות, מוצרים",
    color: "orange",
  },
  {
    id: "everyday" as ScenarioCategory,
    name: "יומיום",
    icon: "Home",
    description: "עבודה, שכנים, שירות לקוחות",
    color: "purple",
  },
];

export const RECENT_SCENARIOS_LIMIT = 5;
export const MAX_RECENT_SCENARIOS = 5;
