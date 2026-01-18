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

/** Get model by name */
function getModel(modelName: AIModel = "gemini-2.5-flash") {
  return genAI.getGenerativeModel({ model: modelName });
}

/** Check if request prefers streaming response */
function prefersStreaming(request: NextRequest): boolean {
  const acceptHeader = request.headers.get('accept') || '';
  return acceptHeader.includes('text/event-stream');
}

/** Create a streaming response from Gemini */
async function createStreamingResponse(
  chat: ReturnType<ReturnType<typeof genAI.getGenerativeModel>['startChat']>,
  message: string
): Promise<Response> {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await chat.sendMessageStream(message);
        
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            // SSE format
            const data = `data: ${JSON.stringify({ text, done: false })}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
        }
        
        // Send completion signal
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: '', done: true })}\n\n`));
        controller.close();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Stream error';
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage, done: true })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const useStreaming = prefersStreaming(request);
  
  try {
    // Rate Limiting - 20 requests per minute per IP
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

    // Validate Request Body
    const validatedData = await validateRequest(validationRequest, ChatRequestSchema);
    
    const {
      message,
      history = [],
      mode = "training",
      difficulty = 3,
      model: modelName = "gemini-2.5-flash",
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

    // First interaction - AI should start the conversation
    if (geminiHistory.length === 0 || !message) {
      if (useStreaming) {
        return createStreamingResponse(chat, "התחל את השיחה");
      }
      
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

    // Streaming response
    if (useStreaming) {
      return createStreamingResponse(chat, message);
    }

    // Non-streaming response (default)
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
