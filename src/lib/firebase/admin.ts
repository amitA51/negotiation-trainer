import { initializeApp, getApps, cert, App, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App;
let adminDb: Firestore;

/**
 * Parse the private key from environment variable
 * Handles multiple formats:
 * 1. JSON escaped (\\n) - from copying JSON value
 * 2. Literal newlines - from multi-line paste
 * 3. Base64 encoded - alternative format
 */
function parsePrivateKey(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  
  let key = raw.trim();
  
  // Remove surrounding quotes if present
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  
  // Check if it's Base64 encoded (no BEGIN marker)
  if (!key.includes('-----BEGIN') && key.length > 100) {
    try {
      const decoded = Buffer.from(key, 'base64').toString('utf-8');
      if (decoded.includes('-----BEGIN')) {
        key = decoded;
      }
    } catch {
      // Not base64, continue with normal processing
    }
  }
  
  // Replace escaped newlines with actual newlines
  // Handle both \\n (JSON escaped) and literal \n
  key = key.replace(/\\n/g, '\n');
  
  // Validate the key format
  if (!key.includes('-----BEGIN PRIVATE KEY-----') || !key.includes('-----END PRIVATE KEY-----')) {
    throw new Error('Invalid private key format - must contain BEGIN/END PRIVATE KEY markers');
  }
  
  return key;
}

function getAdminApp(): App {
  if (adminApp) {
    return adminApp;
  }
  
  const apps = getApps();
  
  if (apps.length > 0) {
    adminApp = apps[0];
    return adminApp;
  }
  
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
  
  try {
    const privateKey = parsePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);
    
    if (clientEmail && privateKey) {
      // Use service account credentials
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Use Application Default Credentials
      adminApp = initializeApp({
        credential: applicationDefault(),
        projectId,
      });
    } else {
      // Fallback: Initialize with just project ID
      // This will only work in Google Cloud environment
      adminApp = initializeApp({
        projectId,
      });
    }
  } catch (error) {
    // Re-throw with more context
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Firebase Admin initialization failed: ${message}`);
  }
  
  return adminApp;
}

export function getAdminDb(): Firestore {
  if (!adminDb) {
    adminDb = getFirestore(getAdminApp());
  }
  return adminDb;
}
