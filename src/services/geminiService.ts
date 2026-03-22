import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface PaletteResponse {
  lipstick: string;
  eyeshadow: string[];
  blush: string;
  highlighter: string;
  explanation: string;
}

export async function generatePalette(skinTone: string, occasion: string): Promise<PaletteResponse> {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `Generate a personalized makeup palette for a person with ${skinTone} skin tone for a ${occasion} occasion.`,
    config: {
      systemInstruction: "You are a professional makeup artist AI. Provide expert, beginner-friendly, and aesthetic makeup recommendations. Do not give medical advice. Keep the tone friendly and helpful.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          lipstick: { type: Type.STRING, description: "Lipstick shade recommendation" },
          eyeshadow: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Eyeshadow color combination (2-3 colors)"
          },
          blush: { type: Type.STRING, description: "Blush tone suggestion" },
          highlighter: { type: Type.STRING, description: "Highlighter type" },
          explanation: { type: Type.STRING, description: "A short explanation (2-3 sentences) explaining why these colors work well together." }
        },
        required: ["lipstick", "eyeshadow", "blush", "highlighter", "explanation"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function getChatResponse(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  const chat = ai.chats.create({
    model: "gemini-2.0-flash",
    config: {
      systemInstruction: "You are GlowGuide AI, a professional makeup artist. You help users with makeup tips, product recommendations, and techniques. Keep it friendly, aesthetic, and professional. Do not give medical advice.",
    },
    history: history
  });

  const response = await chat.sendMessage({ message });
  return response.text;
}
