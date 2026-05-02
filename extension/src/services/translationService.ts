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

  // 3. Call Gemini Flash for uncached words
  const langName = LANG_NAMES[lang] ?? lang;
  const prompt = `Translate these English words to ${langName}. Reply ONLY with minified JSON object {"english_word":"translation"}. No markdown, no extra text. Words: ${JSON.stringify(uncached)}`;

  try {
    const resp = await fetch(FLASH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
      }),
    });

    if (!resp.ok) {
      console.error('[LangLua] Flash error:', resp.status, await resp.text());
      return result;
    }

    const data = await resp.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);

    const cacheUpdates: Record<string, any> = {};
    for (const [w, t] of Object.entries(parsed)) {
      const lower = w.toLowerCase();
      const translation = t as string;
      result[lower] = translation;
      cacheUpdates[`t__${lower}__${lang}`] = { v: translation, ts: Date.now() };
    }
    
    await chrome.storage.local.set(cacheUpdates);
    return result;
  } catch (error) {
    console.error('[LangLua] Translation error:', error);
    return result;
  }
}

export async function checkGuess(original: string, guess: string, lang?: string): Promise<boolean> {
  const lowerOriginal = original.toLowerCase().trim();
  const lowerGuess = guess.toLowerCase().trim();
  
  // 1. Simple direct match check (handles English guesses in Normal mode or exact matches)
  if (lowerGuess === lowerOriginal) return true;

  const langName = lang ? (LANG_NAMES[lang] || lang) : 'the target language';
  const prompt = `The target English word is "${original}". The user is learning ${langName} and guessed "${guess}". Is this guess a correct translation in ${langName}, or a valid synonym/meaning in English? Reply ONLY "YES" or "NO".`;
  
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
    return text.includes('YES');
  } catch (error) {
    console.error('[LangLua] checkGuess error:', error);
    return false;
  }
}

export async function getDefinition(original: string, context?: string): Promise<string> {
  const ctxPart = context ? ` used in the sentence: "${context}"` : '';
  const prompt = `Provide a very brief, one-sentence definition for the English word "${original}"${ctxPart}. Do not use markdown. Just the text.`;
  
  try {
    const resp = await fetch(FLASH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 100 },
      }),
    });
    const data = await resp.json();
    let def = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'No definition found.';
    // Clean any markdown backticks if Gemini ignored the instruction
    def = def.replace(/[*_`]/g, '');
    return def;
  } catch (error) {
    console.error('[LangLua] getDefinition error:', error);
    return 'Error loading definition. Please try again.';
  }
}
