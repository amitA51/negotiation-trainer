import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

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
    const body = await request.json();
    const { userId, action } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    
    if (action === 'generate') {
      try {
        const db = getAdminDb();
        
        // Generate new code
        const code = generatePairingCode();
        
        await db.collection('pairingCodes').add({
          code,
          userId,
          used: false,
          createdAt: FieldValue.serverTimestamp(),
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
      } catch (firestoreError: unknown) {
        const errorMessage = firestoreError instanceof Error ? firestoreError.message : 'Unknown error';
        return NextResponse.json({ 
          error: 'Firestore error', 
          details: errorMessage 
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal error', details: errorMessage }, { status: 500 });
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
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// Get webhook info
export async function GET() {
  try {
    const response = await fetch(`${TELEGRAM_API}/getWebhookInfo`);
    const result = await response.json();
    
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
