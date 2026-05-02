import { GoogleGenAI } from '@google/genai';

const CACHE_KEY_PREFIX = 'langlua_trans_';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEntry {
  translations: Record<string, string>;
  timestamp: number;
}

const getCacheKey = (words: string[], lang: string) =>
  `${CACHE_KEY_PREFIX}${lang}_${words.slice().sort().join(',')}`;

const loadFromCache = async (key: string): Promise<Record<string, string> | null> => {
  const result = await chrome.storage.local.get(key) as { [k: string]: CacheEntry };
  const entry = result[key];
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) return null;
  return entry.translations;
};

const saveToCache = async (key: string, translations: Record<string, string>) => {
  await chrome.storage.local.set({ [key]: { translations, timestamp: Date.now() } });
};

export const translateWords = async (words: string[], targetLanguage: string): Promise<Record<string, string>> => {
  if (words.length === 0) return {};

  // Check cache first — split into cached/uncached
  const result: Record<string, string> = {};
  const uncached: string[] = [];

  for (const word of words) {
    const cacheKey = `${CACHE_KEY_PREFIX}${targetLanguage}_${word}`;
    const cached = await chrome.storage.local.get(cacheKey) as { [k: string]: CacheEntry };
    const entry = cached[cacheKey] as any;
    if (entry && entry.t && Date.now() - entry.ts < CACHE_TTL_MS) {
      result[word] = entry.t;
    } else {
      uncached.push(word);
    }
  }

  if (uncached.length === 0) {
    console.log('[LangLua] All translations from cache!');
    return result;
  }

  console.log(`[LangLua] Calling Gemini for ${uncached.length} uncached words`);

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const prompt = `Translate the following English words into ${targetLanguage}. Return ONLY a valid JSON object with no markdown or explanation. Format: { "word": "translation" }. Words: ${JSON.stringify(uncached)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let resultText = response.text || '{}';
    resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(resultText);

    // Save each word to cache individually and merge into result
    const cacheUpdates: Record<string, any> = {};
    for (const key in parsed) {
      const lower = key.toLowerCase();
      const translation = parsed[key];
      result[lower] = translation;
      cacheUpdates[`${CACHE_KEY_PREFIX}${targetLanguage}_${lower}`] = { t: translation, ts: Date.now() };
    }
    await chrome.storage.local.set(cacheUpdates);

    return result;
  } catch (error) {
    console.error('Translation error', error);
    return result; // return whatever we got from cache at least
  }
};
