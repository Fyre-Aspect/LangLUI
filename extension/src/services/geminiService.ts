import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const translateWord = async (word: string, targetLanguage: string): Promise<string> => {
  const prompt = `Translate '${word}' to ${targetLanguage}. Reply with ONLY the word.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text?.trim() || word;
};

export const translateTextChunk = async (text: string, targetLanguage: string): Promise<Record<string, string>> => {
  const prompt = `JSON translation of these words to ${targetLanguage}: ${text}`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  try {
    return JSON.parse(response.text?.trim() || "{}");
  } catch {
    return {};
  }
};

export const checkGuess = async (word: string, guess: string): Promise<boolean> => {
  const prompt = `Is '${guess}' a correct meaning for '${word}'? YES/NO only.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim().toUpperCase().includes('YES') ?? false;
  } catch {
    return false;
  }
};

export const getDefinition = async (word: string): Promise<string> => {
  const prompt = `Short definition of '${word}':`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || 'No definition found.';
  } catch {
    return 'Error.';
  }
};