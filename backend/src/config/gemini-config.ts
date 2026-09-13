import { GoogleGenAI } from "@google/genai";

export const configureGemini = () => {
  const config = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  return config;
};