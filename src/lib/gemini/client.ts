import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

export const geminiModelPro = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

// Chat session type
export type GeminiChat = ReturnType<typeof geminiModel.startChat>;

// Start a new chat session
export function startChat(history: { role: "user" | "model"; parts: { text: string }[] }[] = []): GeminiChat {
  return geminiModel.startChat({
    history,
    generationConfig: {
      temperature: 0.9,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048,
    },
  });
}

// Send message and get response
export async function sendMessage(chat: GeminiChat, message: string): Promise<string> {
  const result = await chat.sendMessage(message);
  const response = await result.response;
  return response.text();
}

// Single prompt (no chat history)
export async function generateContent(prompt: string, usePro: boolean = false): Promise<string> {
  const model = usePro ? geminiModelPro : geminiModel;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// Generate with JSON response
export async function generateJSON<T>(prompt: string, usePro: boolean = false): Promise<T> {
  const fullPrompt = `${prompt}

חשוב מאוד: החזר תשובה בפורמט JSON בלבד, בלי טקסט נוסף לפני או אחרי.`;
  
  const text = await generateContent(fullPrompt, usePro);
  
  // Try to extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in response");
  }
  
  return JSON.parse(jsonMatch[0]) as T;
}
