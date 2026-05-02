import { GoogleGenAI } from '@google/genai';

export const translateWords = async (words: string[], targetLanguage: string): Promise<Record<string, string>> => {
  if (words.length === 0) return {};

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const prompt = `Translate the following English words into ${targetLanguage}. Return ONLY a valid JSON object with no markdown or explanation. Format: { "word": "translation" }. Words: ${JSON.stringify(words)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let resultText = response.text || "{}";
    resultText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(resultText);
  } catch (error) {
    console.error("Translation error", error);
    return {};
  }
};
