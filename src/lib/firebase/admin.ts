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
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.trim().replace(/\\n/g, '\n');
  
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
