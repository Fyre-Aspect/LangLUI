import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore, doc, getDoc, updateDoc, increment,
  addDoc, collection, serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey:            FIREBASE_API_KEY,
  authDomain:        FIREBASE_AUTH_DOMAIN,
  projectId:         FIREBASE_PROJECT_ID,
  storageBucket:     FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId:             FIREBASE_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const getUserPrefs = async (uid: string) => {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return { targetLanguage: "ja", intensity: 5 };
  const data = snap.data();
  return { targetLanguage: data.targetLanguage, intensity: data.intensity };
};

export const addCredits = async (uid: string, amount: number) => {
  await updateDoc(doc(db, "users", uid), { credits: increment(amount) });
};

export const saveVocabWord = async (uid: string, entry: {
  original: string; translation: string; language: string; guessedCorrectly: boolean;
}) => {
  await addDoc(collection(db, "users", uid, "vocabulary"), {
    ...entry,
    timesEncountered: 1,
    firstSeenAt: serverTimestamp(),
    lastSeenAt: serverTimestamp(),
  });
};

export const updateStreak = async (uid: string) => {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return;
  const { streak, lastActiveDate } = snap.data();
  const today = new Date().toISOString().split("T")[0];
  if (lastActiveDate === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const newStreak = lastActiveDate === yesterday ? (streak || 0) + 1 : 1;
  await updateDoc(doc(db, "users", uid), {
    streak: newStreak,
    lastActiveDate: today,
    credits: increment(25),
  });
};
