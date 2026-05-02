import { playPronunciation } from '../services/elevenLabsService';
import { checkGuess, getDefinition } from '../services/translationService';

let currentTooltip: HTMLElement | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;

export function buildTooltip(
  anchor: HTMLElement,
  original: string,
  translation: string,
  lang: string,
  context: string,
  tryOutMode: boolean,
  uid: string,
) {
  removeTip();

  const tip = document.createElement('div');
  tip.className    = 'langlua-tooltip';
  tip.id           = 'langlua-tooltip-container';

  const langLabel  = lang.toUpperCase();
  const contextSnip = context
    ? `<div class="ll-context">${escHtml(context)}</div><div class="ll-divider"></div>`
    : '';

  if (tryOutMode) {
    tip.innerHTML = `
      <div class="ll-header">
        <span class="ll-original">${escHtml(original)}</span>
        <span class="ll-arrow">→</span>
        <span class="ll-lang-badge">${langLabel}</span>
      </div>
      ${contextSnip}
      <div class="ll-quiz-label">💬 What is this in ${langLabel}?</div>
      <input id="ll-guess" class="ll-input" type="text" placeholder="Type your guess…" autocomplete="off" />
      <div class="ll-btn-row">
        <button id="ll-check" class="ll-btn-primary">Check →</button>
        <button id="ll-skip" class="ll-btn-ghost">Skip +1 🪙</button>
      </div>
      <div id="ll-feedback" class="ll-feedback"></div>
    `;
  } else {
    tip.innerHTML = `
      <div class="ll-header">
        <span class="ll-original">${escHtml(original)}</span>
        <span class="ll-arrow">→</span>
        <span class="ll-translation">${escHtml(translation)}</span>
        <button id="ll-play" class="ll-play-btn" title="Pronounce">🔊</button>
      </div>
      ${contextSnip}
      <div class="ll-quiz-label">💡 What do you think it means?</div>
      <input id="ll-guess" class="ll-input" type="text" placeholder="Type guess…" autocomplete="off" />
      <div class="ll-btn-row">
        <button id="ll-check" class="ll-btn-primary">Check</button>
        <button id="ll-skip" class="ll-btn-ghost">Skip +1 🪙</button>
      </div>
      <div id="ll-feedback" class="ll-feedback"></div>
      <div class="ll-divider"></div>
      <button id="ll-def-btn" class="ll-def-link">Show full definition</button>
      <div id="ll-def-text" class="ll-def-text"></div>
    `;
  }

  document.body.appendChild(tip);
  positionTip(tip, anchor);
  currentTooltip = tip;

  // Close on outside click
  setTimeout(() => {
    document.addEventListener('click', outsideClick, { capture: true, once: true });
  }, 0);

  // Pronounce button
  tip.querySelector<HTMLButtonElement>('#ll-play')?.addEventListener('click', (e) => {
    e.stopPropagation();
    playPronunciation(translation);
  });

  // Guess / check
  const guessInput = tip.querySelector<HTMLInputElement>('#ll-guess')!;
  guessInput?.focus();

  const showFeedback = (correct: boolean, revealedTranslation?: string) => {
    const fb = tip.querySelector<HTMLElement>('#ll-feedback')!;
    if (correct) {
      fb.innerHTML = `<span class="ll-correct">✅ Correct! +15 🪙</span>`;
      chrome.runtime.sendMessage({ type: 'ADD_CREDITS', uid, amount: 15 });
      if (tryOutMode && revealedTranslation) {
        fb.innerHTML += `<br><span class="ll-reveal">${escHtml(revealedTranslation)}</span>`;
      }
    } else {
      fb.innerHTML = `<span class="ll-wrong">❌ Not quite. +2 🪙</span>`;
      chrome.runtime.sendMessage({ type: 'ADD_CREDITS', uid, amount: 2 });
      if (revealedTranslation) {
        fb.innerHTML += `<br><span class="ll-reveal">${escHtml(revealedTranslation)}</span>`;
      }
    }
  };

  const doCheck = async () => {
    const guess = guessInput.value.trim();
    if (!guess) return;
    const fb = tip.querySelector<HTMLElement>('#ll-feedback')!;
    fb.innerHTML = '<span class="ll-checking">Checking…</span>';
    const correct = await checkGuess(original, guess);
    showFeedback(correct, translation);
  };

  tip.querySelector('#ll-check')?.addEventListener('click', (e) => {
    e.stopPropagation();
    doCheck();
  });
  guessInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doCheck();
    e.stopPropagation();
  });

  tip.querySelector('#ll-skip')?.addEventListener('click', (e) => {
    e.stopPropagation();
    chrome.runtime.sendMessage({ type: 'ADD_CREDITS', uid, amount: 1 });
    removeTip();
  });

  // Lazy definition (normal mode only)
  tip.querySelector('#ll-def-btn')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    const defText = tip.querySelector<HTMLElement>('#ll-def-text')!;
    defText.innerHTML = '<span class="ll-checking">Loading…</span>';
    const def = await getDefinition(original, context);
    defText.innerHTML = `<span>${escHtml(def)}</span><span class="ll-def-credit"> +1 🪙</span>`;
    chrome.runtime.sendMessage({ type: 'ADD_CREDITS', uid, amount: 1 });
  });

  // Keep tooltip alive while mouse is inside it
  tip.addEventListener('mouseenter', () => {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
  });
  tip.addEventListener('mouseleave', () => {
    hideTimer = setTimeout(removeTip, 300);
  });
}

function positionTip(tip: HTMLElement, anchor: HTMLElement) {
  const rect = anchor.getBoundingClientRect();
  const vw   = window.innerWidth;
  const vh   = window.innerHeight;

  let top  = rect.bottom + 8;
  let left = rect.left;

  // Keep within viewport horizontally
  if (left + 280 > vw - 8) left = vw - 280 - 8;
  if (left < 8) left = 8;

  // Flip above if not enough room below
  if (top + 260 > vh && rect.top - 260 > 0) top = rect.top - 260;

  tip.style.left = `${left}px`;
  tip.style.top  = `${top}px`;
}

function outsideClick(e: MouseEvent) {
  const t = e.target as Node;
  if (currentTooltip && !currentTooltip.contains(t)) {
    removeTip();
  }
}

export function removeTip() {
  if (currentTooltip) {
    currentTooltip.remove();
    currentTooltip = null;
  }
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
}

// Keep existing export name for callers that use hideTooltip
export { removeTip as hideTooltip };

function escHtml(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
