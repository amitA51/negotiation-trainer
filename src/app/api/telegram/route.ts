import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  text?: string;
  photo?: Array<{
    file_id: string;
    file_unique_id: string;
    width: number;
    height: number;
  }>;
  document?: {
    file_id: string;
    file_name: string;
    mime_type: string;
  };
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

async function sendTelegramMessage(chatId: number, text: string, parseMode: 'HTML' | 'Markdown' = 'HTML') {
  const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
    }),
  });
  return response.json();
}

async function handlePairingCode(chatId: number, telegramUserId: number, code: string, userName: string) {
  const db = getAdminDb();
  
  // Find pairing request with this code
  const pairingQuery = await db.collection('pairingCodes')
    .where('code', '==', code.toUpperCase())
    .where('used', '==', false)
    .limit(1)
    .get();
  
  if (pairingQuery.empty) {
    await sendTelegramMessage(chatId, 
      '❌ <b>קוד לא תקין או פג תוקף</b>\n\nנסה שוב או צור קוד חדש באפליקציה.'
    );
    return;
  }
  
  const pairingDoc = pairingQuery.docs[0];
  const pairingData = pairingDoc.data();
  
  // Check if code is expired (15 minutes)
  const createdAt = pairingData.createdAt?.toDate();
  if (createdAt && Date.now() - createdAt.getTime() > 15 * 60 * 1000) {
    await sendTelegramMessage(chatId,
      '⏰ <b>הקוד פג תוקף</b>\n\nצור קוד חדש באפליקציה ונסה שוב.'
    );
    return;
  }
  
  // Update user with Telegram info
  await db.collection('users').doc(pairingData.userId).update({
    telegramChatId: chatId,
    telegramUserId: telegramUserId,
    telegramUsername: userName,
    telegramLinkedAt: FieldValue.serverTimestamp(),
  });
  
  // Mark code as used
  await pairingDoc.ref.update({
    used: true,
    usedAt: FieldValue.serverTimestamp(),
  });
  
  await sendTelegramMessage(chatId,
    '✅ <b>החשבון צומד בהצלחה!</b>\n\n' +
    'עכשיו אתה יכול:\n' +
    '• לשלוח /advice להתחיל ייעוץ\n' +
    '• לשלוח /train להתחיל אימון\n' +
    '• לשלוח תמונות או מסמכים לניתוח\n\n' +
    'שלח /help לרשימת הפקודות המלאה.'
  );
}

async function handleCommand(message: TelegramMessage) {
  const chatId = message.chat.id;
  const text = message.text || '';
  const command = text.split(' ')[0].toLowerCase();
  const args = text.slice(command.length).trim();
  
  switch (command) {
    case '/start':
      const startArgs = args;
      if (startArgs && startArgs.length === 6) {
        // Deep link with pairing code
        await handlePairingCode(chatId, message.from.id, startArgs, message.from.username || message.from.first_name);
      } else {
        await sendTelegramMessage(chatId,
          '👋 <b>ברוך הבא ל-NEGO!</b>\n\n' +
          'אני מאמן משא ומתן מקצועי שיעזור לך לשפר את כישורי המשא ומתן שלך.\n\n' +
          '🔗 <b>לצימוד החשבון:</b>\n' +
          '1. היכנס לאפליקציה בכתובת nego.app\n' +
          '2. לך להגדרות → צימוד טלגרם\n' +
          '3. שלח לי את הקוד שתקבל\n\n' +
          'או שלח /help לעזרה.'
        );
      }
      break;
      
    case '/help':
      await sendTelegramMessage(chatId,
        '📚 <b>פקודות זמינות:</b>\n\n' +
        '/start - התחלה וצימוד\n' +
        '/advice - התחל שיחת ייעוץ\n' +
        '/train - התחל אימון\n' +
        '/techniques - רשימת טכניקות\n' +
        '/stats - הסטטיסטיקות שלך\n' +
        '/stop - סיים שיחה נוכחית\n\n' +
        '💡 <b>טיפ:</b> אתה יכול גם לשלוח תמונות של הודעות או מסמכים ואנתח אותם בשבילך!'
      );
      break;
      
    case '/advice':
      await startConsultation(chatId, message.from.id);
      break;
      
    case '/train':
      await sendTelegramMessage(chatId,
        '🎯 <b>בחר תרחיש לאימון:</b>\n\n' +
        '1️⃣ משכורת - משא ומתן על העלאה\n' +
        '2️⃣ לקוח - סגירת עסקה\n' +
        '3️⃣ שוק - קנייה בהנחה\n' +
        '4️⃣ שותפות - חלוקת אחריות\n\n' +
        'שלח את המספר של התרחיש הרצוי.'
      );
      break;
      
    case '/techniques':
      await sendTelegramMessage(chatId,
        '🎭 <b>טכניקות פופולריות:</b>\n\n' +
        '• <b>שיקוף (Mirroring)</b> - חזור על המילים האחרונות\n' +
        '• <b>תיוג (Labeling)</b> - "נראה שאתה מרגיש..."\n' +
        '• <b>BATNA</b> - הכר את האלטרנטיבה שלך\n' +
        '• <b>עיגון</b> - הצע ראשון מספר גבוה\n' +
        '• <b>שתיקה</b> - תן לשקט לעבוד\n\n' +
        'לרשימה המלאה עם 18 טכניקות, היכנס לאפליקציה → ספריית טכניקות'
      );
      break;
      
    case '/stats':
      await sendUserStats(chatId, message.from.id);
      break;
      
    case '/stop':
      await endActiveSession(chatId, message.from.id);
      break;
      
    default:
      // Check if user is in active session
      await handleConversation(message);
  }
}

async function startConsultation(chatId: number, telegramUserId: number) {
  const db = getAdminDb();
  
  // Find linked user
  const userQuery = await db.collection('users')
    .where('telegramUserId', '==', telegramUserId)
    .limit(1)
    .get();
  
  if (userQuery.empty) {
    await sendTelegramMessage(chatId,
      '⚠️ <b>החשבון לא מצומד</b>\n\n' +
      'כדי להשתמש בתכונה זו, קודם צמד את החשבון שלך.\n' +
      'שלח /start לקבלת הוראות.'
    );
    return;
  }
  
  const userDoc = userQuery.docs[0];
  
  // Create new consultation session
  const consultationRef = await db.collection('users').doc(userDoc.id)
    .collection('consultations').add({
      createdAt: FieldValue.serverTimestamp(),
      status: 'active',
      source: 'telegram',
      telegramChatId: chatId,
    });
  
  // Save active session
  await userDoc.ref.update({
    activeTelegramSession: {
      type: 'consultation',
      sessionId: consultationRef.id,
      startedAt: FieldValue.serverTimestamp(),
    }
  });
  
  await sendTelegramMessage(chatId,
    '💼 <b>מצב ייעוץ</b>\n\n' +
    'ספר לי על המצב שלך:\n' +
    '• עם מי אתה מנהל משא ומתן?\n' +
    '• מה המטרה שלך?\n' +
    '• מה האתגר העיקרי?\n\n' +
    'אתה יכול גם לשלוח תמונות של הודעות או מסמכים לניתוח.\n\n' +
    '<i>שלח /stop לסיום השיחה</i>'
  );
}

async function sendUserStats(chatId: number, telegramUserId: number) {
  const db = getAdminDb();
  
  const userQuery = await db.collection('users')
    .where('telegramUserId', '==', telegramUserId)
    .limit(1)
    .get();
  
  if (userQuery.empty) {
    await sendTelegramMessage(chatId, '⚠️ החשבון לא מצומד. שלח /start לצימוד.');
    return;
  }
  
  const userData = userQuery.docs[0].data();
  const stats = userData.stats || {};
  
  await sendTelegramMessage(chatId,
    '📊 <b>הסטטיסטיקות שלך:</b>\n\n' +
    `🎯 אימונים: ${stats.trainingSessions || 0}\n` +
    `💼 ייעוצים: ${stats.consultations || 0}\n` +
    `⭐ ציון ממוצע: ${stats.averageScore?.toFixed(1) || 'N/A'}\n` +
    `🏆 רצף ימים: ${stats.streak || 0}\n\n` +
    'לסטטיסטיקות מפורטות, היכנס לאפליקציה.'
  );
}

async function endActiveSession(chatId: number, telegramUserId: number) {
  const db = getAdminDb();
  
  const userQuery = await db.collection('users')
    .where('telegramUserId', '==', telegramUserId)
    .limit(1)
    .get();
  
  if (userQuery.empty) {
    await sendTelegramMessage(chatId, 'אין שיחה פעילה.');
    return;
  }
  
  const userDoc = userQuery.docs[0];
  const userData = userDoc.data();
  
  if (!userData.activeTelegramSession) {
    await sendTelegramMessage(chatId, 'אין שיחה פעילה.');
    return;
  }
  
  await userDoc.ref.update({
    activeTelegramSession: null,
  });
  
  await sendTelegramMessage(chatId,
    '✅ <b>השיחה הסתיימה</b>\n\n' +
    'תודה על התרגול! שלח /train או /advice להתחיל שיחה חדשה.'
  );
}

async function handleConversation(message: TelegramMessage) {
  const db = getAdminDb();
  const chatId = message.chat.id;
  const telegramUserId = message.from.id;
  const userMessage = message.text || '';
  
  // Find linked user with active session
  const userQuery = await db.collection('users')
    .where('telegramUserId', '==', telegramUserId)
    .limit(1)
    .get();
  
  if (userQuery.empty) {
    // Not linked - check if message looks like a pairing code
    if (message.text && /^[A-Z0-9]{6}$/i.test(message.text.trim())) {
      await handlePairingCode(chatId, telegramUserId, message.text.trim(), message.from.username || message.from.first_name);
      return;
    }
    
    await sendTelegramMessage(chatId,
      'שלח /start כדי להתחיל או לצמד את החשבון שלך.'
    );
    return;
  }
  
  const userDoc = userQuery.docs[0];
  const userData = userDoc.data();
  
  if (!userData.activeTelegramSession) {
    await sendTelegramMessage(chatId,
      'אין שיחה פעילה. שלח /advice לייעוץ או /train לאימון.'
    );
    return;
  }
  
  // Send typing indicator
  await fetch(`${TELEGRAM_API}/sendChatAction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, action: 'typing' }),
  });
  
  try {
    // Get AI response from our chat API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://negotiation-trainer-rust.vercel.app'}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        history: userData.telegramChatHistory || [],
        mode: userData.activeTelegramSession.type === 'consultation' ? 'consultation' : 'training',
        difficulty: 3,
      }),
    });
    
    const data = await response.json();
    
    if (data.message) {
      // Update chat history in Firestore
      const newHistory = [
        ...(userData.telegramChatHistory || []),
        { role: 'user', content: userMessage },
        { role: 'ai', content: data.message },
      ].slice(-20); // Keep last 20 messages
      
      await userDoc.ref.update({
        telegramChatHistory: newHistory,
      });
      
      await sendTelegramMessage(chatId, data.message);
    }
  } catch (error) {
    console.error('Error getting AI response:', error);
    await sendTelegramMessage(chatId,
      '⚠️ שגיאה בעיבוד ההודעה. נסה שוב.'
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json();
    
    if (!update.message) {
      return NextResponse.json({ ok: true });
    }
    
    const message = update.message;
    
    // Handle commands
    if (message.text?.startsWith('/')) {
      await handleCommand(message);
    } else {
      // Handle regular messages (conversation)
      await handleConversation(message);
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// Verification endpoint for setting up webhook
export async function GET() {
  return NextResponse.json({
    status: 'Telegram webhook endpoint active',
    bot: 'NEGO - מאמן משא ומתן',
  });
}
