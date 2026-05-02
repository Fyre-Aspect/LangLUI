"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { WordTooltip } from "./WordTooltip";
import { DemoWord } from "@/lib/demoWords";

interface HighlightedWordProps {
  word: DemoWord;
  isSaved: boolean;
  onSaveClick: () => void;
  displayText: string;
}

export function HighlightedWord({
  word,
  isSaved,
  onSaveClick,
  displayText,
}: HighlightedWordProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className="langlua-word-demo relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {displayText}
      <AnimatePresence>
        {isHovered && (
          <WordTooltip
            word={word}
            isSaved={isSaved}
            onSaveClick={() => {
              onSaveClick();
              setIsHovered(false);
            }}
          />
        )}
      </AnimatePresence>
    </span>
  );
}
