import { getWordHistory, HistoryEntry } from './historyService';

export type QuizQuestion = {
  word: string;
  translation: string;
  options: string[];
};

const shuffle = <T>(items: T[]) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export async function generateDailyQuiz(lang: string, count: number = 5): Promise<QuizQuestion[]> {
  const history = await getWordHistory(lang);
  const pool = [...history].slice(0, 200);
  if (!pool.length) return [];

  const questions: QuizQuestion[] = [];
  const source = shuffle(pool);

  for (const entry of source) {
    if (questions.length >= count) break;
    const otherTranslations = pool
      .filter(item => item.word !== entry.word)
      .map(item => item.translation)
      .filter(Boolean);

    const options = shuffle([
      entry.translation,
      ...otherTranslations.slice(0, 3),
    ]).slice(0, 4);

    if (!options.includes(entry.translation)) {
      options[options.length - 1] = entry.translation;
    }

    questions.push({
      word: entry.word,
      translation: entry.translation,
      options: shuffle(options),
    });
  }

  return questions;
}
