import { COMMON_TRANSLATIONS } from '../utils/wordSelector';

declare const GEMINI_API_KEY: string;

const FLASH = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
const PRO   = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-05-06:generateContent?key=${GEMINI_API_KEY}`;

const LANG_NAMES: Record<string, string> = {
  ja:'Japanese', es:'Spanish', fr:'French',  de:'German',
  ko:'Korean',   pt:'Portuguese', it:'Italian', zh:'Chinese',
  ar:'Arabic',   hi:'Hindi',
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
  const prompt   = `Translate to ${langName}. Reply ONLY with minified JSON {"word":"translation"}. No spaces. No newlines. No markdown. Words:${JSON.stringify(uncached)}`;

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

    const data  = await resp.json();
    const raw   = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const clean = raw.replace(/```[a-z]*\n?/gi, '').trim();

    let parsed: Record<string, string>;
    try { parsed = JSON.parse(clean); }
    catch { console.error('[LangLua] JSON parse fail:', clean); return result; }

    // Merge into result + batch-write to chrome.storage.local
    const toStore: Record<string, { v: string; ts: number }> = {};
    for (const [w, t] of Object.entries(parsed)) {
      if (typeof t === 'string' && t) {
        const lower = w.toLowerCase();
        result[lower] = t;
        toStore[`t__${lower}__${lang}`] = { v: t, ts: Date.now() };
      }
    }
    if (Object.keys(toStore).length) chrome.storage.local.set(toStore);

  } catch (err) {
    console.error('[LangLua] Network error (Flash):', err);
  }

  return result;
}

// ── CONTEXTUAL DEFINITION (Pro — situational accuracy) ────────────────────────
// Cached in-memory per session so repeated clicks cost nothing
const defCache = new Map<string, string>();

export async function getDefinition(word: string, context: string): Promise<string> {
  const key = `${word}__${context.slice(0, 30)}`;
  if (defCache.has(key)) return defCache.get(key)!;

  const ctx    = context ? `Context: "${context}"\n` : '';
  const prompt = `${ctx}Define "${word}" as used above. One sentence. Plain text only.`;

  try {
    const resp = await fetch(PRO, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 100 },
      }),
    });
    const data = await resp.json();
    const def  = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? 'Definition unavailable.';
    defCache.set(key, def);
    return def;
  } catch {
    return 'Definition unavailable.';
  }
}

// ── GUESS VALIDATION (Flash — simple yes/no, cheap) ───────────────────────────
export async function checkGuess(word: string, guess: string): Promise<boolean> {
  const prompt = `Is "${guess}" an acceptable translation or meaning of the word "${word}"? Partial or approximate is fine. Reply ONLY yes or no.`;
  try {
    const resp = await fetch(FLASH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 5 },
      }),
    });
    const data = await resp.json();
    const ans  = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase() ?? 'no';
    return ans.startsWith('yes');
  } catch {
    return false;
  }
}
