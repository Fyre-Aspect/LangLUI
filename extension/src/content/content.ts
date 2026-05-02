import { selectWords } from '../utils/wordSelector';
import { translateWords } from '../services/translationService';
import { createTooltip, positionTooltip, hideTooltip } from './tooltip';

const init = async () => {
  try {
    console.log('[LangLua] content script init started');

    const storageObj = await chrome.storage.local.get(['uid', 'isActive']) as { uid: string, isActive?: boolean };
    console.log('[LangLua] storage:', JSON.stringify(storageObj));

    const uid = storageObj.uid;
    if (!uid) {
      console.log('[LangLua] No uid found, aborting.');
      return;
    }
    if (storageObj.isActive === false) {
      console.log('[LangLua] isActive is false, aborting.');
      return;
    }

    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: "GET_USER_PREFS", uid }, (res) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(res);
        }
      });
    });

    console.log('[LangLua] prefs response:', JSON.stringify(response));

    const prefs = response as { targetLanguage: string; intensity: number; error?: string };
    if (!response || prefs.error || !prefs.targetLanguage) {
      console.log('[LangLua] Bad prefs, aborting:', prefs);
      return;
    }

    const { words, wordNodes } = selectWords(prefs.intensity);
    console.log('[LangLua] selected words count:', words.length, words.slice(0, 10));

    if (words.length === 0) {
      console.log('[LangLua] No words selected, aborting.');
      return;
    }

    const translations = await translateWords(words, prefs.targetLanguage);
    console.log('[LangLua] translations received:', Object.keys(translations).length, translations);

    // Get unique Text nodes that we found words in
    const uniqueNodes = new Set<Text>();
    wordNodes.forEach(nodes => nodes.forEach(n => uniqueNodes.add(n)));
    console.log('[LangLua] unique text nodes to process:', uniqueNodes.size);

    let replacedCount = 0;

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

      // A simple regex that matches ANY of the translated words
      const combinedRegex = new RegExp(`\\b(${matchingWords.join('|')})\\b`, 'gi');

      let match;
      let lastIndex = 0;

      while ((match = combinedRegex.exec(text)) !== null) {
        const matchedWord = match[0];
        const lowerWord = matchedWord.toLowerCase();
        const translation = translations[lowerWord];

        if (!translation) continue;

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

        span.addEventListener('mouseenter', () => {
          const rect = span.getBoundingClientRect();
          const tooltip = createTooltip(lowerWord, translation, uid);
          positionTooltip(tooltip, rect);
        });

        fragment.appendChild(span);
        lastIndex = match.index + matchedWord.length;
        replacedCount++;
      }

      // Add any trailing text
      if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
      }

      // Only replace if we actually modified something
      if (lastIndex > 0) {
        parent.replaceChild(fragment, node);
      }
    });

    console.log('[LangLua] done. Total words replaced on page:', replacedCount);

    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.langlua-tooltip') && !target.closest('.langlua-word')) {
        hideTooltip();
      }
    });
  } catch (error) {
    console.error("[LangLua] content script error:", error);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
