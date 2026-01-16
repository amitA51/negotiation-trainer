import { initializeApp, getApps, cert, App, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App;
let adminDb: Firestore;

function getAdminApp(): App {
  if (adminApp) {
    return adminApp;
  }
  
  const apps = getApps();
  
  if (apps.length > 0) {
    adminApp = apps[0];
    return adminApp;
  }
  
  // Trim all values to remove any whitespace/newlines that may have been added
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
  
  // Handle private key - support both formats:
  // 1. Actual newlines (from JSON file paste)
  // 2. Escaped \n characters (from single-line paste)
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (privateKey) {
    // Log first 50 chars for debugging (safe - doesn't expose key)
    console.log('[Firebase Admin] Private key starts with:', privateKey.substring(0, 50));
    console.log('[Firebase Admin] Private key length:', privateKey.length);
    
    // Trim whitespace
    privateKey = privateKey.trim();
    
    // Replace literal \n strings with actual newlines
    if (privateKey.includes('\\n')) {
      console.log('[Firebase Admin] Found escaped newlines, replacing...');
      privateKey = privateKey.split('\\n').join('\n');
    }
    
    // Log result
    console.log('[Firebase Admin] After processing, starts with:', privateKey.substring(0, 30));
    console.log('[Firebase Admin] Contains newlines:', privateKey.includes('\n'));
  } else {
    console.log('[Firebase Admin] No private key found!');
  }
  
  try {
    if (clientEmail && privateKey) {
      // Use service account credentials
      console.log('[Firebase Admin] Initializing with service account');
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // Use Application Default Credentials
      console.log('[Firebase Admin] Initializing with ADC');
      adminApp = initializeApp({
        credential: applicationDefault(),
        projectId,
      });
    } else {
      // Fallback: Initialize with just project ID
      // This will only work in Google Cloud environment
      console.log('[Firebase Admin] Initializing with project ID only');
      adminApp = initializeApp({
        projectId,
      });
    }
  } catch (error: any) {
    console.error('[Firebase Admin] Initialization error:', error.message);
    throw error;
  }
  
  return adminApp;
}

export function getAdminDb(): Firestore {
  if (!adminDb) {
    adminDb = getFirestore(getAdminApp());
  }
  return adminDb;
}
