import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getTrainingSystemPrompt, getConsultationSystemPrompt, getSimulationSystemPrompt } from "@/lib/gemini/prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    let messageToSend = message;
    if (geminiHistory.length === 0) {
      // First interaction - AI should start the conversation
      const startResult = await chat.sendMessage("התחל את השיחה");
      const startResponse = await startResult.response;
      return NextResponse.json({
        message: startResponse.text(),
        isStart: true,
      });
    }

    // Send the user's message
    const result = await chat.sendMessage(messageToSend);
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
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
