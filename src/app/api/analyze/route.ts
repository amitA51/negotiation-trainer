import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAnalysisPrompt } from "@/lib/gemini/prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

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
    
    const result = await model.generateContent(prompt);
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
    console.error("Analysis API error:", error);
    
    // Return a default analysis on error
    return NextResponse.json({
      score: 50,
      techniquesUsed: [],
      strengths: ["ניהלת שיחה"],
      improvements: ["נסה להשתמש בטכניקות ספציפיות"],
      recommendations: ["למד על טכניקת השיקוף (Mirroring)"],
      dealSummary: "לא ניתן היה לנתח את השיחה",
    });
  }
}
