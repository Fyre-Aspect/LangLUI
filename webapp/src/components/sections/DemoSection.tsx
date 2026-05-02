"use client";

import { useState } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FadeUp } from "@/components/ui/FadeUp";
import { DemoArticle } from "@/components/demo/DemoArticle";
import { SaveWordModal } from "@/components/demo/SaveWordModal";
import { DEMO_WORDS_BY_LANG, DemoWord } from "@/lib/demoWords";

const LANGUAGES = [
  { code: "ES", label: "Spanish" },
  { code: "FR", label: "French" },
];

export function DemoSection() {
  const [language, setLanguage] = useState("ES");
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const [modalWord, setModalWord] = useState<DemoWord | null>(null);

  const handleSaveRequest = (wordId: string) => {
    const words = DEMO_WORDS_BY_LANG[language];
    const word = Object.values(words).find((w) => w.id === wordId);
    if (word) {
      setModalWord(word);
    }
  };

  const handleConfirmSave = () => {
    if (modalWord) {
      setSavedWords((prev) => new Set([...prev, modalWord.id]));
    }
  };

  return (
    <section id="demo" className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <FadeUp delay={0}>
          <SectionLabel>See it in action</SectionLabel>
        </FadeUp>

        <FadeUp delay={0.1}>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-12 max-w-2xl">
            Interactive Demo
          </h2>
        </FadeUp>

        {/* Language Selector */}
        <FadeUp delay={0.15}>
          <div className="max-w-3xl mx-auto mb-8 flex gap-2 flex-wrap">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setSavedWords(new Set());
                }}
                className={`px-4 py-2 rounded-pill font-bold text-sm transition-all ${
                  language === lang.code
                    ? "bg-primary-DEFAULT text-slate-900 shadow-md"
                    : "bg-primary-DEFAULT text-slate-900 hover:shadow-md"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </FadeUp>

        {/* Demo Card */}
        <FadeUp delay={0.2}>
          <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-card shadow-card p-8">
            <DemoArticle
              language={language}
              savedWords={savedWords}
              onSaveRequest={handleSaveRequest}
            />
          </div>
        </FadeUp>
      </div>

      {/* Save Word Modal */}
      <SaveWordModal
        word={modalWord}
        onClose={() => setModalWord(null)}
        onSave={handleConfirmSave}
      />
    </section>
  );
}
