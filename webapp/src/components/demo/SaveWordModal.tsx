"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { DemoWord } from "@/lib/demoWords";
import { useState } from "react";

interface SaveWordModalProps {
  word: DemoWord | null;
  onClose: () => void;
  onSave: () => void;
}

export function SaveWordModal({ word, onClose, onSave }: SaveWordModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onSave();
      setIsSaving(false);
      onClose();
    }, 600);
  };

  return (
    <Dialog.Root open={word !== null} onOpenChange={onClose}>
      <AnimatePresence>
        {word && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={onClose}
            />

            {/* Modal */}
            <Dialog.Portal>
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="pointer-events-auto bg-white/98 backdrop-blur-md border border-slate-200 rounded-modal p-7 w-[360px] shadow-modal"
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.98 }}
                  transition={{
                    duration: 0.3,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-slate-800 text-xl font-bold">
                      Save Word
                    </h3>
                    <button
                      onClick={onClose}
                      className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Word Preview */}
                  <div className="flex items-center gap-2 flex-wrap p-3 bg-slate-50 rounded-xl mb-4">
                    <span className="text-xs text-slate-500 font-medium">
                      {word.original}
                    </span>
                    <span className="text-xs text-slate-400">→</span>
                    <span className="text-sm font-bold text-primary-DEFAULT">
                      {word.translation}
                    </span>
                    <span className="ml-auto text-[10px] font-semibold text-primary-DEFAULT bg-blue-100 border border-blue-200 rounded-full px-2 py-1">
                      ES
                    </span>
                  </div>

                  <hr className="border-slate-200 mb-4" />

                  {/* Adaptive Learning Callout */}
                  <div className="space-y-3 mb-4">
                    <div className="flex gap-3">
                      <div className="text-base font-bold text-primary-DEFAULT">A</div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 mb-0.5">
                          Adaptive Learning
                        </p>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Your proficiency level determines how many words we
                          show you at once.
                        </p>
                      </div>
                    </div>

                    {/* Capacity Indicator */}
                    <div className="px-3 py-3 bg-gradient-to-br from-blue-50/50 to-transparent border border-blue-100 rounded-xl">
                      <p className="text-[11px] text-slate-500 mb-2">
                        You can save
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-primary-DEFAULT">
                          5 more words
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          at your level
                        </span>
                      </div>
                      {/* Level Bar */}
                      <div className="h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full bg-primary-DEFAULT rounded-full transition-all"
                          style={{ width: "40%" }}
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-200 mb-4" />

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full py-2.5 px-4 bg-primary-DEFAULT hover:bg-primary-hover text-slate-900 font-bold rounded-pill transition-all disabled:opacity-70"
                    >
                      {isSaving ? "Saved!" : "Add to Vocabulary"}
                    </button>
                    <Button
                      variant="ghost"
                      onClick={onClose}
                      className="w-full"
                    >
                      Not Now
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            </Dialog.Portal>
          </>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
