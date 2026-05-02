import { selectWords } from '../utils/wordSelector';
import { buildTooltip, hideTooltip } from './tooltip';
import { createSidebar } from './sidebar';

const init = async () => {
  try {
    console.log('[LangLua] Content script initialization started');

    const store = await chrome.storage.local.get(['uid', 'isActive', 'targetLanguage', 'intensity', 'tryOutMode']);
    console.log('[LangLua] Storage state:', JSON.stringify(store));

    const uid = (store.uid as string) || 'local-user'; // Default to local-user if not set
    
    if (store.isActive === false) {
      console.log('[LangLua] Extension is currently inactive (switched off)');
      return;
    }

    const lang = (store.targetLanguage as string) || 'ja';
    const intensity = (store.intensity as number) || 5;
    const tryOutMode = (store.tryOutMode as boolean) || false;

    console.log(`[LangLua] Config: lang=${lang}, intensity=${intensity}, tryOutMode=${tryOutMode}`);

    const { words, nodeMap, contextFor } = selectWords(intensity);
    console.log(`[LangLua] Found ${words.length} potential words on page.`);

    if (words.length === 0) {
      console.log('[LangLua] No eligible words found on this page.');
      return;
    }

    console.log('[LangLua] Requesting translations...');
    const translations = await new Promise<Record<string, string>>((resolve) => {
      chrome.runtime.sendMessage({ 
        type: "TRANSLATE_WORDS", 
        words: Array.from(new Set(words)), 
        targetLanguage: lang 
      }, (resp) => {
        if (chrome.runtime.lastError) {
          console.error('[LangLua] Runtime error in translations:', chrome.runtime.lastError);
          resolve({});
        } else {
          resolve(resp || {});
        }
      });
    });

    console.log(`[LangLua] Received ${Object.keys(translations).length} translations.`);

    if (!translations || Object.keys(translations).length === 0) {
      console.warn('[LangLua] Aborting: No translations were received from the background service.');
      return;
    }

    if (tryOutMode) {
      console.log('[LangLua] Initializing Sidebar for Try Out Mode');
      createSidebar(words, translations as Record<string, string>, contextFor, lang, uid);
    }

    const uniqueNodes = new Set<Text>();
    nodeMap.forEach(nodes => nodes.forEach(n => uniqueNodes.add(n)));

    let replacedCount = 0;

    uniqueNodes.forEach(node => {
      const text = node.nodeValue;
      const parent = node.parentNode;
      if (!text || !parent) return;

      const wordsInNode = Array.from(nodeMap.keys()).filter((w: string) => 
        new RegExp(`\\b${w}\\b`, 'gi').test(text)
      );

      if (wordsInNode.length === 0) return;
      wordsInNode.sort((a: string, b: string) => b.length - a.length);

      const frag = document.createDocumentFragment();
      let lastIndex = 0;

      const pattern = wordsInNode.map(w => `\\b${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).join('|');
      const regex = new RegExp(pattern, 'gi');
      
      let match;
      while ((match = regex.exec(text)) !== null) {
        const matchedWord = match[0];
        const lowerWord = matchedWord.toLowerCase();
        const translation = (translations as Record<string, string>)[lowerWord];

        if (!translation) continue;

        frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));

        const span = document.createElement('span');
        const wordContext = contextFor[lowerWord] || '';

        if (tryOutMode) {
          span.className = 'langlua-tryout';
          span.textContent = matchedWord;
          span.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log(`[LangLua] Clicked ${matchedWord} in Try Out Mode`);
            const sidebarItem = Array.from(document.querySelectorAll('.ll-sidebar-item'))
              .find(item => item.querySelector('.ll-sidebar-word')?.textContent?.toLowerCase().includes(lowerWord));
            if (sidebarItem) {
              sidebarItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
              (sidebarItem as HTMLElement).click();
            } else {
              console.warn(`[LangLua] Could not find sidebar item for ${lowerWord}`);
            }
          });
        } else {
          span.className = 'langlua-word';
          span.textContent = translation;
          const show = (e: Event) => {
            e.stopPropagation();
            buildTooltip(span, matchedWord, translation, lang, wordContext, uid);
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

    console.log(`[LangLua] Success: Processed ${replacedCount} words.`);

    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.langlua-tooltip') && !target.closest('.langlua-word') && !target.closest('.langlua-tryout') && !target.closest('.ll-sidebar')) {
        hideTooltip();
      }
    });

    // Listen for mode toggles from popup
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'TOGGLE_TRYOUT') {
        console.log('[LangLua] Try Out Mode toggled:', msg.value);
        window.location.reload(); // Simplest way to re-process the page
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
