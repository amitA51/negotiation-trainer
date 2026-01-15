import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc } from 'firebase/firestore';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Generate random 6-character pairing code
function generatePairingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create pairing code for user
export async function POST(request: NextRequest) {
  try {
    const { userId, action } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    
    if (action === 'generate') {
      // Delete existing unused codes for this user
      const existingRef = collection(db, 'pairingCodes');
      const q = query(existingRef, where('userId', '==', userId), where('used', '==', false));
      const existingDocs = await getDocs(q);
      
      for (const doc of existingDocs.docs) {
        await deleteDoc(doc.ref);
      }
      
      // Generate new code
      const code = generatePairingCode();
      
      await addDoc(collection(db, 'pairingCodes'), {
        code,
        userId,
        used: false,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      });
      
      const botUsername = 'Negotiationthebot';
      const deepLink = `https://t.me/${botUsername}?start=${code}`;
      
      return NextResponse.json({
        success: true,
        code,
        deepLink,
        expiresIn: 15 * 60, // seconds
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Telegram pairing error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// Setup webhook (admin only, call once)
export async function PUT(request: NextRequest) {
  try {
    const { webhookUrl, secret } = await request.json();
    
    // Simple secret check (replace with proper auth in production)
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!webhookUrl) {
      return NextResponse.json({ error: 'Missing webhookUrl' }, { status: 400 });
    }
    
    // Set webhook
    const response = await fetch(`${TELEGRAM_API}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message'],
        drop_pending_updates: true,
      }),
    });
    
    const result = await response.json();
    
    return NextResponse.json({
      success: result.ok,
      description: result.description,
    });
  } catch (error) {
    console.error('Webhook setup error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// Get webhook info
export async function GET() {
  try {
    const response = await fetch(`${TELEGRAM_API}/getWebhookInfo`);
    const result = await response.json();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Get webhook info error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
