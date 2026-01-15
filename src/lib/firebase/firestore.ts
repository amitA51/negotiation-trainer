import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  Timestamp,
  DocumentReference,
} from "firebase/firestore";
import { db } from "./config";
import type {
  Session,
  Message,
  SessionAnalysis,
  Consultation,
  UserStats,
  Technique,
  UserSettings,
} from "@/types";

// ============================================
// User Functions
// ============================================

export async function updateUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<void> {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { settings });
}

export async function updateTelegramLink(
  userId: string,
  telegramChatId: string
): Promise<void> {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    telegramChatId,
    linkingCode: null,
  });
}

export async function generateLinkingCode(userId: string): Promise<string> {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    linkingCode: {
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
  });

  return code;
}

// ============================================
// Session Functions
// ============================================

export async function createSession(
  userId: string,
  sessionData: Omit<Session, "id" | "startedAt" | "lastActiveAt">
): Promise<string> {
  const sessionsRef = collection(db, "sessions");
  const docRef = await addDoc(sessionsRef, {
    ...sessionData,
    userId,
    startedAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const sessionRef = doc(db, "sessions", sessionId);
  const sessionSnap = await getDoc(sessionRef);

  if (!sessionSnap.exists()) return null;

  const data = sessionSnap.data();
  return {
    id: sessionSnap.id,
    userId: data.userId,
    type: data.type,
    difficulty: data.difficulty,
    status: data.status,
    startedAt: data.startedAt?.toDate() || new Date(),
    lastActiveAt: data.lastActiveAt?.toDate() || new Date(),
    completedAt: data.completedAt?.toDate(),
    scenario: data.scenario,
    source: data.source,
  };
}

export async function updateSession(
  sessionId: string,
  updates: Partial<Session>
): Promise<void> {
  const sessionRef = doc(db, "sessions", sessionId);
  await updateDoc(sessionRef, {
    ...updates,
    lastActiveAt: serverTimestamp(),
  });
}

export async function getUserSessions(
  userId: string,
  limitCount: number = 20
): Promise<Session[]> {
  const sessionsRef = collection(db, "sessions");
  const q = query(
    sessionsRef,
    where("userId", "==", userId),
    orderBy("lastActiveAt", "desc"),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      type: data.type,
      difficulty: data.difficulty,
      status: data.status,
      startedAt: data.startedAt?.toDate() || new Date(),
      lastActiveAt: data.lastActiveAt?.toDate() || new Date(),
      completedAt: data.completedAt?.toDate(),
      scenario: data.scenario,
      source: data.source,
    };
  });
}

export async function getActiveSession(userId: string): Promise<Session | null> {
  const sessionsRef = collection(db, "sessions");
  const q = query(
    sessionsRef,
    where("userId", "==", userId),
    where("status", "in", ["active", "paused"]),
    orderBy("lastActiveAt", "desc"),
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    type: data.type,
    difficulty: data.difficulty,
    status: data.status,
    startedAt: data.startedAt?.toDate() || new Date(),
    lastActiveAt: data.lastActiveAt?.toDate() || new Date(),
    completedAt: data.completedAt?.toDate(),
    scenario: data.scenario,
    source: data.source,
  };
}

// ============================================
// Message Functions
// ============================================

export async function addMessage(
  sessionId: string,
  message: Omit<Message, "id" | "timestamp">
): Promise<string> {
  const messagesRef = collection(db, "sessions", sessionId, "messages");
  const docRef = await addDoc(messagesRef, {
    ...message,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
}

export async function getMessages(
  sessionId: string,
  limitCount: number = 50
): Promise<Message[]> {
  const messagesRef = collection(db, "sessions", sessionId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"), limit(limitCount));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      role: data.role,
      content: data.content,
      timestamp: data.timestamp?.toDate() || new Date(),
      techniquesDetected: data.techniquesDetected,
      attachments: data.attachments,
    };
  });
}

// ============================================
// Analysis Functions
// ============================================

export async function saveAnalysis(
  sessionId: string,
  analysis: Omit<SessionAnalysis, "id" | "sessionId" | "createdAt">
): Promise<string> {
  const analysisRef = collection(db, "sessions", sessionId, "analysis");
  const docRef = await addDoc(analysisRef, {
    ...analysis,
    sessionId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getAnalysis(sessionId: string): Promise<SessionAnalysis | null> {
  const analysisRef = collection(db, "sessions", sessionId, "analysis");
  const q = query(analysisRef, orderBy("createdAt", "desc"), limit(1));

  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    sessionId: data.sessionId,
    score: data.score,
    techniquesUsed: data.techniquesUsed,
    strengths: data.strengths,
    improvements: data.improvements,
    recommendations: data.recommendations,
    dealSummary: data.dealSummary,
    createdAt: data.createdAt?.toDate() || new Date(),
  };
}

// ============================================
// Consultation Functions
// ============================================

export async function createConsultation(
  userId: string,
  situation: string
): Promise<string> {
  const consultationsRef = collection(db, "consultations");
  const docRef = await addDoc(consultationsRef, {
    userId,
    situation,
    status: "active",
    createdAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getConsultation(consultationId: string): Promise<Consultation | null> {
  const consultationRef = doc(db, "consultations", consultationId);
  const consultationSnap = await getDoc(consultationRef);

  if (!consultationSnap.exists()) return null;

  const data = consultationSnap.data();
  return {
    id: consultationSnap.id,
    userId: data.userId,
    situation: data.situation,
    status: data.status,
    createdAt: data.createdAt?.toDate() || new Date(),
    lastActiveAt: data.lastActiveAt?.toDate() || new Date(),
  };
}

export async function addConsultationMessage(
  consultationId: string,
  message: Omit<Message, "id" | "timestamp">
): Promise<string> {
  const messagesRef = collection(db, "consultations", consultationId, "messages");
  const docRef = await addDoc(messagesRef, {
    ...message,
    timestamp: serverTimestamp(),
  });

  // Update lastActiveAt
  await updateDoc(doc(db, "consultations", consultationId), {
    lastActiveAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getConsultationMessages(
  consultationId: string,
  limitCount: number = 50
): Promise<Message[]> {
  const messagesRef = collection(db, "consultations", consultationId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"), limit(limitCount));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      role: data.role,
      content: data.content,
      timestamp: data.timestamp?.toDate() || new Date(),
      techniquesDetected: data.techniquesDetected,
      attachments: data.attachments,
    };
  });
}

// ============================================
// Stats Functions
// ============================================

export async function getUserStats(userId: string): Promise<UserStats | null> {
  const statsRef = doc(db, "userStats", userId);
  const statsSnap = await getDoc(statsRef);

  if (!statsSnap.exists()) return null;

  const data = statsSnap.data();
  return {
    totalTrainingSessions: data.totalTrainingSessions || 0,
    totalConsultations: data.totalConsultations || 0,
    avgScore: data.avgScore || 0,
    techniquesUsed: data.techniquesUsed || {},
    scoresHistory: (data.scoresHistory || []).map((s: any) => ({
      ...s,
      date: s.date?.toDate() || new Date(),
    })),
    strongTechniques: data.strongTechniques || [],
    weakTechniques: data.weakTechniques || [],
  };
}

export async function updateUserStats(
  userId: string,
  sessionId: string,
  score: number,
  techniquesUsed: string[]
): Promise<void> {
  const statsRef = doc(db, "userStats", userId);
  const statsSnap = await getDoc(statsRef);

  if (!statsSnap.exists()) return;

  const currentStats = statsSnap.data();
  const newTotalSessions = (currentStats.totalTrainingSessions || 0) + 1;
  const currentAvg = currentStats.avgScore || 0;
  const newAvg = ((currentAvg * (newTotalSessions - 1)) + score) / newTotalSessions;

  // Update techniques count
  const techCounts = { ...(currentStats.techniquesUsed || {}) };
  techniquesUsed.forEach((tech) => {
    techCounts[tech] = (techCounts[tech] || 0) + 1;
  });

  // Add to scores history (keep last 50)
  const scoresHistory = currentStats.scoresHistory || [];
  scoresHistory.push({
    date: new Date(),
    score,
    sessionId,
  });
  if (scoresHistory.length > 50) {
    scoresHistory.shift();
  }

  await updateDoc(statsRef, {
    totalTrainingSessions: newTotalSessions,
    avgScore: Math.round(newAvg),
    techniquesUsed: techCounts,
    scoresHistory,
  });
}

// ============================================
// Techniques Functions
// ============================================

export async function getTechniques(): Promise<Technique[]> {
  const techniquesRef = collection(db, "techniques");
  const snapshot = await getDocs(techniquesRef);

  return snapshot.docs.map((doc) => ({
    code: doc.id,
    ...doc.data(),
  })) as Technique[];
}

export async function getTechnique(code: string): Promise<Technique | null> {
  const techniqueRef = doc(db, "techniques", code);
  const techniqueSnap = await getDoc(techniqueRef);

  if (!techniqueSnap.exists()) return null;

  return {
    code: techniqueSnap.id,
    ...techniqueSnap.data(),
  } as Technique;
}
