import { selectWords } from '../utils/wordSelector';
import { buildTooltip, hideTooltip } from './tooltip';
import { createSidebar } from './sidebar';

let currentLang = 'ja';
let currentIntensity = 5;
let isTryOut = false;
let userUid = '';
let globalTranslations: Record<string, string> = {};
let globalContext: Record<string, string> = {};
let globalWords: string[] = [];

let pendingMutationNodes: HTMLElement[] = [];
let mutationTimeout: ReturnType<typeof setTimeout> | null = null;

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
        const sidebarItem = Array.from(document.querySelectorAll('.ll-sidebar-item'))
          .find(item => item.querySelector('.ll-sidebar-word')?.textContent?.toLowerCase().includes(lowerWord));
        if (sidebarItem) {
          sidebarItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (sidebarItem as HTMLElement).click();
        } else {
          buildTooltip(span, matchedWord, translation, currentLang, wordContext, userUid);
        }
      });
    } else {
      span.className = 'langlua-word';
      span.textContent = translation;
      const show = (e: Event) => {
        e.stopPropagation();
        buildTooltip(span, matchedWord, translation, currentLang, wordContext, userUid);
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

const handleNewContent = async (roots: HTMLElement[]) => {
  if (roots.length === 0) return;

  const newlyFoundWords: string[] = [];
  const allNodeMaps: Map<string, Text[]>[] = [];
  
  for (const root of roots) {
    const { words, nodeMap, contextFor } = selectWords(currentIntensity, root);
    
    // Track overall words for sidebar
    words.forEach(w => {
      if (!globalWords.includes(w)) {
        globalWords.push(w);
      }
    });

    // Find words that need new translations
    const wordsToTranslate = words.filter(w => !globalTranslations[w]);
    if (wordsToTranslate.length > 0) {
      newlyFoundWords.push(...wordsToTranslate);
    }
    
    allNodeMaps.push(nodeMap);
    globalContext = { ...globalContext, ...contextFor };
  }

  if (newlyFoundWords.length > 0) {
    const uniqueNewWords = Array.from(new Set(newlyFoundWords));
    const newTranslations = await new Promise<Record<string, string>>((resolve) => {
      chrome.runtime.sendMessage({ 
        type: "TRANSLATE_WORDS", 
        words: uniqueNewWords, 
        targetLanguage: currentLang 
      }, (resp) => resolve(resp || {}));
    });
    globalTranslations = { ...globalTranslations, ...newTranslations };
    
    // Update sidebar if in Try Out mode
    if (isTryOut) {
      createSidebar(globalWords, globalTranslations, globalContext, currentLang, userUid);
    }
  }

  // Apply translations to all identified nodes
  for (const nodeMap of allNodeMaps) {
    const uniqueNodes = new Set<Text>();
    nodeMap.forEach(nodes => nodes.forEach(n => uniqueNodes.add(n)));
    uniqueNodes.forEach(node => {
      if (node.parentNode) {
        processNode(node, globalTranslations, globalContext);
      }
    });
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

    // Initial pass
    await handleNewContent([document.body]);

    // Initialize sidebar even if no words found yet in Try Out mode
    if (isTryOut) {
      createSidebar(globalWords, globalTranslations, globalContext, currentLang, userUid);
    }

    // Watch for dynamic content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        m.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            pendingMutationNodes.push(node);
          }
        });
      });

      if (pendingMutationNodes.length > 0) {
        if (mutationTimeout) clearTimeout(mutationTimeout);
        mutationTimeout = setTimeout(() => {
          const roots = [...pendingMutationNodes];
          pendingMutationNodes = [];
          handleNewContent(roots);
        }, 1000);
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
