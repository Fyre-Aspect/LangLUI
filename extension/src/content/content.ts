import { selectWords } from '../utils/wordSelector';
import { translateWords } from '../services/translationService';
import { buildTooltip, removeTip } from './tooltip';

// ── Module-level in-memory caches (zero-latency hover access)
const transMap   = new Map<string, string>(); // word → translation
const contextMap = new Map<string, string>(); // word → sentence context

let uid        = '';
let lang       = 'ja';
let intensity  = 5;
let tryOutMode = false;
let scanDone   = false;

// ── INIT ──────────────────────────────────────────────────────────────────────
async function init() {
  try {
    const store = await chrome.storage.local.get([
      'uid', 'isActive', 'targetLanguage', 'intensity', 'tryOutMode',
    ]) as Record<string, any>;

    uid = store.uid ?? '';
    if (!uid)                        { console.log('[LangLua] not signed in'); return; }
    if (store.isActive === false)    { console.log('[LangLua] inactive'); return; }

    lang       = store.targetLanguage ?? 'ja';
    intensity  = store.intensity      ?? 5;
    tryOutMode = store.tryOutMode     ?? false;

    console.log(`[LangLua] init lang=${lang} intensity=${intensity} tryOut=${tryOutMode}`);
    await runScan();
    watchMutations();
  } catch (err) {
    console.error('[LangLua] init error:', err);
  }
}

// ── SCAN ──────────────────────────────────────────────────────────────────────
async function runScan() {
  const { words, nodeMap, contextFor } = selectWords(intensity);
  if (!words.length) { console.log('[LangLua] no words selected'); return; }

  // Store sentence contexts
  for (const [word, ctx] of Object.entries(contextFor)) {
    contextMap.set(word, ctx);
  }

  // Translate all — reads from local dict + chrome.storage batch + Flash API
  const translations = await translateWords(words, lang);
  for (const [w, t] of Object.entries(translations)) {
    transMap.set(w, t);
  }

  // Replace in DOM
  let count = 0;
  for (const [word, translation] of transMap) {
    const nodes = nodeMap.get(word);
    if (!nodes) continue;
    for (const node of nodes) {
      if (!node.parentNode) continue;
      replaceInNode(node, word, translation);
      count++;
    }
  }

  console.log(`[LangLua] replaced ${count} instances across ${transMap.size} words`);
  scanDone = true;
}

// ── DOM REPLACE ───────────────────────────────────────────────────────────────
function replaceInNode(node: Text, word: string, translation: string) {
  const text    = node.nodeValue ?? '';
  const parent  = node.parentNode;
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
