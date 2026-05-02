export function buildSaveWordModal(
  word: string,
  translation: string,
  lang: string,
  proficiencyLevel: number,
  onSave: () => void
) {
  const modal = document.createElement('div');
  modal.className = 'll-save-modal-overlay';

  const langLabel = lang.toUpperCase();
  const remainingSlots = Math.max(1, Math.min(10, 15 - Math.floor(proficiencyLevel * 1.5)));

  modal.innerHTML = `
    <div class="ll-save-modal">
      <div class="ll-save-header">
        <h3 class="ll-save-title">Save Word</h3>
        <button class="ll-save-close" aria-label="Close">✕</button>
      </div>

      <div class="ll-save-word-preview">
        <span class="ll-save-original">${escHtml(word)}</span>
        <span class="ll-save-arrow">→</span>
        <span class="ll-save-translation">${escHtml(translation)}</span>
        <span class="ll-save-lang-badge">${langLabel}</span>
      </div>

      <div class="ll-save-divider"></div>

      <div class="ll-save-info">
        <div class="ll-save-feature">
          <span class="ll-save-icon">🧠</span>
          <div>
            <p class="ll-save-feature-title">Adaptive Learning</p>
            <p class="ll-save-feature-desc">Based on your proficiency level, we automatically adjust how many new words you learn at once.</p>
          </div>
        </div>
        <div class="ll-save-capacity">
          <p class="ll-save-capacity-text">You can save</p>
          <div class="ll-capacity-indicator">
            <span class="ll-capacity-count">${remainingSlots} more words</span>
            <p class="ll-capacity-sublabel">at your current level</p>
          </div>
        </div>
      </div>

      <div class="ll-save-divider"></div>

      <div class="ll-save-actions">
        <button class="ll-save-btn ll-save-btn-primary">Add to Vocabulary</button>
        <button class="ll-save-btn ll-save-btn-ghost">Not Now</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('.ll-save-close') as HTMLButtonElement;
  const saveBtn = modal.querySelector('.ll-save-btn-primary') as HTMLButtonElement;
  const notNowBtn = modal.querySelector('.ll-save-btn-ghost') as HTMLButtonElement;

  const close = () => {
    modal.classList.add('ll-save-modal-closing');
    setTimeout(() => modal.remove(), 250);
  };

  closeBtn.addEventListener('click', close);
  notNowBtn.addEventListener('click', close);
  saveBtn.addEventListener('click', () => {
    saveBtn.innerHTML = '✓ Saved!';
    saveBtn.disabled = true;
    setTimeout(() => {
      onSave();
      close();
    }, 600);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  // Trigger entrance animation
  setTimeout(() => modal.classList.add('ll-save-modal-visible'), 0);
}

export function removeSaveModal() {
  const modal = document.querySelector('.ll-save-modal-overlay');
  if (modal) {
    modal.classList.add('ll-save-modal-closing');
    setTimeout(() => modal.remove(), 250);
  }
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
