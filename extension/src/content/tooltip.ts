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
    <button id="langlua-play" class="langlua-tooltip-btn">🔊 Listen</button>
    <hr>
    <div style="font-size: 12px; color: #888;">Original: ${word}</div>
    <div style="font-size: 24px; color: #A89BFF; margin: 4px 0;">${translation}</div>
    <hr>
    <div style="margin-bottom: 8px;">💡 What does it mean?</div>
    <input type="text" id="langlua-guess" class="langlua-tooltip-input" placeholder="Type guess..." />
    <button id="langlua-submit" class="langlua-tooltip-btn" style="width: 100%">Submit</button>
    <div id="langlua-feedback" style="margin-top: 8px; color: #ffeb3b;"></div>
    <hr>
    <button id="langlua-def" class="langlua-tooltip-btn" style="background: #444;">Show Definition</button>
    <div id="langlua-def-text" style="margin-top: 8px;"></div>
  `;

  document.getElementById('langlua-play')?.addEventListener('click', () => {
    playPronunciation(translation);
  });

  document.getElementById('langlua-submit')?.addEventListener('click', async () => {
    const guess = (document.getElementById('langlua-guess') as HTMLInputElement).value;
    const feedback = document.getElementById('langlua-feedback');
    if (!guess.trim() || !feedback) return;
    
    feedback.innerText = 'Checking...';
    const isCorrect = await checkGuess(word, guess);
    
    if (isCorrect) {
      feedback.innerText = '✅ Correct! +10 🪙';
      feedback.style.color = '#4caf50';
      chrome.runtime.sendMessage({ type: "ADD_CREDITS", uid, amount: 10 });
    } else {
      feedback.innerText = '❌ Not quite.';
      feedback.style.color = '#f44336';
    }
  });

  document.getElementById('langlua-def')?.addEventListener('click', async () => {
    const text = document.getElementById('langlua-def-text');
    if (!text) return;
    text.innerText = 'Loading...';
    try {
      const def = await getDefinition(word);
      text.innerText = def;
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
