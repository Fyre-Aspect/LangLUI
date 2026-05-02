import { selectWords } from '../utils/wordSelector';
import { createTooltip, positionTooltip, hideTooltip } from './tooltip';

const init = async () => {
  try {
    console.log('[LangLua] content script init started');

    const storageObj = await chrome.storage.local.get(['uid', 'isActive']) as { uid: string, isActive?: boolean };
    console.log('[LangLua] storage:', JSON.stringify(storageObj));

    uid = store.uid ?? '';
    if (!uid)                        { console.log('[LangLua] not signed in'); return; }
    if (store.isActive === false)    { console.log('[LangLua] inactive'); return; }

    lang       = store.targetLanguage ?? 'ja';
    intensity  = store.intensity      ?? 5;
    tryOutMode = store.tryOutMode     ?? false;

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

  const regex   = new RegExp(`\\b${word}\\b`, 'gi');
  const matches = [...text.matchAll(regex)];
  if (!matches.length) return;

  const frag = document.createDocumentFragment();
  let last   = 0;

  for (const m of matches) {
    const start = m.index!;
    if (start > last) frag.appendChild(document.createTextNode(text.slice(last, start)));

    const span = document.createElement('span');

    if (tryOutMode) {
      span.className   = 'langlua-tryout';
      span.textContent = m[0]; // keep original English
      span.addEventListener('click', (e) => {
        e.stopPropagation();
        buildTooltip(span, m[0], translation, lang, contextMap.get(word) ?? '', true, uid);
      });
    } else {
      span.className = 'langlua-word';
      span.textContent = translation;
      span.dataset.original    = m[0];
      span.dataset.translation = translation;

      let hoverTimer: ReturnType<typeof setTimeout> | null = null;
      span.addEventListener('mouseenter', () => {
        // Instant — data already in transMap/contextMap, no API call
        hoverTimer = setTimeout(() => {
          buildTooltip(span, m[0], translation, lang, contextMap.get(word) ?? '', false, uid);
        }, 120); // tiny delay prevents flicker on fast cursor movement
      });
      span.addEventListener('mouseleave', () => {
        if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null; }
      });
    }

    frag.appendChild(span);
    last = start + m[0].length;
  }

  if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
  parent.replaceChild(frag, node);
}

// ── MUTATION OBSERVER — rescan new content ────────────────────────────────────
let rescanTimer: ReturnType<typeof setTimeout> | null = null;

function watchMutations() {
  new MutationObserver((muts) => {
    if (!scanDone) return;
    const hasNew = muts.some(m =>
      [...m.addedNodes].some(n =>
        n.nodeType === Node.ELEMENT_NODE &&
        !(n as Element).classList?.contains('langlua-word') &&
        !(n as Element).classList?.contains('langlua-tryout') &&
        ((n as Element).textContent?.trim().length ?? 0) > 30
      )
    );
    if (!hasNew) return;
    if (rescanTimer) clearTimeout(rescanTimer);
    rescanTimer = setTimeout(runScan, 1800);
  }).observe(document.body, { childList: true, subtree: true });
}

// ── MESSAGES FROM POPUP ───────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, respond) => {
  if (msg.type === 'RELOAD') {
    init().then(() => respond({ ok: true }));
    return true;
  }
  if (msg.type === 'TOGGLE_TRYOUT') {
    tryOutMode = msg.value as boolean;
    chrome.storage.local.set({ tryOutMode });
    location.reload();
    respond({ ok: true });
  }
});

// ── Global click to dismiss tooltip ──────────────────────────────────────────
document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  if (!t.closest('#langlua-tooltip-container') &&
      !t.closest('.langlua-word') &&
      !t.closest('.langlua-tryout')) {
    removeTip();
  }
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
