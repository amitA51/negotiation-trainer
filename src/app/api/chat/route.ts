import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getTrainingSystemPrompt, getConsultationSystemPrompt, getSimulationSystemPrompt } from "@/lib/gemini/prompts";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      history = [],
      mode = "training",
      scenario,
      difficulty = 3,
      situation,
      recommendedStrategy,
    } = body;

    // Build system prompt based on mode
    let systemPrompt = "";
    
    if (mode === "training" && scenario) {
      systemPrompt = getTrainingSystemPrompt(
        scenario.description,
        scenario.aiRole,
        scenario.userRole,
        scenario.goal,
        difficulty
      );
    } else if (mode === "consultation") {
      systemPrompt = getConsultationSystemPrompt();
    } else if (mode === "simulation" && situation) {
      systemPrompt = getSimulationSystemPrompt(
        situation,
        recommendedStrategy || "",
        difficulty
      );
    } else {
      return NextResponse.json(
        { error: "Invalid mode or missing parameters" },
        { status: 400 }
      );
    }

    // Convert history to Gemini format
    const geminiHistory = history.map((msg: { role: string; content: string }) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Start chat with system prompt as first message if no history
    const chat = model.startChat({
      history: geminiHistory.length > 0 
        ? geminiHistory 
        : [{ role: "user", parts: [{ text: systemPrompt }] }],
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      },
    });

    // If this is the first message and we have history, we already have the system prompt
    // If no history, the system prompt was the first message, so send "התחל" to start
    if (geminiHistory.length === 0) {
      // First interaction - AI should start the conversation
      const startResult = await withRetry(
        () => withTimeout(chat.sendMessage("התחל את השיחה"), 30000),
        3
      );
      const startResponse = await startResult.response;
      return NextResponse.json({
        message: startResponse.text(),
        isStart: true,
      });
    }

    // Send the user's message with timeout and retry
    const result = await withRetry(
      () => withTimeout(chat.sendMessage(message), 30000),
      3
    );
    const response = await result.response;
    const responseText = response.text();

    // Check if conversation should end
    const isComplete = message.toLowerCase().includes("סיום") || 
                      message.toLowerCase().includes("סיים") ||
                      message.toLowerCase().includes("תודה, סיימנו");

    return NextResponse.json({
      message: responseText,
      isComplete,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Return user-friendly error messages
    if (errorMessage.includes("timeout")) {
      return NextResponse.json(
        { error: "הבקשה נמשכה יותר מדי זמן. נסה שוב." },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { error: "שגיאה בעיבוד ההודעה. נסה שוב." },
      { status: 500 }
    );
  }
}
