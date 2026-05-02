import { buildSaveWordModal } from "./saveWordModal";

let currentTooltip: HTMLElement | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;

export function buildTooltip(
  anchor: HTMLElement,
  original: string,
  translation: string,
  lang: string,
  context: string,
  uid: string,
) {
  removeTip();

  const tip = document.createElement('div');
  tip.className    = 'langlua-tooltip';
  tip.id           = 'langlua-tooltip-container';

  const langLabel  = lang.toUpperCase();
  
  // Mask the original word in the context to avoid spoiling the answer
  const maskedContext = context.replace(new RegExp(`\\b${original}\\b`, 'gi'), '____');
  
  const contextSnip = context
    ? `<div class="ll-context">${escHtml(maskedContext)}</div><div class="ll-divider"></div>`
    : '';

  // Normal mode: hide the English 'original' word in the header so it's not a spoiler
  tip.innerHTML = `
    <div class="ll-header">
      <span class="ll-translation">${escHtml(translation)}</span>
      <button id="ll-play" class="ll-play-btn" title="Pronounce">🔊</button>
      <span class="ll-lang-badge">${langLabel}</span>
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
    chrome.runtime.sendMessage({ type: 'FETCH_AUDIO', text: translation }, (dataUri) => {
      if (dataUri) {
        const audio = new Audio(dataUri);
        audio.play();
      }
    });
  });

  // Guess / check
  const guessInput = tip.querySelector<HTMLInputElement>('#ll-guess')!;
  guessInput?.focus();

  const showFeedback = (correct: boolean) => {
    const fb = tip.querySelector<HTMLElement>('#ll-feedback')!;
    const correctAnswer = original;

    if (correct) {
      fb.innerHTML = `<span class="ll-correct">✅ Correct! +15 🪙</span>`;
      chrome.runtime.sendMessage({ type: 'ADD_CREDITS', uid, amount: 15 });
    } else {
      fb.innerHTML = `<span class="ll-wrong">❌ Not quite. +2 🪙</span><br><span class="ll-reveal">The answer is: <strong>${escHtml(correctAnswer)}</strong></span>`;
      chrome.runtime.sendMessage({ type: 'ADD_CREDITS', uid, amount: 2 });
    }
  };

  const doCheck = async () => {
    const guess = guessInput.value.trim();
    if (!guess) return;
    const fb = tip.querySelector<HTMLElement>('#ll-feedback')!;
    fb.innerHTML = '<span class="ll-checking">Checking…</span>';
    
    chrome.runtime.sendMessage({ type: 'CHECK_GUESS', word: original, guess, lang }, (correct) => {
      showFeedback(correct);
    });
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
    const fb = tip.querySelector<HTMLElement>('#ll-feedback')!;
    fb.innerHTML = `<span class="ll-reveal">The answer is: <strong>${escHtml(original)}</strong></span>`;
  });

  // Lazy definition (normal mode only)
  tip.querySelector('#ll-def-btn')?.addEventListener('click', async (e) => {
    e.stopPropagation();
    const defText = tip.querySelector<HTMLElement>('#ll-def-text')!;
    defText.innerHTML = '<span class="ll-checking">Loading…</span>';
    
    chrome.runtime.sendMessage({ type: 'GET_DEFINITION', word: original, context }, (def) => {
      defText.innerHTML = `<span>${escHtml(def)}</span><span class="ll-def-credit"> +1 🪙</span>`;
      chrome.runtime.sendMessage({ type: 'ADD_CREDITS', uid, amount: 1 });
    });
  });

  // Save word button
  tip.querySelector('#ll-save-word')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const proficiencyLevel = 5; // Default mid-level
    buildSaveWordModal(original, translation, lang, proficiencyLevel, () => {
      chrome.storage.local.get(['savedWords'], (result) => {
        const savedWords = (result.savedWords || {}) as Record<string, any[]>;
        if (!savedWords[lang]) savedWords[lang] = [];
        savedWords[lang].push({ word: original, translation, context, savedAt: Date.now() });
        chrome.storage.local.set({ savedWords });
      });
    });
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

  let top  = rect.bottom + 8 + window.scrollY;
  let left = rect.left + window.scrollX;

  // Keep within viewport horizontally
  if (left + 280 > vw - 8) left = vw - 280 - 8;
  if (left < 8) left = 8;

  // Flip above if not enough room below
  if (rect.bottom + 260 > vh && rect.top - 260 > 0) {
    top = rect.top - 260 + window.scrollY;
  }

  tip.style.left = `${left}px`;
  tip.style.top  = `${top}px`;
  tip.style.display = 'block';
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

export { removeTip as hideTooltip };

function escHtml(s: string): string {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
