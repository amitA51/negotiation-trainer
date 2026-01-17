import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    FIREBASE_SERVICE_ACCOUNT: {
      exists: !!process.env.FIREBASE_SERVICE_ACCOUNT,
      length: process.env.FIREBASE_SERVICE_ACCOUNT?.length || 0,
      startsWith: process.env.FIREBASE_SERVICE_ACCOUNT?.substring(0, 20) || 'N/A',
    },
    FIREBASE_ADMIN_CLIENT_EMAIL: {
      exists: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      value: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || 'N/A',
    },
    FIREBASE_ADMIN_PRIVATE_KEY: {
      exists: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
      length: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.length || 0,
      startsWith: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.substring(0, 30) || 'N/A',
    },
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'N/A',
  };

  return NextResponse.json({
    message: 'Environment variable check',
    envVars,
    timestamp: new Date().toISOString(),
  });
}
