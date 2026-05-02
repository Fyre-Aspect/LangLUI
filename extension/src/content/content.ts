import { selectWords } from '../utils/wordSelector';
import { translateWords } from '../services/translationService';
import { createTooltip, positionTooltip, hideTooltip } from './tooltip';

const init = async () => {
  try {
    const storageObj = await chrome.storage.local.get(['uid']) as { uid: string };
    const uid = storageObj.uid;
    if (!uid) return;

    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "GET_USER_PREFS", uid }, resolve);
    });

    const prefs = response as { targetLanguage: string; intensity: number; error?: string };
    if (prefs.error || !prefs.targetLanguage) return;

    const { words, wordNodes } = selectWords(prefs.intensity);
    if (words.length === 0) return;

    const translations = await translateWords(words, prefs.targetLanguage);

    wordNodes.forEach((nodes, word) => {
      const translation = translations[word];
      if (!translation) return;

      nodes.forEach(node => {
        const text = node.nodeValue;
        if (!text) return;

        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        if (!regex.test(text)) return;

        const span = document.createElement('span');
        span.className = 'langlua-word';
        span.dataset.original = word;
        span.dataset.translation = translation;
        span.innerText = translation;

        // Simplified replacement logic
        const fragments = text.split(regex);
        const parent = node.parentNode;
        if (!parent) return;

        fragments.forEach((frag, idx) => {
          if (frag) {
            parent.insertBefore(document.createTextNode(frag), node);
          }
          if (idx < fragments.length - 1) {
            const clone = span.cloneNode(true) as HTMLElement;
            clone.addEventListener('mouseenter', (e) => {
              const rect = clone.getBoundingClientRect();
              const tooltip = createTooltip(word, translation, uid);
              positionTooltip(tooltip, rect);
            });
            parent.insertBefore(clone, node);
          }
        });
        parent.removeChild(node);
      });
    });

    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.langlua-tooltip') && !target.closest('.langlua-word')) {
        hideTooltip();
      }
    });
  } catch (error) {
    console.error("LangLua content script error:", error);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
