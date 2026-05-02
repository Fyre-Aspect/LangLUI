import { COMMON_TRANSLATIONS } from '../utils/wordSelector';

declare const GEMINI_API_KEY: string;

const FLASH = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
const PRO = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-05-06:generateContent?key=${GEMINI_API_KEY}`;

const LANG_NAMES: Record<string, string> = {
  ja: 'Japanese', es: 'Spanish', fr: 'French', de: 'German',
  ko: 'Korean', pt: 'Portuguese', it: 'Italian', zh: 'Chinese',
  ar: 'Arabic', hi: 'Hindi',
};

// Per-word persistent cache — key: `t__${word}__${lang}`, value: translation string
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ── BULK TRANSLATION (Flash — cheap + fast) ───────────────────────────────────
export async function translateWords(
  words: string[], lang: string
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  if (!words.length) return result;

  // 1. Local COMMON_TRANSLATIONS dict — zero API cost
  const afterCommon: string[] = [];
  for (const w of words) {
    const hit = COMMON_TRANSLATIONS[w.toLowerCase()]?.[lang];
    if (hit) { result[w] = hit; }
    else { afterCommon.push(w); }
  }

  if (!afterCommon.length) return result;

  // 2. Batch read from chrome.storage.local — ONE call for all words
  const keys = afterCommon.map(w => `t__${w}__${lang}`);
  const cached: Record<string, { v: string; ts: number }> = await new Promise(res =>
    chrome.storage.local.get(keys, res as any)
  );

  const uncached: string[] = [];
  for (const w of afterCommon) {
    const entry = cached[`t__${w}__${lang}`];
    if (entry?.v && Date.now() - entry.ts < CACHE_TTL_MS) {
      result[w] = entry.v;
    } else {
      uncached.push(w);
    }
  }

  if (!uncached.length) return result;

  // 3. Call Gemini Flash for uncached words — token-minimal prompt
  const langName = LANG_NAMES[lang] ?? lang;
  const prompt = `Translate to ${langName}. Reply ONLY with minified JSON {"word":"translation"}. No spaces. No newlines. No markdown. Words:${JSON.stringify(uncached)}`;

  try {
    const resp = await fetch(FLASH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.05, maxOutputTokens: 512 },
      }),
    });

    if (!resp.ok) {
      console.error('[LangLua] Flash error:', resp.status, await resp.text());
      return result;
    }

    console.log(`[LangLua] Calling Gemini for ${uncached.length} uncached words`);

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const prompt = `Translate to ${targetLanguage} as JSON {word:translation}: ${JSON.stringify(uncached)}`;

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
  }
