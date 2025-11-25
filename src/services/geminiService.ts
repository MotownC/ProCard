import { GoogleGenAI } from "@google/genai";
import { PlayerDetails } from "../types";

// UPDATED: Use process.env.API_KEY as per @google/genai guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePlayerBio = async (details: Omit<PlayerDetails, 'bio'>): Promise<string> => {
  try {
    const prompt = `
      Write a high-energy, exciting, short bio for a youth sports trading card. 
      Player Name: ${details.name}
      Team: ${details.team}
      Position: ${details.position}
      Sport: ${details.sport}
      Jersey Number: ${details.number}

      Rules:
      1. Keep it under 40 words.
      2. Make it sound legendary and inspiring.
      3. Use words like "unstoppable", "precision", "defense", "power".
      4. Do NOT use hashtags.
      5. Return ONLY the bio text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate bio.";
  } catch (error) {
    console.error("Error generating bio:", error);
    return "Legend in the making.";
  }
};

export const analyzeRoadmap = async (): Promise<string> => {
  const prompt = `
    I am building a business creating custom youth sports cards (photoshopping kids into pro-style cards).
    Provide 3 concise bullet points on potential technical or business roadblocks I should look out for.
    Focus on image quality, printing, and licensing.
  `;
  
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text || "";
  } catch (e) {
    return "";
  }
}