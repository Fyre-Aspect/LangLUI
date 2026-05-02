export interface DemoWord {
  id: string;
  original: string;
  translation: string;
  lang: "ES" | "FR" | "DE" | "JA";
  contextSentence: string;
}

export const DEMO_WORDS_BY_LANG: Record<string, Record<string, DemoWord>> = {
  ES: {
    important: {
      id: "w1",
      original: "important",
      translation: "importante",
      lang: "ES",
      contextSentence: "...an important discovery...",
    },
    research: {
      id: "w2",
      original: "research",
      translation: "investigación",
      lang: "ES",
      contextSentence: "...new research suggests...",
    },
    discovered: {
      id: "w3",
      original: "discovered",
      translation: "descubrieron",
      lang: "ES",
      contextSentence: "...scientists discovered...",
    },
    learning: {
      id: "w4",
      original: "learning",
      translation: "aprendizaje",
      lang: "ES",
      contextSentence: "...accelerate learning...",
    },
    language: {
      id: "w5",
      original: "language",
      translation: "idioma",
      lang: "ES",
      contextSentence: "...mastering a language...",
    },
    daily: {
      id: "w6",
      original: "daily",
      translation: "diario",
      lang: "ES",
      contextSentence: "...in daily life...",
    },
  },
  FR: {
    important: {
      id: "w1",
      original: "important",
      translation: "important",
      lang: "FR",
      contextSentence: "...une découverte importante...",
    },
    research: {
      id: "w2",
      original: "research",
      translation: "recherche",
      lang: "FR",
      contextSentence: "...la nouvelle recherche suggère...",
    },
    discovered: {
      id: "w3",
      original: "discovered",
      translation: "découvert",
      lang: "FR",
      contextSentence: "...les scientifiques ont découvert...",
    },
    learning: {
      id: "w4",
      original: "learning",
      translation: "apprentissage",
      lang: "FR",
      contextSentence: "...accélérer l'apprentissage...",
    },
    language: {
      id: "w5",
      original: "language",
      translation: "langue",
      lang: "FR",
      contextSentence: "...maîtriser une langue...",
    },
    daily: {
      id: "w6",
      original: "daily",
      translation: "quotidien",
      lang: "FR",
      contextSentence: "...dans la vie quotidienne...",
    },
  },
  DE: {
    important: {
      id: "w1",
      original: "important",
      translation: "wichtig",
      lang: "DE",
      contextSentence: "...eine wichtige Entdeckung...",
    },
    research: {
      id: "w2",
      original: "research",
      translation: "Forschung",
      lang: "DE",
      contextSentence: "...neue Forschung deutet darauf hin...",
    },
    discovered: {
      id: "w3",
      original: "discovered",
      translation: "entdeckt",
      lang: "DE",
      contextSentence: "...Wissenschaftler haben entdeckt...",
    },
    learning: {
      id: "w4",
      original: "learning",
      translation: "Lernen",
      lang: "DE",
      contextSentence: "...das Lernen beschleunigen...",
    },
    language: {
      id: "w5",
      original: "language",
      translation: "Sprache",
      lang: "DE",
      contextSentence: "...eine Sprache beherrschen...",
    },
    daily: {
      id: "w6",
      original: "daily",
      translation: "täglich",
      lang: "DE",
      contextSentence: "...im täglichen Leben...",
    },
  },
  JA: {
    important: {
      id: "w1",
      original: "important",
      translation: "重要な",
      lang: "JA",
      contextSentence: "...重要な発見...",
    },
    research: {
      id: "w2",
      original: "research",
      translation: "研究",
      lang: "JA",
      contextSentence: "...新しい研究は示唆している...",
    },
    discovered: {
      id: "w3",
      original: "discovered",
      translation: "発見した",
      lang: "JA",
      contextSentence: "...科学者は発見した...",
    },
    learning: {
      id: "w4",
      original: "learning",
      translation: "学習",
      lang: "JA",
      contextSentence: "...学習を加速する...",
    },
    language: {
      id: "w5",
      original: "language",
      translation: "言語",
      lang: "JA",
      contextSentence: "...言語を習得する...",
    },
    daily: {
      id: "w6",
      original: "daily",
      translation: "毎日",
      lang: "JA",
      contextSentence: "...日常生活の中で...",
    },
  },
};

export type Token =
  | { type: "text"; value: string }
  | { type: "word"; word: DemoWord; displayText: string };

const ARTICLE_BODY = `New research from the University of Barcelona suggests that learning vocabulary
in context is far more important than traditional flashcard methods. Scientists
discovered that when people encounter words in their daily reading, the brain
forms deeper connections. This approach to language learning, called contextual
immersion, shows remarkable results across every language studied. The key
insight: you don't need to stop your daily browsing to study. Just browse.`;

export function tokenizeArticle(lang: string = "ES"): Token[] {
  const words = ARTICLE_BODY.split(/\s+/);
  const tokens: Token[] = [];
  const langWords = DEMO_WORDS_BY_LANG[lang] || DEMO_WORDS_BY_LANG.ES;

  words.forEach((word) => {
    const cleanWord = word.replace(/[.,;:!?()]/g, "").toLowerCase();
    const demoWord = langWords[cleanWord];

    if (demoWord) {
      tokens.push({
        type: "word",
        word: demoWord,
        displayText: word,
      });
    } else {
      const lastToken = tokens[tokens.length - 1];
      if (lastToken && lastToken.type === "text") {
        lastToken.value += " " + word;
      } else {
        tokens.push({ type: "text", value: word });
      }
    }
  });

  return tokens;
}

export const DEMO_ARTICLE = {
  title: "Scientists Discovered a Surprising Secret to Language Learning",
  getTokens: (lang: string = "ES") => tokenizeArticle(lang),
};
