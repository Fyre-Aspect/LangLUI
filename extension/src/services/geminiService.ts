import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export const translateWord = async (word: string, targetLanguage: string): Promise<string> => {
  const prompt = `Translate the English word '${word}' to ${targetLanguage}. Reply with ONLY the translated word, nothing else. No punctuation, no explanation.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text?.trim() || word;
};

export const translateTextChunk = async (text: string, targetLanguage: string): Promise<Record<string, string>> => {
  const prompt = `Translate each of the following English words to ${targetLanguage}. 
Return ONLY a JSON object where keys are the original English words and values are the translations.
No explanation, no markdown, no extra text.

Words: ${text}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  try {
    const raw = response.text?.trim() || "{}";
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

export const checkGuess = async (word: string, guess: string): Promise<boolean> => {
  const prompt = `The user guessed that the meaning of the word '${word}' is '${guess}'. Is this correct? Reply with ONLY 'YES' or 'NO'.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim().toUpperCase() === 'YES';
  } catch {
    return false;
  }
};

export const getDefinition = async (word: string): Promise<string> => {
  const prompt = `Define the word '${word}' in one short, clear sentence.`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || 'Definition not found.';
  } catch {
    return 'Failed to fetch definition.';
  }
};