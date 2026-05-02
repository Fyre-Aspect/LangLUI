"use client";

import { motion } from "framer-motion";
import { DemoWord } from "@/lib/demoWords";

interface WordTooltipProps {
  word: DemoWord;
  isSaved: boolean;
  onSaveClick: () => void;
}

export function WordTooltip({
  word,
  isSaved,
  onSaveClick,
}: WordTooltipProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-40 bg-white/95 backdrop-blur-md border border-slate-200 rounded-tooltip p-4 w-[280px] shadow-tooltip pointer-events-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-1.5 flex-wrap mb-2">
        <span className="text-xs text-slate-400 font-medium">
          {word.original}
        </span>
        <span className="text-xs text-slate-400">→</span>
        <span className="text-sm font-bold text-primary-DEFAULT">
          {word.translation}
        </span>
        <span className="ml-auto text-[10px] font-semibold text-primary-DEFAULT bg-blue-100 border border-blue-200 rounded px-2 py-0.5">
          {word.lang}
        </span>
      </div>

      {/* Context */}
      <p className="text-[11px] text-slate-500 italic mb-2 line-clamp-2">
        {word.contextSentence}
      </p>

      <hr className="border-slate-200 my-2" />

      {/* Save Button */}
      <button
        onClick={onSaveClick}
        disabled={isSaved}
        className={`w-full py-2 px-0 text-center text-xs font-semibold rounded-lg transition-all ${
          isSaved
            ? "text-green-600 cursor-default"
            : "text-primary-DEFAULT hover:bg-blue-50 cursor-pointer"
        }`}
      >
        {isSaved ? "Saved" : "Save Word"}
      </button>
    </motion.div>
  );
}
