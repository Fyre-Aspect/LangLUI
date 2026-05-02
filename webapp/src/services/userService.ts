import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

export const createUserProfile = async (uid: string, email: string | null, displayName: string | null) => {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    uid,
    email: email || "",
    displayName: displayName || "User",
    targetLanguage: "ja",
    intensity: 5,
    credits: 0,
    streak: 0,
    lastActiveDate: "",
    createdAt: serverTimestamp()
  }, { merge: true });
};

export const getUserProfile = async (uid: string) => {
  const userRef = doc(db, "users", uid);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
};

export const updateLanguage = async (uid: string, lang: string) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { targetLanguage: lang });
};

export const updateIntensity = async (uid: string, intensity: number) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { intensity });
};
