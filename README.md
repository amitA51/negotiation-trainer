# NEGO - מאמן משא ומתן מקצועי

אפליקציית אימון משא ומתן עם AI.

## תכונות

- **מצב אימון**: תרגול משא ומתן מול AI (8 רמות קושי)
- **מצב ייעוץ**: קבלת ייעוץ למצבי משא ומתן אמיתיים
- **ספריית טכניקות**: 18 טכניקות משא ומתן מקצועיות
- **אינטגרציית טלגרם**: שימוש במאמן דרך בוט טלגרם
- **סטטיסטיקות**: מעקב אחר התקדמות לאורך זמן

## טכנולוגיות

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore)
- **AI**: Google Gemini API
- **Bot**: Telegram Bot API (@Negotiationthebot)

## התקנה

```bash
npm install
```

## משתני סביבה

צור קובץ `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

GEMINI_API_KEY=your_gemini_key
TELEGRAM_BOT_TOKEN=your_bot_token
```

## פיתוח

```bash
npm run dev
```

## Deploy

הפרויקט מוגדר עם GitHub Actions לפריסה אוטומטית ל-Firebase:

1. Push ל-main branch
2. GitHub Actions בונה את הפרויקט
3. מפרסם אוטומטית ל-Firebase Hosting

## מבנה הפרויקט

```
src/
├── app/                 # Next.js App Router
│   ├── (app)/          # Protected routes
│   ├── (auth)/         # Auth routes
│   └── api/            # API routes
├── components/         # React components
├── contexts/          # React contexts
├── data/              # Static data
├── lib/               # Utilities
└── types/             # TypeScript types
```

## License

MIT
