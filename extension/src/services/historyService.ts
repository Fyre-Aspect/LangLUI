export type HistoryEntry = {
  word: string;
  translation: string;
  lang: string;
  difficulty: 'easy' | 'medium' | 'hard';
  seenAt: number;
};

const historyKey = (lang: string) => `history_${lang}`;

export async function addWordHistory(
  word: string,
  translation: string,
  lang: string,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<HistoryEntry[]> {
  const key = historyKey(lang);
  const stored = await new Promise<Record<string, HistoryEntry[]>>(resolve =>
    chrome.storage.local.get([key], resolve as any)
  );
  const history = stored[key] || [];
  const normalizedWord = word.trim().toLowerCase();
  const entry: HistoryEntry = {
    word: word.trim(),
    translation: translation.trim(),
    lang,
    difficulty,
    seenAt: Date.now(),
  };

  const existingIndex = history.findIndex(item => item.word.toLowerCase() === normalizedWord);
  if (existingIndex >= 0) {
    history[existingIndex] = { ...history[existingIndex], ...entry };
  } else {
    history.unshift(entry);
  }

  const updatedHistory = history.slice(0, 250);
  await chrome.storage.local.set({ [key]: updatedHistory });
  return updatedHistory;
}

export async function getWordHistory(lang: string): Promise<HistoryEntry[]> {
  const key = historyKey(lang);
  const stored = await new Promise<Record<string, HistoryEntry[]>>(resolve =>
    chrome.storage.local.get([key], resolve as any)
  );
  return stored[key] || [];
}

export async function clearWordHistory(lang: string): Promise<void> {
  await chrome.storage.local.remove(historyKey(lang));
}
