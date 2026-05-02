import { hideTooltip } from './tooltip';

export function createSidebar(
  words: string[],
  translations: Record<string, string>,
  contexts: Record<string, string>,
  lang: string,
  uid: string
) {
  // Remove existing sidebar if any
  const existing = document.getElementById('langlua-sidebar');
  if (existing) existing.remove();

  const sidebar = document.createElement('div');
  sidebar.id = 'langlua-sidebar';
  sidebar.className = 'll-sidebar';

  const title = document.createElement('div');
  title.className = 'll-sidebar-title';
  title.innerHTML = `<span>Practice Mode</span><span class="ll-sidebar-badge">${lang.toUpperCase()}</span>`;
  sidebar.appendChild(title);

  const list = document.createElement('div');
  list.className = 'll-sidebar-list';

  words.forEach(word => {
    const lower = word.toLowerCase();
    const translation = translations[lower];
    const context = contexts[lower] || '';
    if (!translation) return;

    const item = document.createElement('div');
    item.className = 'll-sidebar-item';
    item.innerHTML = `
      <div class="ll-sidebar-word">${word}</div>
      <div class="ll-sidebar-quiz" style="display: none;">
        <div class="ll-sidebar-context">${context.replace(new RegExp(`\\b${word}\\b`, 'gi'), '____')}</div>
        <input type="text" class="ll-sidebar-input" placeholder="Translation..." />
        <div class="ll-sidebar-feedback"></div>
      </div>
    `;

    item.addEventListener('click', (e) => {
      // Toggle quiz visibility
      const quiz = item.querySelector('.ll-sidebar-quiz') as HTMLElement;
      const isVisible = quiz.style.display === 'block';
      
      // Close others
      sidebar.querySelectorAll('.ll-sidebar-quiz').forEach(q => (q as HTMLElement).style.display = 'none');
      
      if (!isVisible) {
        quiz.style.display = 'block';
        const input = quiz.querySelector('input') as HTMLInputElement;
        input.focus();
      }
    });

    const input = item.querySelector('input') as HTMLInputElement;
    const feedback = item.querySelector('.ll-sidebar-feedback') as HTMLElement;

    input.addEventListener('click', (e) => e.stopPropagation());
    input.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        const guess = input.value.trim();
        if (!guess) return;

        feedback.textContent = 'Checking...';
        feedback.className = 'll-sidebar-feedback checking';

        chrome.runtime.sendMessage({ type: 'CHECK_GUESS', word, guess, lang, expected: translation }, (correct) => {
          if (correct) {
            feedback.textContent = '✅ Correct! +15 🪙';
            feedback.className = 'll-sidebar-feedback correct';
            chrome.runtime.sendMessage({ type: 'ADD_CREDITS', uid, amount: 15 });
            setTimeout(() => {
              item.classList.add('completed');
              item.querySelector('.ll-sidebar-word')!.textContent = `${word} → ${translation}`;
            }, 1000);
          } else {
            feedback.textContent = '❌ Try again!';
            feedback.className = 'll-sidebar-feedback wrong';
          }
        });
      }
    });

    list.appendChild(item);
  });

  sidebar.appendChild(list);
  document.body.appendChild(sidebar);
}
