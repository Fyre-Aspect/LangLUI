import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
export const auth = getAuth(app);
export const db = getFirestore(app);

export const SUPPORTED_LANGUAGES = [
  { code: "ja", name: "Japanese",            flag: "🇯🇵" },
  { code: "es", name: "Spanish",             flag: "🇪🇸" },
  { code: "fr", name: "French",              flag: "🇫🇷" },
  { code: "de", name: "German",              flag: "🇩🇪" },
  { code: "ko", name: "Korean",              flag: "🇰🇷" },
  { code: "pt", name: "Portuguese",          flag: "🇧🇷" },
  { code: "it", name: "Italian",             flag: "🇮🇹" },
  { code: "zh", name: "Chinese (Simplified)",flag: "🇨🇳" },
  { code: "ar", name: "Arabic",              flag: "🇸🇦" },
  { code: "hi", name: "Hindi",               flag: "🇮🇳" },
];
