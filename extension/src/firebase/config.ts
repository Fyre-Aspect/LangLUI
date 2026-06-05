declare const INSERTKEY: string;
declare const FIREBASEAUTHDOMAIN: string;
declare const PROJECTID: string;
declare const STORAGEBUCKET: string;
declare const SENDERID: string;
declare const APPID: string;
declare const MEASUREMENTID: string;

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: INSERTKEY,
  authDomain: FIREBASEAUTHDOMAIN,
  projectId: PROJECTID,
  storageBucket: STORAGEBUCKET,
  messagingSenderId: SENDERID,
  appId: APPID,
  measurementId: MEASUREMENTID,
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
