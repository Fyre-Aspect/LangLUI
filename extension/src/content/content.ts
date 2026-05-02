import { selectWords } from '../utils/wordSelector';
import { translateWords } from '../services/translationService';
import { createTooltip, positionTooltip, hideTooltip } from './tooltip';

const init = async () => {
  try {
    const storageObj = await chrome.storage.local.get(['uid', 'isActive']) as { uid: string, isActive?: boolean };
    const uid = storageObj.uid;
    if (!uid) return;
    if (storageObj.isActive === false) return; // disable replacement if toggled off

    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "GET_USER_PREFS", uid }, resolve);
    });

    const prefs = response as { targetLanguage: string; intensity: number; error?: string };
    if (prefs.error || !prefs.targetLanguage) return;

    const { words, wordNodes } = selectWords(prefs.intensity);
    if (words.length === 0) return;

    const translations = await translateWords(words, prefs.targetLanguage);

    // Get unique Text nodes that we found words in
    const uniqueNodes = new Set<Text>();
    wordNodes.forEach(nodes => nodes.forEach(n => uniqueNodes.add(n)));

    // Iterate through all actual nodes
    uniqueNodes.forEach(node => {
      const text = node.nodeValue;
      const parent = node.parentNode;
      if (!text || !parent) return;

      // Check which translated words exist in this text node
      const matchingWords = words.filter(word => 
        translations[word] && new RegExp(`\\b${word}\\b`, 'gi').test(text)
      );

      if (matchingWords.length === 0) return;

      // We will replace the text node by building a DocumentFragment
      const fragment = document.createDocumentFragment();
      let remainingText = text;

      // A simple regex that matches ANY of the translated words
      const combinedRegex = new RegExp(`\\b(${matchingWords.join('|')})\\b`, 'gi');
      
      let match;
      let lastIndex = 0;

      while ((match = combinedRegex.exec(text)) !== null) {
        const matchedWord = match[0];
        const lowerWord = matchedWord.toLowerCase();
        const translation = translations[lowerWord];

        // Add text leading up to the match
        if (match.index > lastIndex) {
          fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
        }

        // Add the translated span
        const span = document.createElement('span');
        span.className = 'langlua-word';
        span.dataset.original = lowerWord;
        span.dataset.translation = translation;
        span.innerText = translation;
        
        span.addEventListener('mouseenter', (e) => {
          const rect = span.getBoundingClientRect();
          const tooltip = createTooltip(lowerWord, translation, uid);
          positionTooltip(tooltip, rect);
        });

        fragment.appendChild(span);
        lastIndex = match.index + matchedWord.length;
      }

      // Add any trailing text
      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
      }

      parent.replaceChild(fragment, node);
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
