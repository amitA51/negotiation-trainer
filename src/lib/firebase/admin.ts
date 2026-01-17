import { initializeApp, getApps, cert, App, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App;
let adminDb: Firestore;

/**
 * Parse the private key from environment variable
 * Handles multiple formats:
 * 1. Full JSON service account (FIREBASE_SERVICE_ACCOUNT)
 * 2. JSON escaped (\\n) - from copying JSON value
 * 3. Literal newlines - from multi-line paste
 * 4. Base64 encoded - alternative format
 */
function getCredentials(): { projectId: string; clientEmail: string; privateKey: string } | null {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  
  // Option 1: Full service account JSON
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccountJson) {
    try {
      const parsed = JSON.parse(serviceAccountJson);
      console.log('[Firebase Admin] Using FIREBASE_SERVICE_ACCOUNT');
      return {
        projectId: parsed.project_id || projectId || '',
        clientEmail: parsed.client_email,
        privateKey: parsed.private_key,
      };
    } catch (e) {
      console.error('[Firebase Admin] Failed to parse FIREBASE_SERVICE_ACCOUNT:', e);
    }
  }
  
  // Option 2: Separate environment variables
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
  const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  
  if (!clientEmail) {
    console.error('[Firebase Admin] FIREBASE_ADMIN_CLIENT_EMAIL is not set');
    return null;
  }
  
  if (!rawPrivateKey) {
    console.error('[Firebase Admin] FIREBASE_ADMIN_PRIVATE_KEY is not set');
    return null;
  }
  
  let key = rawPrivateKey.trim();
  
  // Log first 50 chars for debugging (safe - doesn't expose the key)
  console.log('[Firebase Admin] Private key starts with:', key.substring(0, 50));
  console.log('[Firebase Admin] Private key length:', key.length);
  
  // Remove surrounding quotes if present
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
    console.log('[Firebase Admin] Removed surrounding quotes');
  }
  
  // Check if it's Base64 encoded (no BEGIN marker)
  if (!key.includes('-----BEGIN') && key.length > 100) {
    try {
      const decoded = Buffer.from(key, 'base64').toString('utf-8');
      if (decoded.includes('-----BEGIN')) {
        key = decoded;
        console.log('[Firebase Admin] Decoded from Base64');
      }
    } catch {
      // Not base64, continue with normal processing
    }
  }
  
  // Replace escaped newlines with actual newlines
  key = key.replace(/\\n/g, '\n');
  
  // Validate the key format
  if (!key.includes('-----BEGIN PRIVATE KEY-----')) {
    console.error('[Firebase Admin] Key missing BEGIN marker');
    return null;
  }
  
  if (!key.includes('-----END PRIVATE KEY-----')) {
    console.error('[Firebase Admin] Key missing END marker');
    return null;
  }
  
  console.log('[Firebase Admin] Private key parsed successfully');
  return {
    projectId: projectId || '',
    clientEmail,
    privateKey: key,
  };
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
  
  try {
    const credentials = getCredentials();
    
    if (credentials) {
      // Use service account credentials
      console.log('[Firebase Admin] Initializing with service account:', credentials.clientEmail);
      adminApp = initializeApp({
        credential: cert({
          projectId: credentials.projectId,
          clientEmail: credentials.clientEmail,
          privateKey: credentials.privateKey,
        }),
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Use Application Default Credentials
      console.log('[Firebase Admin] Initializing with Application Default Credentials');
      adminApp = initializeApp({
        credential: applicationDefault(),
        projectId,
      });
    } else {
      // No credentials available
      throw new Error('No Firebase Admin credentials available. Set FIREBASE_SERVICE_ACCOUNT or FIREBASE_ADMIN_CLIENT_EMAIL + FIREBASE_ADMIN_PRIVATE_KEY');
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
