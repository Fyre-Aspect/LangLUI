import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
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
