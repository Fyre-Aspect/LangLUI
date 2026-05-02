import { GoogleGenAI } from '@google/genai';

export const getDefinition = async (word: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const prompt = `Define the English word '${word}' in one or two simple sentences. Be concise. No formatting.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });
  
  return response.text?.trim() || "";
};

export const checkGuess = async (word: string, guess: string): Promise<boolean> => {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const prompt = `Is '${guess}' an acceptable or correct definition of '${word}'? Be lenient — partial understanding counts. Reply with ONLY 'yes' or 'no'.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
  });
  
  const text = response.text?.trim().toLowerCase() || "no";
  return text.includes("yes");
};
