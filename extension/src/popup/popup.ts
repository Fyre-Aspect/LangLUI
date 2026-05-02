import { initBorderGlow } from "./borderGlow";

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
      chrome.tabs.reload(tab.id).catch(() => {});
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  initBorderGlow("border-glow-card", { animated: true });

  const unauthView   = document.getElementById("unauth-view");
  const authView     = document.getElementById("auth-view");
  const langSelect   = document.getElementById("lang-select") as HTMLSelectElement;
  const intensityLbl = document.getElementById("intensity-lbl");
  const creditsVal   = document.getElementById("credits-val");
  const streakVal    = document.getElementById("streak-val");
  const toggleActive = document.getElementById("toggle-active") as HTMLInputElement;

  const storageObj = await chrome.storage.local.get(["uid", "isActive"]) as { uid?: string, isActive?: boolean };

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

  if (storageObj.uid) {
    unauthView?.classList.add("hidden");
    authView?.classList.remove("hidden");

    await ensureDefaults();
    await updateStreak();

    // Try Out Mode toggle
    const tryoutToggle = document.getElementById("tryout-toggle") as HTMLInputElement;
    const modeHint     = document.getElementById("mode-hint");
    const tryOutData   = await chrome.storage.local.get("tryOutMode") as { tryOutMode?: boolean };
    const tryOutMode   = tryOutData.tryOutMode ?? false;
    if (tryoutToggle) {
      tryoutToggle.checked = tryOutMode;
      if (modeHint) modeHint.style.display = tryOutMode ? "block" : "none";
      tryoutToggle.addEventListener("change", async (e) => {
        const checked = (e.target as HTMLInputElement).checked;
        await chrome.storage.local.set({ tryOutMode: checked });
        if (modeHint) modeHint.style.display = checked ? "block" : "none";
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
          chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_TRYOUT", value: checked });
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
        await reloadActiveTab();
      });
    }

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
  } else {
    unauthView?.classList.remove("hidden");
    authView?.classList.add("hidden");
  }

  document.getElementById("btn-login")?.addEventListener("click", async () => {
    await chrome.storage.local.set({ uid: "local-user", isActive: true });
    await ensureDefaults();
    await updateStreak();
    await reloadActiveTab();
    window.location.reload();
  });

  document.getElementById("btn-logout")?.addEventListener("click", async () => {
    await new Promise<void>((resolve) => chrome.storage.local.clear(resolve));
    window.location.reload();
  });
});

export {};
