import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAnalysisPrompt } from "@/lib/gemini/prompts";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Timeout wrapper for async operations
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
  );
  return Promise.race([promise, timeout]);
}

// Retry wrapper with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on validation errors
      if (error instanceof Error && error.message.includes("validation")) {
        throw error;
      }
      
      // Exponential backoff
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, attempt)));
      }
    }
  }
  
  throw lastError;
}

// Default analysis for fallback
const DEFAULT_ANALYSIS = {
  score: 50,
  techniquesUsed: [],
  strengths: ["ניהלת שיחה"],
  improvements: ["נסה להשתמש בטכניקות ספציפיות"],
  recommendations: ["למד על טכניקת השיקוף (Mirroring)"],
  dealSummary: "לא ניתן היה לנתח את השיחה",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, userGoal, difficulty } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages to analyze" },
        { status: 400 }
      );
    }

    // Format conversation
    const conversation = messages
      .filter((m: { role: string }) => m.role !== "system")
      .map((m: { role: string; content: string }) => 
        `${m.role === "user" ? "משתמש" : "יריב"}: ${m.content}`
      )
      .join("\n");

    const prompt = getAnalysisPrompt(conversation, userGoal, difficulty);
    
    // Call Gemini with timeout and retry
    const result = await withRetry(
      () => withTimeout(model.generateContent(prompt), 60000), // 60s timeout for analysis
      3
    );
    const response = await result.response;
    const text = response.text();

    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Validate and normalize
    const normalizedAnalysis = {
      score: Math.max(0, Math.min(100, analysis.score || 0)),
      techniquesUsed: analysis.techniquesUsed || [],
      strengths: analysis.strengths || [],
      improvements: analysis.improvements || [],
      recommendations: analysis.recommendations || [],
      dealSummary: analysis.dealSummary || "לא הושגה עסקה",
    };

    return NextResponse.json(normalizedAnalysis);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Return timeout-specific message
    if (errorMessage.includes("timeout")) {
      return NextResponse.json({
        ...DEFAULT_ANALYSIS,
        dealSummary: "הניתוח נמשך יותר מדי זמן. נסה שוב מאוחר יותר.",
      });
    }
    
    // Return a default analysis on error
    return NextResponse.json(DEFAULT_ANALYSIS);
  }
}
