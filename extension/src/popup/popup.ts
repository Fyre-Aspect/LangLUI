import { initializeApp } from "firebase/app";
import { getAuth, signInWithCredential, GoogleAuthProvider, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBeoK3maD-HOG_-KibN47AqzRUGxUhfW9c",
  authDomain: "langlua-f910b.firebaseapp.com",
  projectId: "langlua-f910b",
  storageBucket: "langlua-f910b.firebasestorage.app",
  messagingSenderId: "722900477082",
  appId: "1:722900477082:web:e35dfa96ebd3946636eb23",
  measurementId: "G-3HMGQRCZH2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", async () => {
  const unauthView = document.getElementById("unauth-view");
  const authView = document.getElementById("auth-view");
  const langLbl = document.getElementById("lang-lbl");
  const creditsLbl = document.getElementById("credits-lbl");
  
  const storageObj = await chrome.storage.local.get(["uid"]) as { uid: string };
  
  if (storageObj.uid) {
    unauthView?.classList.add("hidden");
    authView?.classList.remove("hidden");
    
    // Fetch stats
    try {
      const snap = await getDoc(doc(db, "users", storageObj.uid));
      if (snap.exists()) {
        const data = snap.data();
        if (langLbl) langLbl.innerText = data.targetLanguage.toUpperCase();
        if (creditsLbl) creditsLbl.innerText = `🪙 ${data.credits}`;
      }
    } catch(e) {
      console.error(e);
    }
  } else {
    unauthView?.classList.remove("hidden");
    authView?.classList.add("hidden");
  }

  document.getElementById("btn-login")?.addEventListener("click", () => {
    chrome.identity.getAuthToken({ interactive: true }, (token: any) => {
      if (chrome.runtime.lastError || !token) {
        console.error(chrome.runtime.lastError);
        return;
      }
      const credential = GoogleAuthProvider.credential(null, token);
      signInWithCredential(auth, credential).then((result) => {
        chrome.storage.local.set({ uid: result.user.uid }, () => {
          window.location.reload();
        });
      }).catch(console.error);
    });
  });

  document.getElementById("btn-dash")?.addEventListener("click", () => {
    chrome.tabs.create({ url: "http://localhost:3000/dashboard" });
  });

  document.getElementById("btn-logout")?.addEventListener("click", () => {
    signOut(auth).then(() => {
      chrome.storage.local.clear(() => {
        window.location.reload();
      });
    });
  });
});
