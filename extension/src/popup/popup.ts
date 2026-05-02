import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithCredential, GoogleAuthProvider, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            FIREBASE_API_KEY,
  authDomain:        FIREBASE_AUTH_DOMAIN,
  projectId:         FIREBASE_PROJECT_ID,
  storageBucket:     FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId:             FIREBASE_APP_ID,
};

const app  = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

const DASHBOARD_URL = "http://localhost:3000/dashboard";

async function reloadAllTabs() {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (tab.id && tab.url && !tab.url.startsWith("chrome://") && !tab.url.startsWith("chrome-extension://")) {
      chrome.tabs.reload(tab.id).catch(() => {});
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const unauthView   = document.getElementById("unauth-view");
  const authView     = document.getElementById("auth-view");
  const langLbl      = document.getElementById("lang-lbl");
  const intensityLbl = document.getElementById("intensity-lbl");
  const creditsVal   = document.getElementById("credits-val");
  const streakVal    = document.getElementById("streak-val");
  const appLink      = document.getElementById("link-app") as HTMLAnchorElement | null;

  if (appLink) appLink.href = DASHBOARD_URL;

  const storageObj = await chrome.storage.local.get(["uid"]) as { uid?: string };

  if (storageObj.uid) {
    unauthView?.classList.add("hidden");
    authView?.classList.remove("hidden");

    try {
      const snap = await getDoc(doc(db, "users", storageObj.uid));
      if (snap.exists()) {
        const data = snap.data();
        const lang = data.targetLanguage ?? "ja";
        const langNames: Record<string, string> = {
          ja: "🇯🇵 Japanese", es: "🇪🇸 Spanish", fr: "🇫🇷 French",
          de: "🇩🇪 German",  ko: "🇰🇷 Korean",  pt: "🇧🇷 Portuguese",
          it: "🇮🇹 Italian", zh: "🇨🇳 Chinese",  ar: "🇸🇦 Arabic", hi: "🇮🇳 Hindi",
        };
        if (langLbl)      langLbl.textContent      = langNames[lang] ?? lang.toUpperCase();
        if (intensityLbl) intensityLbl.textContent  = String(data.intensity ?? 5);
        if (creditsVal)   creditsVal.textContent    = String(data.credits ?? 0);
        if (streakVal)    streakVal.textContent      = `${data.streak ?? 0} days`;
      }
    } catch (e) {
      console.error(e);
    }
  } else {
    unauthView?.classList.remove("hidden");
    authView?.classList.add("hidden");
  }

  document.getElementById("btn-login")?.addEventListener("click", () => {
    chrome.identity.getAuthToken({ interactive: true }, async (token) => {
      if (chrome.runtime.lastError || !token) {
        console.error(chrome.runtime.lastError);
        return;
      }
      try {
        const credential = GoogleAuthProvider.credential(null, token);
        const result = await signInWithCredential(auth, credential);
        await new Promise<void>((resolve) =>
          chrome.storage.local.set({ uid: result.user.uid }, resolve)
        );
        // Reload all tabs so content scripts pick up the new uid
        await reloadAllTabs();
        window.location.reload();
      } catch (e) {
        console.error("Sign-in failed", e);
      }
    });
  });

  document.getElementById("btn-dash")?.addEventListener("click", () => {
    chrome.tabs.create({ url: DASHBOARD_URL });
  });

  document.getElementById("btn-logout")?.addEventListener("click", async () => {
    try {
      await signOut(auth);
      await new Promise<void>((resolve) => chrome.storage.local.clear(resolve));
      window.location.reload();
    } catch (e) {
      console.error("Sign-out failed", e);
    }
  });
});
