import { getWordHistory } from './historyService';

export type WordStats = {
  totalWords: number;
  easy: number;
  medium: number;
  hard: number;
  lastSeen: number | null;
};

export async function getWordStatistics(lang: string): Promise<WordStats> {
  const history = await getWordHistory(lang);
  const now = Date.now();

  const stats = history.reduce(
    (acc, entry) => {
      acc.totalWords += 1;
      if (entry.difficulty === 'easy') acc.easy += 1;
      else if (entry.difficulty === 'medium') acc.medium += 1;
      else acc.hard += 1;
      if (!acc.lastSeen || entry.seenAt > acc.lastSeen) {
        acc.lastSeen = entry.seenAt;
      }
      return acc;
    },
    { totalWords: 0, easy: 0, medium: 0, hard: 0, lastSeen: null } as WordStats
  );

  // Make sure lastSeen is consistently rounded for UI display.
  return stats;
}
