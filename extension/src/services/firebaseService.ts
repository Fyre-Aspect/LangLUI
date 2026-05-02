import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc, increment } from "firebase/firestore";

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
const db = getFirestore(app);

export const getUserPrefs = async (uid: string) => {
  const docRef = doc(db, "users", uid);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const data = snap.data();
    return { targetLanguage: data.targetLanguage, intensity: data.intensity };
  }
  return { targetLanguage: "ja", intensity: 5 };
};

export const addCredits = async (uid: string, amount: number) => {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, {
    credits: increment(amount)
  });
};
