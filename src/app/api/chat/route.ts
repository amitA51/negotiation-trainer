import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getTrainingSystemPrompt, getConsultationSystemPrompt, getSimulationSystemPrompt } from "@/lib/gemini/prompts";
import type { AIModel } from "@/types";
import { ChatRequestSchema, validateRequest } from "@/lib/validation/schemas";
import { 
  withTimeout, 
  withRetry, 
  checkRateLimit, 
  handleAPIError,
  logAPICall,
  getClientIP 
} from "@/lib/utils/api-helpers";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Get model by name
function getModel(modelName: AIModel = "gemini-2.5-flash") {
  return genAI.getGenerativeModel({ model: modelName });
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 🛡️ Rate Limiting - 20 requests per minute per IP
    const rateLimitResponse = await checkRateLimit(request, {
      uniqueTokenPerInterval: 20,
      interval: 60000, // 1 minute
    });

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Get raw body first (before validation consumes it)
    const rawBody = await request.json();
    
    // Create a new request with the raw body for validation
    const validationRequest = {
      json: async () => rawBody,
    } as Request;

    // 🛡️ Validate Request Body
    const validatedData = await validateRequest(validationRequest, ChatRequestSchema);
    
    const {
      message,
      history = [],
      mode = "training",
      difficulty = 3,
      model: modelName = "gemini-2.5-flash",
      scenarioId,
    } = validatedData;

    const model = getModel(modelName as AIModel);

    // Build system prompt based on mode
    let systemPrompt = "";
    
    // Get additional fields from raw body (for backward compatibility)
    const scenario = rawBody.scenario;
    const situation = rawBody.situation;
    const recommendedStrategy = rawBody.recommendedStrategy;

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
    const geminiHistory = history.map((msg) => ({
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
    if (geminiHistory.length === 0 || !message) {
      // First interaction - AI should start the conversation
      const startResult = await withRetry(
        () => withTimeout(chat.sendMessage("התחל את השיחה"), 30000),
        { maxAttempts: 3, initialDelay: 1000 }
      );
      const startResponse = await startResult.response;
      
      const duration = Date.now() - startTime;
      logAPICall("/api/chat", "POST", duration, 200);
      
      return NextResponse.json({
        message: startResponse.text(),
        isStart: true,
      });
    }

    // Send the user's message with timeout and retry
    const result = await withRetry(
      () => withTimeout(chat.sendMessage(message), 30000),
      { maxAttempts: 3, initialDelay: 1000 }
    );
    const response = await result.response;
    const responseText = response.text();

    // Check if conversation should end
    const isComplete = message.toLowerCase().includes("סיום") ||
      message.toLowerCase().includes("סיים") ||
      message.toLowerCase().includes("תודה, סיימנו");

    const duration = Date.now() - startTime;
    logAPICall("/api/chat", "POST", duration, 200);

    return NextResponse.json({
      message: responseText,
      isComplete,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logAPICall("/api/chat", "POST", duration, 500);
    
    console.error("[Chat API Error]", {
      error,
      ip: getClientIP(request),
      timestamp: new Date().toISOString(),
    });
    
    return handleAPIError(error);
  }
}
