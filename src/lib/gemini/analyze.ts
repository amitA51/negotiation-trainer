import { generateJSON } from "./client";
import { getAnalysisPrompt } from "./prompts";
import type { AnalysisResponse, Message } from "@/types";

/**
 * Analyze a completed negotiation session
 */
export async function analyzeSession(
  messages: Message[],
  userGoal: string,
  difficulty: number
): Promise<AnalysisResponse> {
  // Format conversation for analysis
  const conversation = messages
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role === "user" ? "משתמש" : "יריב"}: ${m.content}`)
    .join("\n");

  const prompt = getAnalysisPrompt(conversation, userGoal, difficulty);
  
  try {
    const analysis = await generateJSON<AnalysisResponse>(prompt, true);
    
    // Validate and normalize the response
    return {
      score: Math.max(0, Math.min(100, analysis.score || 0)),
      techniquesUsed: analysis.techniquesUsed || [],
      strengths: analysis.strengths || [],
      improvements: analysis.improvements || [],
      recommendations: analysis.recommendations || [],
      dealSummary: analysis.dealSummary || "לא הושגה עסקה",
    };
  } catch (error) {
    console.error("Error analyzing session:", error);
    
    // Return a default analysis if something goes wrong
    return {
      score: 50,
      techniquesUsed: [],
      strengths: ["ניהלת שיחה"],
      improvements: ["נסה להשתמש בטכניקות ספציפיות"],
      recommendations: ["למד על טכניקת השיקוף (Mirroring)"],
      dealSummary: "לא ניתן היה לנתח את השיחה",
    };
  }
}
