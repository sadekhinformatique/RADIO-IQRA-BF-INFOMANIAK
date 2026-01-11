
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const askSpiritualCompanion = async (query: string, history: {role: string, parts: {text: string}[]}[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: query }] }
      ],
      config: {
        systemInstruction: "You are the 'Iqra Spiritual Companion'. Your role is to provide insights, translations, and context for Islamic content broadcast on Radio Iqra BF (96.1 MHz in Burkina Faso). Be respectful, knowledgeable, and provide citations where appropriate. Use Google Search to find specific details about the radio station's current schedule or host if asked.",
        tools: [{ googleSearch: {} }],
      },
    });

    return {
      text: response.text || "I'm sorry, I couldn't process that request.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
