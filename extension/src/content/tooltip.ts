import { playPronunciation } from '../services/elevenLabsService';
import { checkGuess, getDefinition } from '../services/geminiService';

export const createTooltip = (word: string, translation: string, uid: string) => {
  let tooltip = document.getElementById('langlua-tooltip-container');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'langlua-tooltip-container';
    tooltip.className = 'langlua-tooltip';
    document.body.appendChild(tooltip);
  }

  tooltip.innerHTML = `
    <button id="langlua-play" class="langlua-pronounce-btn">🔊 Listen</button>
    <div class="langlua-original">Original: ${word}</div>
    <div class="langlua-translation">${translation}</div>
    <hr class="langlua-divider">
    <div class="langlua-quiz-label">💡 What do you think it means?</div>
    <input type="text" id="langlua-guess" class="langlua-quiz-input" placeholder="Type guess..." />
    <button id="langlua-submit" class="langlua-submit-btn">Submit</button>
    <div id="langlua-feedback"></div>
    <hr class="langlua-divider">
    <button id="langlua-def" class="langlua-definition-btn">Show Definition</button>
    <div id="langlua-def-text" class="langlua-definition-text"></div>
  `;

  document.getElementById('langlua-play')?.addEventListener('click', () => {
    playPronunciation(translation);
  });

  document.getElementById('langlua-submit')?.addEventListener('click', async () => {
    const guess = (document.getElementById('langlua-guess') as HTMLInputElement).value;
    const feedback = document.getElementById('langlua-feedback');
    if (!guess.trim() || !feedback) return;
    
    feedback.innerText = 'Checking...';
    feedback.className = '';
    const isCorrect = await checkGuess(word, guess);
    
    if (isCorrect) {
      feedback.innerText = '✅ Correct! +10 🪙';
      feedback.className = 'langlua-correct';
      chrome.runtime.sendMessage({ type: "ADD_CREDITS", uid, amount: 10 });
    } else {
      feedback.innerText = '❌ Not quite.';
      feedback.className = 'langlua-wrong';
    }
  });

  document.getElementById('langlua-def')?.addEventListener('click', async () => {
    const text = document.getElementById('langlua-def-text');
    if (!text) return;
    text.innerText = 'Loading...';
    try {
      const def = await getDefinition(word);
      text.innerHTML = `<div>${def}</div><div style="font-size:10px; color:#4caf50; margin-top:4px;">Defined! +1 🪙</div>`;
      chrome.runtime.sendMessage({ type: "ADD_CREDITS", uid, amount: 1 });
    } catch(e) {
      text.innerText = 'Failed to load.';
    }
  });

  return tooltip;
};

export const positionTooltip = (tooltip: HTMLElement, rect: DOMRect) => {
  tooltip.style.left = `${rect.left + window.scrollX}px`;
  tooltip.style.top = `${rect.bottom + window.scrollY + 8}px`;
  tooltip.style.display = 'block';
};

export const hideTooltip = () => {
  const tooltip = document.getElementById('langlua-tooltip-container');
  if (tooltip) {
    tooltip.style.display = 'none';
  }
};
