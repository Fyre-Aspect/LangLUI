# 🧠 LangLua — Logic Chart & Architecture Guide

> This document is written for **GitHub Copilot / AI coding assistants**.
> Follow each section in order. Each section maps to a file or feature you must implement.

---

## 0. Project Overview

**LangLua** is a two-part application:
1. **Web App** (`/webapp`) — React + TypeScript + Node.js backend. Handles auth, user preferences, credit tracking, vocabulary history.
2. **Chrome Extension** (`/extension`) — TypeScript + Chrome Extension Manifest V3. Injects into web pages to replace words, show pronunciation via ElevenLabs, and provide definitions via Gemini.

They communicate via **Firebase** (shared auth token + Firestore database).

---

## 1. Repository Structure

```
langlua/
├── webapp/                          # React + TypeScript frontend
│   ├── public/
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── LanguageBadge.tsx
│   │   │   ├── CreditBar.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── WordCard.tsx
│   │   ├── pages/
│   │   │   ├── Landing.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── Settings.tsx
│   │   ├── firebase/
│   │   │   ├── config.ts            # Firebase initialization
│   │   │   └── auth.ts              # Auth helpers
│   │   ├── services/
│   │   │   ├── userService.ts       # Firestore CRUD for user profiles
│   │   │   └── vocabularyService.ts # Save/fetch learned words
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useCredits.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── extension/                       # Chrome Extension (Manifest V3)
│   ├── manifest.json
│   ├── src/
│   │   ├── background/
│   │   │   └── background.ts        # Service worker: auth sync, message routing
│   │   ├── content/
│   │   │   ├── content.ts           # Main injector: word scanning & replacing
│   │   │   ├── tooltip.ts           # Tooltip DOM builder
│   │   │   └── styles.css           # Injected styles for replaced words + tooltip
│   │   ├── popup/
│   │   │   ├── popup.html
│   │   │   ├── popup.ts
│   │   │   └── popup.css
│   │   ├── services/
│   │   │   ├── geminiService.ts     # Gemini API calls for definitions
│   │   │   ├── elevenLabsService.ts # ElevenLabs TTS for pronunciation
│   │   │   ├── translationService.ts# Word selection + translation logic
│   │   │   └── firebaseService.ts   # Read/write credits & vocab to Firestore
│   │   └── utils/
│   │       ├── wordSelector.ts      # Choose which words to replace
│   │       └── storage.ts           # chrome.storage.local helpers
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## 2. Full System Flowchart

```
╔══════════════════════════════════════════════════════════════════╗
║                        USER JOURNEY                              ║
╚══════════════════════════════════════════════════════════════════╝

[User visits langlua.app]
        │
        ▼
[Landing Page] ──── [Sign Up / Log In]
                            │
                    Firebase Auth (Google/Email)
                            │
                            ▼
                    [User Doc Created in Firestore]
                    {
                      uid: string,
                      email: string,
                      targetLanguage: string,       ← e.g. "ja" (Japanese)
                      intensity: number,            ← 1–10 (how many words replaced)
                      credits: number,              ← starts at 0
                      streak: number,
                      lastActiveDate: timestamp,
                      vocabulary: []                ← learned words
                    }
                            │
                            ▼
                    [Dashboard] — user sets language + intensity
                            │
                            ▼
              ┌─────────────────────────────────┐
              │  User installs Chrome Extension  │
              │  → Opens Extension Popup        │
              │  → Clicks "Sign In with Google" │
              │  → Firebase Auth (same account) │
              │  → Token stored in             │
              │    chrome.storage.local         │
              └──────────────┬──────────────────┘
                             │
                             ▼
              ╔══════════════════════════════════╗
              ║      EXTENSION CONTENT SCRIPT    ║
              ╚══════════════════════════════════╝
                             │
              [Tab loads → content.ts fires]
                             │
                             ▼
              1. Fetch user prefs from Firestore
                 (targetLanguage, intensity)
                             │
                             ▼
              2. wordSelector.ts scans DOM text nodes
                 - Walk all text nodes in document.body
                 - Tokenize into words
                 - Filter: common words, nouns, verbs
                   (skip: stopwords, numbers, URLs)
                 - Pick N words based on intensity setting
                   intensity 1-3:  5% of words
                   intensity 4-6: 15% of words
                   intensity 7-10: 30% of words
                             │
                             ▼
              3. translationService.ts
                 - Batch call: Gemini API
                   POST /v1beta/models/gemini-pro:generateContent
                   Prompt: "Translate these words to {language}: [word1, word2...]
                            Return ONLY a JSON object: { word: translation }"
                 - Cache translations in chrome.storage.local
                   (avoid re-translating same words on reload)
                             │
                             ▼
              4. content.ts replaces words in DOM
                 - Wrap each matched word in:
                   <span class="langlua-word"
                         data-original="hello"
                         data-translation="こんにちは"
                         data-language="ja">
                     こんにちは
                   </span>
                 - Inject styles.css into page
                             │
                             ▼
              5. User hovers over a .langlua-word span
                             │
                     tooltip.ts fires
                             │
                ┌────────────┴─────────────────────┐
                │         TOOLTIP SHOWN             │
                │                                   │
                │  [🔊 Play Pronunciation]           │
                │   └─ elevenLabsService.ts         │
                │      POST /v1/text-to-speech/{id} │
                │      voice: multilingual model    │
                │      text: translation word       │
                │      → returns audio blob         │
                │      → new Audio(blobURL).play()  │
                │                                   │
                │  Original: "hello"                │
                │  Translated: "こんにちは"          │
                │                                   │
                │  [💡 What do you think it means?] │
                │   └─ User types guess             │
                │   └─ [Submit]                     │
                │       │                           │
                │   ┌───┴──────────┐                │
                │   │ Gemini Check │                │
                │   │ "Is '{guess}'│                │
                │   │ a correct or │                │
                │   │ acceptable   │                │
                │   │ definition   │                │
                │   │ of '{word}'?"│                │
                │   └───┬──────────┘                │
                │     ✓ Correct    ✗ Wrong           │
                │       │              │            │
                │   +10 credits   Show correct      │
                │   green flash   definition        │
                │   confetti      red shake         │
                │       │              │            │
                │   ┌───┴──────────────┘            │
                │   Save word to Firestore          │
                │   vocabulary array                │
                │                                   │
                │  [Or: Show definition instead →]  │
                │   └─ Gemini API call:             │
                │      "Define '{original word}'    │
                │       in simple English"          │
                │   └─ Show response in tooltip     │
                │   (No credits for this path)      │
                └───────────────────────────────────┘
                             │
                             ▼
              6. Credits written to Firestore
                 db.collection('users').doc(uid)
                   .update({ credits: increment(10) })
                             │
                             ▼
              7. Streak update (background.ts)
                 - On any credit event, check lastActiveDate
                 - If different day → increment streak
                 - If 2+ days gap → reset streak to 1
```

---

## 3. Firebase Data Schema

### Collection: `users`
Document ID = Firebase Auth UID

```typescript
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  targetLanguage: string;        // ISO 639-1 code: "ja", "es", "fr", "ko", etc.
  intensity: number;             // 1–10
  credits: number;               // total LinguaCoins earned
  streak: number;                // consecutive active days
  lastActiveDate: string;        // "YYYY-MM-DD"
  createdAt: Timestamp;
}
```

### Sub-collection: `users/{uid}/vocabulary`
Document ID = auto-generated

```typescript
interface VocabularyEntry {
  original: string;              // "hello"
  translation: string;           // "こんにちは"
  language: string;              // "ja"
  guessedCorrectly: boolean;
  timesEncountered: number;
  firstSeenAt: Timestamp;
  lastSeenAt: Timestamp;
}
```

---

## 4. API Integration Details

### 4.1 Firebase Configuration

**File**: `webapp/src/firebase/config.ts`

```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

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
export const analytics = getAnalytics(app);
```

### 4.2 Gemini API — Translation (Batch)

**File**: `extension/src/services/translationService.ts`

```typescript
const GEMINI_API_KEY = "AIzaSyC0NDbA1GhusH5YHr2f4L7YhUMK5O94PyU";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function translateWords(
  words: string[],
  targetLanguage: string
): Promise<Record<string, string>> {
  const prompt = `
    Translate the following English words into ${targetLanguage}.
    Return ONLY a valid JSON object with no markdown, no explanation.
    Format: { "word": "translation", ... }
    Words: ${JSON.stringify(words)}
  `;

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  // Strip markdown fences if present
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}
```

### 4.3 Gemini API — Definition

**File**: `extension/src/services/geminiService.ts`

```typescript
export async function getDefinition(word: string): Promise<string> {
  const prompt = `
    Define the English word "${word}" in one or two simple sentences.
    Be concise. No formatting, no bullet points.
  `;

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const data = await response.json();
  return data.candidates[0].content.parts[0].text.trim();
}

export async function checkGuess(
  word: string,
  guess: string
): Promise<boolean> {
  const prompt = `
    Is "${guess}" an acceptable or correct definition of the word "${word}"?
    Be lenient — partial understanding counts.
    Reply with ONLY the word "yes" or "no". Nothing else.
  `;

  const response = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const data = await response.json();
  const answer = data.candidates[0].content.parts[0].text.trim().toLowerCase();
  return answer === "yes";
}
```

### 4.4 ElevenLabs API — Pronunciation

**File**: `extension/src/services/elevenLabsService.ts`

```typescript
const ELEVEN_LABS_API_KEY = "sk_8a7a2a8957bb806497506a635b22f970080797881992ea28";
// Use the "Multilingual v2" model for best non-English pronunciation
const VOICE_ID = "pNInz6obpgDQGcFmaJgB"; // "Adam" voice — clear, neutral
const ELEVEN_LABS_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

export async function playPronunciation(text: string): Promise<void> {
  const response = await fetch(ELEVEN_LABS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": ELEVEN_LABS_API_KEY,
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    })
  });

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
  // Revoke object URL after playback to free memory
  audio.onended = () => URL.revokeObjectURL(audioUrl);
}
```

---

## 5. Extension Manifest (Manifest V3)

**File**: `extension/manifest.json`

```json
{
  "manifest_version": 3,
  "name": "LangLua",
  "version": "1.0.0",
  "description": "Learn languages by living the web. Words on any page become your classroom.",
  "permissions": [
    "storage",
    "activeTab",
    "scripting",
    "identity"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "background": {
    "service_worker": "dist/background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["dist/content.js"],
      "css": ["src/content/styles.css"],
      "run_at": "document_idle"
    }
  ],
  "action": {
    "default_popup": "src/popup/popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

---

## 6. Word Selection Algorithm

**File**: `extension/src/utils/wordSelector.ts`

```
ALGORITHM:

1. Walk all TEXT_NODE nodes in document.body using TreeWalker
   - Skip: <script>, <style>, <noscript>, <textarea>, <input>, <code>
   - Skip text nodes with < 3 characters

2. For each text node, tokenize by whitespace and punctuation

3. Filter each word:
   - Length: 4–15 characters
   - Must match /^[a-zA-Z]+$/ (English letters only)
   - Must NOT be in STOPWORD_LIST
     (common: "the", "and", "for", "with", "that", "this", "have", etc.)
   - Must NOT be a proper noun heuristic (all caps or capitalized mid-sentence)

4. From qualified words, randomly sample based on intensity:
   intensity 1–3  → keep 5% of qualified words
   intensity 4–6  → keep 15% of qualified words
   intensity 7–10 → keep 30% of qualified words

5. Deduplicate: if the same word appears multiple times, replace ALL occurrences
   but only fetch translation once

6. Return: Map<string, TextNode[]>
   key = original word, value = all DOM nodes containing that word

7. After translation dict comes back from Gemini:
   - For each TextNode, split text content around the word
   - Build: [TextNode("before"), <span class="langlua-word">, TextNode("after")]
   - Replace original TextNode with this fragment
```

---

## 7. Auth Sync Between Extension and Web App

```
PROBLEM: Chrome extensions run in an isolated context.
Firebase Auth session from the webapp is NOT available in the extension.

SOLUTION: Shared Firebase Auth via chrome.identity + custom token

FLOW:
1. Extension popup shows "Sign in with Google" button
2. On click: chrome.identity.getAuthToken({ interactive: true })
   → returns Google OAuth token
3. Send token to Firebase:
   GoogleAuthProvider.credential(null, googleToken)
   signInWithCredential(auth, credential)
4. On success: store { uid, idToken } in chrome.storage.local
5. All Firestore calls from extension use this uid
6. On webapp login, same Firebase project → same Firestore data
   → credits, vocabulary, settings are unified

BACKGROUND SERVICE WORKER:
- Listen for chrome.storage.onChanged events
- On auth change: re-fetch user preferences from Firestore
- Cache to chrome.storage.local for content script fast access:
  { targetLanguage, intensity, credits }
```

---

## 8. Gamification Credit System

```
ACTION                          CREDITS
──────────────────────────────────────────
Correct definition guess         +10 credits
Second correct guess (same word) +5  credits (diminishing)
Open tooltip (just for looking)  +1  credit  (encourages exploration)
Daily streak bonus (logged in)   +25 credits
Streak milestone (7 days)        +100 credits badge unlock

SPENDING CREDITS (future features):
- Unlock new languages            200 credits
- Custom replacement themes       100 credits
- Vocabulary quiz review mode     Free

IMPLEMENTATION:
- credits field in Firestore: always use increment(n) not set()
  → safe for concurrent updates from multiple tabs
- Credit events emitted as custom browser events for animation triggers
- Extension popup polls credits from Firestore every 30 seconds
```

---

## 9. Step-by-Step Build Order for Copilot

Follow this exact order to build LangLua:

```
PHASE 1 — Web App Foundation
─────────────────────────────
Step 1:  scaffold with Vite
         > npm create vite@latest webapp -- --template react-ts

Step 2:  install dependencies
         > cd webapp
         > npm install firebase react-router-dom lucide-react

Step 3:  create webapp/src/firebase/config.ts
         (use Firebase config from section 4.1)

Step 4:  create webapp/src/firebase/auth.ts
         - signInWithGoogle() using GoogleAuthProvider
         - signUpWithEmail(email, password)
         - signInWithEmail(email, password)
         - signOut()
         - onAuthStateChanged listener

Step 5:  create webapp/src/services/userService.ts
         - createUserProfile(uid, email, displayName)
           → writes to Firestore users/{uid}
         - getUserProfile(uid) → reads document
         - updateLanguage(uid, lang)
         - updateIntensity(uid, intensity)

Step 6:  create all pages (Landing, Login, Signup, Dashboard, Settings)

Step 7:  wire up React Router in App.tsx with protected routes

Step 8:  create Dashboard with:
         - Language selector (dropdown, 10 languages)
         - Intensity slider (1–10)
         - Credit display
         - Vocabulary list (last 20 learned words)

PHASE 2 — Chrome Extension
─────────────────────────────
Step 9:  create extension/manifest.json (from section 5)

Step 10: install extension dev dependencies
         > cd extension
         > npm install --save-dev typescript webpack webpack-cli ts-loader copy-webpack-plugin

Step 11: create extension/src/utils/wordSelector.ts

Step 12: create extension/src/services/translationService.ts (Gemini)

Step 13: create extension/src/services/elevenLabsService.ts (ElevenLabs)

Step 14: create extension/src/services/geminiService.ts (definition + guess check)

Step 15: create extension/src/content/styles.css (injected styles)

Step 16: create extension/src/content/tooltip.ts (build tooltip DOM)

Step 17: create extension/src/content/content.ts (main orchestrator)

Step 18: create extension/src/background/background.ts (auth sync)

Step 19: create extension/src/popup/popup.html + popup.ts

Step 20: configure webpack to bundle background.ts → dist/background.js
         and content.ts → dist/content.js

PHASE 3 — Testing & Polish
─────────────────────────────
Step 21: Load unpacked extension in chrome://extensions

Step 22: Test on a simple English news article

Step 23: Verify Firestore credits update after correct guess

Step 24: Verify streak updates correctly

Step 25: Deploy webapp to Firebase Hosting
         > firebase deploy --only hosting
```

---

## 10. Environment & Build Notes

### Web App (Vite)
```
- Node.js >= 18
- All Firebase config is hardcoded (not .env) for hackathon speed
- Build: npm run build → dist/
- Dev: npm run dev → http://localhost:5173
```

### Extension (Webpack)
```
webpack.config.js entry points:
  entry: {
    background: './src/background/background.ts',
    content: './src/content/content.ts',
    popup: './src/popup/popup.ts'
  },
  output: { path: path.resolve(__dirname, 'dist') }

After build:
  Load /extension folder as unpacked in chrome://extensions
  (Enable Developer Mode first)
```

### Languages Supported (MVP)
```typescript
export const SUPPORTED_LANGUAGES = [
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "es", name: "Spanish",  flag: "🇪🇸" },
  { code: "fr", name: "French",   flag: "🇫🇷" },
  { code: "de", name: "German",   flag: "🇩🇪" },
  { code: "ko", name: "Korean",   flag: "🇰🇷" },
  { code: "pt", name: "Portuguese", flag: "🇧🇷" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "zh", name: "Chinese (Simplified)", flag: "🇨🇳" },
  { code: "ar", name: "Arabic",  flag: "🇸🇦" },
  { code: "hi", name: "Hindi",   flag: "🇮🇳" },
];
```
