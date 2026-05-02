import { COMMON_TRANSLATIONS } from '../utils/wordSelector';

declare const GEMINI_API_KEY: string;
const FLASH = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const LANG_NAMES: Record<string, string> = {
  ja: 'Japanese', es: 'Spanish', fr: 'French', de: 'German',
  ko: 'Korean', pt: 'Portuguese', it: 'Italian', zh: 'Chinese',
  ar: 'Arabic', hi: 'Hindi',
};

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function translateWords(
  words: string[], lang: string
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  if (!words.length) return result;

  // 1. Local COMMON_TRANSLATIONS dict
  const afterCommon: string[] = [];
  for (const w of words) {
    const lower = w.toLowerCase();
    const hit = COMMON_TRANSLATIONS[lower]?.[lang];
    if (hit) { result[lower] = hit; }
    else { afterCommon.push(w); }
  }

  if (!afterCommon.length) return result;

  // 2. Batch read from chrome.storage.local
  const keys = afterCommon.map(w => `t__${w.toLowerCase()}__${lang}`);
  const cached: Record<string, { v: string; ts: number }> = await new Promise(res =>
    chrome.storage.local.get(keys, res as any)
  );

  const uncached: string[] = [];
  for (const w of afterCommon) {
    const lower = w.toLowerCase();
    const entry = cached[`t__${lower}__${lang}`];
    if (entry?.v && Date.now() - entry.ts < CACHE_TTL_MS) {
      result[lower] = entry.v;
    } else {
      uncached.push(w);
    }
  }

  if (!uncached.length) return result;

  // 3. Process uncached words using Google Translate Unofficial API
  console.log(`[LangLua] Translating ${uncached.length} words via Google Translate...`);
  
  // We join words with newlines to translate everything in one or two big requests
  // Google's limit is around 5000 chars per request
  const BATCH_LIMIT = 4000;
  let currentBatch: string[] = [];
  let currentLen = 0;

  const processBatch = async (batch: string[]) => {
    const query = batch.join('\n');
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(query)}`;

    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Google API error: ${resp.status}`);
      
      const data = await resp.json();
      const cacheUpdates: Record<string, any> = {};
      
      // Google returns an array of [translation, original, ...] pairs
      if (data && data[0]) {
        data[0].forEach((item: any) => {
          if (item && item[0] && item[1]) {
            const original = item[1].trim().toLowerCase();
            const translation = item[0].trim();
            result[original] = translation;
            cacheUpdates[`t__${original}__${lang}`] = { v: translation, ts: Date.now() };
          }
        });
      }
      await chrome.storage.local.set(cacheUpdates);
    } catch (e) {
      console.error('[LangLua] Google Translate Batch Error:', e);
    }
  };

  for (const word of uncached) {
    if (currentLen + word.length + 1 > BATCH_LIMIT) {
      await processBatch(currentBatch);
      currentBatch = [];
      currentLen = 0;
    }
    currentBatch.push(word);
    currentLen += word.length + 1;
  }

  if (currentBatch.length > 0) {
    await processBatch(currentBatch);
  }

  return result;
}

export async function checkGuess(original: string, guess: string, lang?: string, expected?: string): Promise<boolean> {
  const lowerOriginal = original.toLowerCase().trim();
  const lowerGuess = guess.toLowerCase().trim();
  const lowerExpected = expected?.toLowerCase().trim();

  // 1. If guess matches the English word (for tooltip mode), it's correct
  if (lowerGuess === lowerOriginal) return true;
  
  // 2. If guess matches the known translation, it's correct
  if (lowerExpected && lowerGuess === lowerExpected) return true;

  // 3. Fallback to Gemini for synonyms or different forms
  const langName = lang ? (LANG_NAMES[lang] || lang) : 'the target language';
  const prompt = `The target word is "${original}" (English) which translates to "${expected || 'unknown'}" in ${langName}. The user guessed "${guess}". Is this guess a correct translation in ${langName}, or a valid synonym/meaning in English for "${original}"? Reply ONLY "YES" or "NO".`;
  
  try {
    const resp = await fetch(FLASH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 10 },
      }),
    });
    const data = await resp.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase() || '';
    console.log(`[LangLua] checkGuess for "${original}": guess="${guess}", expected="${expected}", result="${text}"`);
    return text.includes('YES');
  } catch (error) {
    console.error('[LangLua] checkGuess error:', error);
    return false;
  }
}

export async function getDefinition(original: string, context?: string): Promise<string> {
  return `Definition for "${original}" (Translation mode only).`;
}
