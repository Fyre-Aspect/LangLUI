import { selectWords } from '../utils/wordSelector';
import { createTooltip, positionTooltip, hideTooltip } from './tooltip';

const init = async () => {
  try {
    console.log('[LangLua] content script init started');

    const storageObj = await chrome.storage.local.get(['uid', 'isActive']) as { uid: string, isActive?: boolean };
    console.log('[LangLua] storage:', JSON.stringify(storageObj));

    uid = store.uid ?? '';
    if (!uid) { console.log('[LangLua] not signed in'); return; }
    if (store.isActive === false) { console.log('[LangLua] inactive'); return; }

    lang = store.targetLanguage ?? 'ja';
    intensity = store.intensity ?? 5;
    tryOutMode = store.tryOutMode ?? false;

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

    const rawTranslations = await new Promise<Record<string, string>>((resolve) => {
      chrome.runtime.sendMessage({ type: "TRANSLATE_WORDS", words, targetLanguage: prefs.targetLanguage }, resolve);
    });

    const translations: Record<string, string> = {};
    if (rawTranslations) {
      for (const [k, v] of Object.entries(rawTranslations)) {
        translations[k.toLowerCase()] = v;
      }
    }

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

      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = [...text.matchAll(regex)];
      if (!matches.length) return;

      const frag = document.createDocumentFragment();
      let last = 0;

      for (const m of matches) {
        const start = m.index!;
        if (start > last) frag.appendChild(document.createTextNode(text.slice(last, start)));

        const span = document.createElement('span');

        if (tryOutMode) {
          span.className = 'langlua-tryout';
          span.textContent = m[0]; // keep original English
          span.addEventListener('click', (e) => {
            e.stopPropagation();
            buildTooltip(span, m[0], translation, lang, contextMap.get(word) ?? '', true, uid);
          });
        } else {
          span.className = 'langlua-word';
          span.textContent = translation;
          span.dataset.original = m[0];
          span.dataset.translation = translation;

          const show = (e: MouseEvent) => {
            console.log('[LangLua] Hover/Click on:', matchedWord);
            const rect = span.getBoundingClientRect();
            const tooltip = createTooltip(lowerWord, translation, uid);
            positionTooltip(tooltip, rect);
            console.log('[LangLua] Tooltip positioned at:', tooltip.style.left, tooltip.style.top);
          };

          span.addEventListener('mouseenter', show);
          span.addEventListener('click', (e) => {
            e.stopPropagation();
            show(e);
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
    if (replacedCount > 0) {
      console.log('[LangLua] SUCCESS: You should see highlighted words on the page. Hover or click them to see the tooltip.');
    } else {
      console.log('[LangLua] WARNING: No words were replaced. Check if translations were received or if words matched the page text.');
    }

    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.langlua-tooltip') && !target.closest('.langlua-word')) {
        hideTooltip();
      }
    });
  } catch (error) {
    console.error("[LangLua] content script error:", error);
  }
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
