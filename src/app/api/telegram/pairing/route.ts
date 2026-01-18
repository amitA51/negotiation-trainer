import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { checkRateLimit, handleAPIError } from '@/lib/utils/api-helpers';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Validation schemas
const GeneratePairingSchema = z.object({
  userId: z.string().min(1, 'User ID required'),
  action: z.literal('generate'),
});

const WebhookSetupSchema = z.object({
  webhookUrl: z.string().url('Invalid webhook URL'),
  secret: z.string().min(1, 'Secret required'),
});

/** Generate random 6-character pairing code */
function generatePairingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * POST /api/telegram/pairing
 * Create pairing code for user
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 requests per minute per user (pairing codes are sensitive)
    const rateLimitResponse = await checkRateLimit(request, {
      uniqueTokenPerInterval: 5,
      interval: 60000,
    });
    if (rateLimitResponse) return rateLimitResponse;

    // Validate request body
    const body = await request.json();
    const validation = GeneratePairingSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.issues.map(i => i.message).join(', ') 
        },
        { status: 400 }
      );
    }

    const { userId } = validation.data;

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
      console.error('[/api/telegram/pairing] Firestore error:', errorMessage);
      return NextResponse.json(
        { error: 'Firestore error', details: errorMessage },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    return handleAPIError(error);
  }
}

/**
 * PUT /api/telegram/pairing
 * Setup webhook (admin only, call once)
 */
export async function PUT(request: NextRequest) {
  try {
    // Rate limit: 2 requests per minute (admin action)
    const rateLimitResponse = await checkRateLimit(request, {
      uniqueTokenPerInterval: 2,
      interval: 60000,
    });
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json();
    const validation = WebhookSetupSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error.issues.map(i => i.message).join(', ') 
        },
        { status: 400 }
      );
    }

    const { webhookUrl, secret } = validation.data;

    // Simple secret check
    if (secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    return handleAPIError(error);
  }
}

/**
 * GET /api/telegram/pairing
 * Get webhook info
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limit: 10 requests per minute
    const rateLimitResponse = await checkRateLimit(request, {
      uniqueTokenPerInterval: 10,
      interval: 60000,
    });
    if (rateLimitResponse) return rateLimitResponse;

    const response = await fetch(`${TELEGRAM_API}/getWebhookInfo`);
    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    return handleAPIError(error);
  }
}
