import { selectWords } from '../utils/wordSelector';
import { buildTooltip, hideTooltip } from './tooltip';
import { createSidebar } from './sidebar';

let currentLang = 'ja';
let currentIntensity = 5;
let isTryOut = false;
let userUid = '';
let globalTranslations: Record<string, string> = {};
let globalContext: Record<string, string> = {};

const processNode = (node: Text, translations: Record<string, string>, contextMap: Record<string, string>) => {
  const text = node.nodeValue;
  const parent = node.parentNode as HTMLElement;
  if (!text || !parent || parent.closest('.langlua-tooltip') || parent.closest('.ll-sidebar') || parent.classList.contains('langlua-word') || parent.classList.contains('langlua-tryout')) return;

  const wordsInNode = Object.keys(translations).filter(w => 
    new RegExp(`\\b${w}\\b`, 'gi').test(text)
  );

  if (wordsInNode.length === 0) return;
  wordsInNode.sort((a, b) => b.length - a.length);

  const frag = document.createDocumentFragment();
  let lastIndex = 0;
  const pattern = wordsInNode.map(w => `\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).join('|');
  const regex = new RegExp(pattern, 'gi');
  
  let match;
  while ((match = regex.exec(text)) !== null) {
    const matchedWord = match[0];
    const lowerWord = matchedWord.toLowerCase();
    const translation = translations[lowerWord];
    if (!translation) continue;

    frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));

    const span = document.createElement('span');
    const wordContext = contextMap[lowerWord] || '';

    if (isTryOut) {
      span.className = 'langlua-tryout';
      span.textContent = matchedWord;
      span.addEventListener('click', (e) => {
        e.stopPropagation();
        // Try to find in sidebar if in try-out mode
        const sidebarItem = Array.from(document.querySelectorAll('.ll-sidebar-item'))
          .find(item => item.querySelector('.ll-sidebar-word')?.textContent?.toLowerCase().includes(lowerWord));
        if (sidebarItem) {
          sidebarItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (sidebarItem as HTMLElement).click();
        } else {
          buildTooltip(span, matchedWord, translation, currentLang, wordContext, true, userUid);
        }
      });
    } else {
      span.className = 'langlua-word';
      span.textContent = translation;
      const show = (e: Event) => {
        e.stopPropagation();
        buildTooltip(span, matchedWord, translation, currentLang, wordContext, false, userUid);
      };
      span.addEventListener('mouseenter', show);
      span.addEventListener('click', show);
    }

    frag.appendChild(span);
    lastIndex = regex.lastIndex;
  }

  if (lastIndex > 0) {
    frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    parent.replaceChild(frag, node);
  }
};

const init = async () => {
  try {
    const store = await chrome.storage.local.get(['uid', 'isActive', 'targetLanguage', 'intensity', 'tryOutMode']);
    userUid = (store.uid as string) || 'local-user';
    if (store.isActive === false) return;

    currentLang = (store.targetLanguage as string) || 'ja';
    currentIntensity = (store.intensity as number) || 5;
    isTryOut = (store.tryOutMode as boolean) || false;

    const { words, nodeMap, contextFor } = selectWords(currentIntensity);
    if (words.length === 0) return;

    globalContext = { ...globalContext, ...contextFor };

    const translations = await new Promise<Record<string, string>>((resolve) => {
      chrome.runtime.sendMessage({ 
        type: "TRANSLATE_WORDS", 
        words: Array.from(new Set(words)), 
        targetLanguage: currentLang 
      }, (resp) => resolve(resp || {}));
    });

    if (!translations || Object.keys(translations).length === 0) return;
    globalTranslations = { ...globalTranslations, ...translations };

    if (isTryOut) {
      createSidebar(words, globalTranslations, contextFor, currentLang, userUid);
    }

    // Initial pass
    const uniqueNodes = new Set<Text>();
    nodeMap.forEach(nodes => nodes.forEach(n => uniqueNodes.add(n)));
    uniqueNodes.forEach(node => processNode(node, globalTranslations, globalContext));

    // Watch for dynamic content
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            processNode(node as Text, globalTranslations, globalContext);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
            let textNode;
            while (textNode = walker.nextNode()) {
              processNode(textNode as Text, globalTranslations, globalContext);
            }
          }
        });
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.langlua-tooltip') && !target.closest('.langlua-word') && !target.closest('.langlua-tryout') && !target.closest('.ll-sidebar')) {
        hideTooltip();
      }
    });

    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'TOGGLE_TRYOUT') {
        window.location.reload();
      }
    });

  } catch (error) {
    console.error("[LangLua] Critical error in content script:", error);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
