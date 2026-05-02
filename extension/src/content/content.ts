import { selectWords } from '../utils/wordSelector';
import { buildTooltip, hideTooltip } from './tooltip';

const init = async () => {
  try {
    console.log('[LangLua] content script init started');

    const store = await chrome.storage.local.get(['uid', 'isActive', 'targetLanguage', 'intensity', 'tryOutMode']);
    const uid = (store.uid as string) || '';
    if (!uid) { console.log('[LangLua] not signed in'); return; }
    if (store.isActive === false) { console.log('[LangLua] inactive'); return; }

    const lang = (store.targetLanguage as string) || 'ja';
    const intensity = (store.intensity as number) || 5;
    const tryOutMode = (store.tryOutMode as boolean) || false;

    const { words, nodeMap, contextFor } = selectWords(intensity);
    if (words.length === 0) {
      console.log('[LangLua] No words selected, aborting.');
      return;
    }

    const translations = await new Promise<Record<string, string>>((resolve) => {
      chrome.runtime.sendMessage({ 
        type: "TRANSLATE_WORDS", 
        words: Array.from(new Set(words)), 
        targetLanguage: lang 
      }, (resp) => resolve(resp || {}));
    });

    if (!translations || Object.keys(translations).length === 0) {
      console.log('[LangLua] No translations received.');
      return;
    }

    const uniqueNodes = new Set<Text>();
    nodeMap.forEach(nodes => nodes.forEach(n => uniqueNodes.add(n)));

    let replacedCount = 0;

    uniqueNodes.forEach(node => {
      const text = node.nodeValue;
      const parent = node.parentNode;
      if (!text || !parent) return;

      // Find which words from our set are actually in THIS node
      const wordsInNode = Array.from(nodeMap.keys()).filter((w: string) => 
        new RegExp(`\\b${w}\\b`, 'gi').test(text)
      );

      if (wordsInNode.length === 0) return;

      // Sort words by length descending to avoid partial matches
      wordsInNode.sort((a: string, b: string) => b.length - a.length);

      const frag = document.createDocumentFragment();
      let lastIndex = 0;

      // Simple regex approach for the whole node text
      const pattern = wordsInNode.map(w => `\\b${w}\\b`).join('|');
      const regex = new RegExp(pattern, 'gi');
      
      let match;
      while ((match = regex.exec(text)) !== null) {
        const matchedWord = match[0];
        const lowerWord = matchedWord.toLowerCase();
        const translation = (translations as Record<string, string>)[lowerWord];

        if (!translation) continue;

        // Add text before match
        frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));

        const span = document.createElement('span');
        const wordContext = contextFor[lowerWord] || '';

        if (tryOutMode) {
          span.className = 'langlua-tryout';
          span.textContent = matchedWord;
          span.addEventListener('click', (e) => {
            e.stopPropagation();
            buildTooltip(span, matchedWord, translation, lang, wordContext, true, uid);
          });
        } else {
          span.className = 'langlua-word';
          span.textContent = translation;
          const show = (e: Event) => {
            e.stopPropagation();
            buildTooltip(span, matchedWord, translation, lang, wordContext, false, uid);
          };
          span.addEventListener('mouseenter', show);
          span.addEventListener('click', show);
        }

        frag.appendChild(span);
        lastIndex = regex.lastIndex;
        replacedCount++;
      }

      if (lastIndex > 0) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex)));
        parent.replaceChild(frag, node);
      }
    });

    console.log('[LangLua] done. Total words replaced:', replacedCount);

    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.langlua-tooltip') && !target.closest('.langlua-word') && !target.closest('.langlua-tryout')) {
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
