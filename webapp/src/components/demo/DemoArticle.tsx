"use client";

import { DEMO_ARTICLE } from "@/lib/demoWords";
import { HighlightedWord } from "./HighlightedWord";

interface DemoArticleProps {
  savedWords: Set<string>;
  onSaveRequest: (wordId: string) => void;
  language: string;
}

export function DemoArticle({
  savedWords,
  onSaveRequest,
  language,
}: DemoArticleProps) {
  const tokens = DEMO_ARTICLE.getTokens(language);

  return (
    <article className="prose prose-sm max-w-none">
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 text-balance leading-snug">
        {DEMO_ARTICLE.title}
      </h2>

      <p className="text-base leading-relaxed text-slate-700 mb-6">
        {tokens.map((token, idx) => {
          if (token.type === "text") {
            return (
              <span key={idx} className="text-slate-700">
                {token.value}
              </span>
            );
          } else {
            return (
              <HighlightedWord
                key={token.word.id}
                word={token.word}
                displayText={token.displayText}
                isSaved={savedWords.has(token.word.id)}
                onSaveClick={() => onSaveRequest(token.word.id)}
              />
            );
          }
        })}
      </p>

      <p className="text-xs text-slate-500 mt-6 pt-6 border-t border-slate-200">
        <span className="langlua-word-demo inline-block mr-2">-</span>
        <span className="text-slate-600">Highlighted words are translated</span>
        <span className="mx-3 text-slate-400">.</span>
        <span className="text-slate-600">Hover to see the original and save</span>
      </p>
    </article>
  );
}
