import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "./config";
import type { User, UserSettings } from "@/types";

const defaultSettings: UserSettings = {
  preferredDifficulty: 3,
  notifications: true,
};

/**
 * Create or update user document in Firestore
 */
async function createUserDocument(firebaseUser: FirebaseUser): Promise<User> {
  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const userData: Omit<User, "uid"> = {
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      createdAt: new Date(),
      telegramChatId: null,
      linkingCode: null,
      settings: defaultSettings,
    };

    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
    });

    // Create initial stats document
    await setDoc(doc(db, "userStats", firebaseUser.uid), {
      totalTrainingSessions: 0,
      totalConsultations: 0,
      avgScore: 0,
      techniquesUsed: {},
      scoresHistory: [],
      strongTechniques: [],
      weakTechniques: [],
    });

    return { uid: firebaseUser.uid, ...userData };
  }

  const data = userSnap.data();
  return {
    uid: firebaseUser.uid,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    createdAt: data.createdAt?.toDate() || new Date(),
    telegramChatId: data.telegramChatId,
    linkingCode: data.linkingCode,
    settings: data.settings || defaultSettings,
  };
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return createUserDocument(result.user);
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return createUserDocument(result.user);
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  
  await updateProfile(result.user, { displayName });
  
  return createUserDocument(result.user);
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Get current user data from Firestore
 */
export async function getCurrentUserData(): Promise<User | null> {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) return null;

  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return createUserDocument(firebaseUser);
  }

  const data = userSnap.data();
  return {
    uid: firebaseUser.uid,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    createdAt: data.createdAt?.toDate() || new Date(),
    telegramChatId: data.telegramChatId,
    linkingCode: data.linkingCode,
    settings: data.settings || defaultSettings,
  };
}
