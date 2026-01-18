import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAnalysisPrompt } from "@/lib/gemini/prompts";
import { AnalyzeRequestSchema, type AnalyzeRequest } from "@/lib/validation/schemas";
import { checkRateLimit, handleAPIError, withTimeout, withRetry } from "@/lib/utils/api-helpers";
import type { AIModel } from "@/types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/** Get Gemini model by name - defaults to Pro for analysis */
function getModel(modelName: AIModel = "gemini-1.5-pro") {
  return genAI.getGenerativeModel({ model: modelName });
}

/** Default analysis for fallback scenarios */
const DEFAULT_ANALYSIS = {
  score: 50,
  techniquesUsed: [],
  strengths: ["ניהלת שיחה"],
  improvements: ["נסה להשתמש בטכניקות ספציפיות"],
  recommendations: ["למד על טכניקת השיקוף (Mirroring)"],
  dealSummary: "לא ניתן היה לנתח את השיחה",
};

/**
 * POST /api/analyze
 * Analyzes a negotiation session and provides feedback
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting - 10 requests per minute
    const rateLimitResponse = await checkRateLimit(request, {
      uniqueTokenPerInterval: 10,
      interval: 60000,
    });
    if (rateLimitResponse) return rateLimitResponse;

    // 2. Parse and validate request body
    let validatedBody: AnalyzeRequest;
    try {
      const body = await request.json();
      validatedBody = AnalyzeRequestSchema.parse(body);
    } catch (error) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          message: error instanceof Error ? error.message : "Invalid request body" 
        },
        { status: 400 }
      );
    }

    const { messages, userGoal, difficulty, model: modelName } = validatedBody;

    // 3. Get the appropriate model
    const model = getModel(modelName ?? "gemini-1.5-pro");

    // 4. Check minimum messages
    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages to analyze" },
        { status: 400 }
      );
    }

    // 5. Format conversation for analysis
    const conversation = messages
      .filter((m) => m.role !== "system")
      .map((m) => `${m.role === "user" ? "משתמש" : "יריב"}: ${m.content}`)
      .join("\n");

    const prompt = getAnalysisPrompt(conversation, userGoal ?? "לנהל משא ומתן מוצלח", difficulty ?? 3);

    // 6. Call Gemini with timeout and retry
    const result = await withRetry(
      () => withTimeout(model.generateContent(prompt), 60000, "Analysis request timed out"),
      { maxAttempts: 3, initialDelay: 1000 }
    );
    
    const response = await result.response;
    const text = response.text();

    // 7. Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // 8. Validate and normalize the response
    const normalizedAnalysis = {
      score: Math.max(0, Math.min(100, analysis.score || 0)),
      techniquesUsed: Array.isArray(analysis.techniquesUsed) ? analysis.techniquesUsed : [],
      strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
      improvements: Array.isArray(analysis.improvements) ? analysis.improvements : [],
      recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
      dealSummary: typeof analysis.dealSummary === 'string' ? analysis.dealSummary : "לא הושגה עסקה",
    };

    return NextResponse.json(normalizedAnalysis);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Return timeout-specific message
    if (errorMessage.includes("timeout") || errorMessage.includes("timed out")) {
      return NextResponse.json({
        ...DEFAULT_ANALYSIS,
        dealSummary: "הניתוח נמשך יותר מדי זמן. נסה שוב מאוחר יותר.",
      });
    }

    // Log and return handled error
    console.error("[/api/analyze] Error:", errorMessage);
    return handleAPIError(error);
  }
}
