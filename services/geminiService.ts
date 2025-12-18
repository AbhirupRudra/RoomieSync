
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserProfile } from "../types";

const ai = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

export const getCompatibilityInsight = async (userA: UserProfile, userB: UserProfile): Promise<string> => {
  if (!process.env.API_KEY) return "AI insights unavailable.";

  const prompt = `
    Analyze roommate compatibility:
    ${userA.name} (Gender: ${userA.gender}, Bio: ${userA.bio})
    vs 
    ${userB.name} (Gender: ${userB.gender}, Bio: ${userB.bio})
    
    Provide 2 sentences on synergy or potential conflict.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No insight available.";
  } catch (error) {
    return "Compatibility analysis skipped.";
  }
};
