import { initBorderGlow } from "./borderGlow";
import { generateDailyQuiz, QuizQuestion } from "../services/quizService";
import { getWordStatistics } from "../services/statsService";

const DEFAULT_PREFS = { targetLanguage: "es", intensity: 5 };
const DEFAULT_STATS = { credits: 0, streak: 0, lastActiveDate: "" };

const getToday = () => new Date().toISOString().split("T")[0];

const ensureDefaults = async () => {
  const result = await chrome.storage.local.get([
    "targetLanguage",
    "intensity",
    "credits",
    "streak",
    "lastActiveDate",
  ]);

  const updates: Record<string, unknown> = {};
  if (result.targetLanguage === undefined) updates.targetLanguage = DEFAULT_PREFS.targetLanguage;
  if (result.intensity === undefined) updates.intensity = DEFAULT_PREFS.intensity;
  if (result.credits === undefined) updates.credits = DEFAULT_STATS.credits;
  if (result.streak === undefined) updates.streak = DEFAULT_STATS.streak;
  if (result.lastActiveDate === undefined) updates.lastActiveDate = DEFAULT_STATS.lastActiveDate;

  if (Object.keys(updates).length > 0) {
    await chrome.storage.local.set(updates);
  }
};

const updateStreak = async () => {
  const today = getToday();
  const result = await chrome.storage.local.get(["streak", "lastActiveDate"]);
  const lastActiveDate = result.lastActiveDate ?? "";
  const streak = Number(result.streak ?? 0);

  if (lastActiveDate === today) return;

  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const newStreak = lastActiveDate === yesterday ? streak + 1 : 1;
  await chrome.storage.local.set({ streak: newStreak, lastActiveDate: today });
};

async function reloadActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  for (const tab of tabs) {
    if (tab.id && tab.url && !tab.url.startsWith("chrome://") && !tab.url.startsWith("chrome-extension://")) {
      chrome.tabs.reload(tab.id).catch(() => { });
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  initBorderGlow("border-glow-card", { animated: true });

  const authView = document.getElementById("auth-view");
  const langSelect = document.getElementById("lang-select") as HTMLSelectElement;
  const intensityLbl = document.getElementById("intensity-lbl");
  const creditsVal = document.getElementById("credits-val");
  const streakVal = document.getElementById("streak-val");
  const toggleActive = document.getElementById("toggle-active") as HTMLInputElement;
  const historyCount = document.getElementById("history-count");
  const difficultyBreakdown = document.getElementById("difficulty-breakdown");
  const startQuizBtn = document.getElementById("start-quiz-btn");
  const exportHistoryBtn = document.getElementById("export-history-btn");
  const clearHistoryBtn = document.getElementById("clear-history-btn");
  const quizPanel = document.getElementById("quiz-panel");
  const quizQuestion = document.getElementById("quiz-question");
  const quizOptions = document.getElementById("quiz-options");
  const quizFeedback = document.getElementById("quiz-feedback");
  const closeQuizBtn = document.getElementById("close-quiz-btn");

  // Always show auth view since there's no authentication needed
  authView?.classList.remove("hidden");

  await ensureDefaults();
  await updateStreak();

  const storageObj = await chrome.storage.local.get(["isActive"]) as { isActive?: boolean };

  if (storageObj.isActive !== undefined && toggleActive) {
    toggleActive.checked = storageObj.isActive;
  }

  if (toggleActive) {
    toggleActive.addEventListener("change", async (e) => {
      const isChecked = (e.target as HTMLInputElement).checked;
      await chrome.storage.local.set({ isActive: isChecked });
      await reloadActiveTab();
    });
  }

  const hideQuizPanel = () => {
    if (quizPanel) quizPanel.classList.add("hidden");
  };

  const showQuizPanel = () => {
    if (quizPanel) quizPanel.classList.remove("hidden");
  };

  const formatDifficultyBreakdown = (stats: { easy: number; medium: number; hard: number }) =>
    `E:${stats.easy} M:${stats.medium} H:${stats.hard}`;

  const refreshWordStats = async (selectedLang: string) => {
    try {
      const stats = await getWordStatistics(selectedLang);
      if (historyCount) historyCount.textContent = String(stats.totalWords);
      if (difficultyBreakdown) difficultyBreakdown.textContent = formatDifficultyBreakdown(stats);
    } catch (error) {
      console.error('[LangLua] Failed to refresh word stats:', error);
    }
  };

  const buildOptionButton = (option: string, onClick: () => void) => {
    const button = document.createElement('button');
    button.className = 'btn btn-ghost';
    button.textContent = option;
    button.addEventListener('click', onClick);
    return button;
  };

  let quizQuestions: QuizQuestion[] = [];
  let quizIndex = 0;

  const renderQuizQuestion = () => {
    if (!quizQuestion || !quizOptions || !quizFeedback) return;
    const question = quizQuestions[quizIndex];
    if (!question) {
      quizQuestion.textContent = 'No quiz questions available yet.';
      quizOptions.innerHTML = '';
      quizFeedback.textContent = '';
      return;
    }
    quizQuestion.textContent = `Translate "${question.word}"`;
    quizOptions.innerHTML = '';
    quizFeedback.textContent = '';

    question.options.forEach((option) => {
      const button = buildOptionButton(option, () => {
        const correct = option === question.translation;
        quizFeedback.textContent = correct ? '✅ Correct! Great job.' : `❌ Try again — the answer is ${question.translation}`;
        quizFeedback.style.color = correct ? '#16A34A' : '#DC2626';
        if (correct) {
          quizIndex += 1;
          setTimeout(() => {
            if (quizIndex >= quizQuestions.length) {
              quizQuestion.textContent = 'Quiz complete! Nice work.';
              quizOptions.innerHTML = '';
            } else {
              renderQuizQuestion();
            }
          }, 800);
        }
      });
      quizOptions.appendChild(button);
    });
  };

  const exportHistory = async () => {
    const data = await chrome.storage.local.get(null) as Record<string, any>;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `langlua-history-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (startQuizBtn) {
    startQuizBtn.addEventListener('click', async () => {
      quizQuestions = await generateDailyQuiz((langSelect?.value as string) || DEFAULT_PREFS.targetLanguage, 5);
      quizIndex = 0;
      if (!quizQuestions.length) {
        if (quizQuestion) quizQuestion.textContent = 'No words saved yet. Browse the web to collect translations and try again.';
        if (quizOptions) quizOptions.innerHTML = '';
        if (quizFeedback) quizFeedback.textContent = '';
        showQuizPanel();
        return;
      }
      showQuizPanel();
      renderQuizQuestion();
    });
  }

  if (exportHistoryBtn) {
    exportHistoryBtn.addEventListener('click', exportHistory);
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', async () => {
      const lang = (langSelect?.value as string) || DEFAULT_PREFS.targetLanguage;
      await chrome.storage.local.remove([`history_${lang}`]);
      await refreshWordStats(lang);
      if (quizFeedback) quizFeedback.textContent = 'History cleared for the current language.';
      showQuizPanel();
    });
  }

  if (closeQuizBtn) {
    closeQuizBtn.addEventListener('click', hideQuizPanel);
  }

  hideQuizPanel();

  // Practice Mode toggle
  const practiceToggle = document.getElementById("practice-toggle") as HTMLInputElement;
  const modeHint = document.getElementById("mode-hint");
  const practiceData = await chrome.storage.local.get("practiceMode") as { practiceMode?: boolean };
  const practiceMode = practiceData.practiceMode ?? false;
  if (practiceToggle) {
    practiceToggle.checked = practiceMode;
    if (modeHint) modeHint.style.display = practiceMode ? "block" : "none";
    practiceToggle.addEventListener("change", async (e) => {
      const checked = (e.target as HTMLInputElement).checked;
      await chrome.storage.local.set({ practiceMode: checked });
      if (modeHint) modeHint.style.display = checked ? "block" : "none";
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_PRACTICE", value: checked });
      }
    });
  }

  const data = await chrome.storage.local.get([
    "targetLanguage",
    "intensity",
    "credits",
    "streak",
  ]) as { targetLanguage?: string; intensity?: number; credits?: number; streak?: number; };

  const lang = (data as any).targetLanguage ?? DEFAULT_PREFS.targetLanguage;

  if (langSelect) {
    langSelect.value = String(lang);
    langSelect.addEventListener("change", async (e) => {
      const newLang = (e.target as HTMLSelectElement).value;
      await chrome.storage.local.set({ targetLanguage: newLang });
      await refreshWordStats(newLang);
      await reloadActiveTab();
    });
  }

  await refreshWordStats(lang);

  const intensitySlider = document.getElementById("intensity-slider") as HTMLInputElement;
  if (intensitySlider) {
    intensitySlider.value = String(data.intensity ?? DEFAULT_PREFS.intensity);
    if (intensityLbl) intensityLbl.textContent = intensitySlider.value;

    intensitySlider.addEventListener("input", (e) => {
      const val = (e.target as HTMLInputElement).value;
      if (intensityLbl) intensityLbl.textContent = val;
    });

    intensitySlider.addEventListener("change", async (e) => {
      const val = Number((e.target as HTMLInputElement).value);
      await chrome.storage.local.set({ intensity: val });
      await reloadActiveTab();
    });
  }
  if (creditsVal) creditsVal.textContent = String(data.credits ?? DEFAULT_STATS.credits);
  if (streakVal) streakVal.textContent = `${data.streak ?? DEFAULT_STATS.streak} days`;
});

export { };
