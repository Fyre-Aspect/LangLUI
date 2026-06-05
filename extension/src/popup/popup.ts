import { initBorderGlow } from "./borderGlow";

import {
  signInWithCredential,
  GoogleAuthProvider,
} from "firebase/auth";
import { firebaseApp, auth } from "../firebase/config";

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

/**
 * Sign in with Google using chrome.identity.launchWebAuthFlow.
 * This is the correct method for unpacked / dev extensions — getAuthToken
 * silently fails unless the extension is published to the Chrome Web Store.
 * We build the Google OAuth URL manually, open Chrome's auth flow, then
 * parse the access token from the redirect URL and sign into Firebase.
 */
async function signInWithGoogle(): Promise<void> {
  const CLIENT_ID = "118999772188-f8a0tq5a630628f18mhrusmp1sungpp9.apps.googleusercontent.com";
  // Chrome extensions use this special redirect URI format
  const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;

  const authUrl =
    `https://accounts.google.com/o/oauth2/auth` +
    `?client_id=${encodeURIComponent(CLIENT_ID)}` +
    `&response_type=token` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent("openid email profile")}`;

  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      { url: authUrl, interactive: true },
      async (responseUrl) => {
        if (chrome.runtime.lastError || !responseUrl) {
          reject(new Error(chrome.runtime.lastError?.message ?? "Auth flow was cancelled or failed"));
          return;
        }
        // Extract access_token from the redirect URL hash fragment
        const url = new URL(responseUrl);
        const params = new URLSearchParams(url.hash.replace("#", ""));
        const accessToken = params.get("access_token");
        if (!accessToken) {
          reject(new Error("No access_token found in redirect URL"));
          return;
        }
        try {
          const credential = GoogleAuthProvider.credential(null, accessToken);
          const result = await signInWithCredential(auth, credential);
          console.log("✅ Signed in as:", result.user.uid);
          await chrome.storage.local.set({ uid: result.user.uid, isActive: true });
          await ensureDefaults();
          await updateStreak();
          await reloadActiveTab();
          window.location.reload();
          resolve();
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  initBorderGlow("border-glow-card", { animated: true });

  const unauthView = document.getElementById("unauth-view");
  const authView = document.getElementById("auth-view");
  const langSelect = document.getElementById("lang-select") as HTMLSelectElement;
  const intensityLbl = document.getElementById("intensity-lbl");
  const creditsVal = document.getElementById("credits-val");
  const streakVal = document.getElementById("streak-val");
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

  // Error display helper
  const showError = (msg: string) => {
    let errEl = document.getElementById("signin-error");
    if (!errEl) {
      errEl = document.createElement("p");
      errEl.id = "signin-error";
      errEl.style.cssText = "color:#f87171;font-size:11px;margin:8px 0 0;text-align:center;";
      document.getElementById("btn-login")?.insertAdjacentElement("afterend", errEl);
    }
    errEl.textContent = msg;
  };

  document.getElementById("btn-login")?.addEventListener("click", async () => {
    const btn = document.getElementById("btn-login") as HTMLButtonElement;
    const errEl = document.getElementById("signin-error");
    if (errEl) errEl.textContent = "";
    if (btn) { btn.disabled = true; btn.textContent = "Signing in…"; }
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("❌ Google sign-in failed:", err);
      showError(err?.message ?? "Sign-in failed. Check the console for details.");
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 18 18" fill="none">
          <path fill="#fff" fill-opacity=".9" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.131 17.64 11.823 17.64 9.2z"/>
          <path fill="#fff" fill-opacity=".75" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
          <path fill="#fff" fill-opacity=".6" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
          <path fill="#fff" fill-opacity=".85" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
        </svg> Sign in with Google`;
      }
    }
  });
});

export { };
