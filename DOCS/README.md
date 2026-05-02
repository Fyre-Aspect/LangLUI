# 🌐 LangLua

> **Learn languages by living the web.**
> LangLua replaces words on any webpage with their translations, turning your daily browsing into passive language immersion — with pronunciation, gamified quizzes, and AI-powered definitions.

---

## ✨ What is LangLua?

LangLua is a two-part application:
- A **web app** where you sign in, pick your target language, and manage your progress
- A **Chrome extension** that silently works in the background, replacing words on every page you visit with their translated equivalents

When you hover over a replaced word, you get:
1. 🔊 **Audio pronunciation** via ElevenLabs TTS
2. 💡 **A definition challenge** — guess what the word means and earn credits
3. 📖 **AI-powered definition** via Gemini if you just want to learn passively

All progress syncs in real time through Firebase — your credits, streak, and vocabulary follow you across every tab.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🔄 **Word Replacement** | Intelligently replaces a percentage of words on any English webpage with their target-language equivalents |
| 🎚️ **Intensity Control** | Slider from 1–10 controls what percentage of words are replaced (5% to 30%) |
| 🔊 **Pronunciation** | ElevenLabs multilingual TTS reads the translated word aloud on hover |
| 💬 **Definition Quiz** | Guess the meaning for credits — Gemini checks if your answer is acceptable |
| 📖 **AI Definitions** | Get a simple definition from Gemini anytime |
| 🪙 **LinguaCoins** | Credit system rewards guessing and daily streaks |
| 🔥 **Streak Tracker** | Daily active streak with milestone bonuses |
| 📚 **Vocabulary History** | Review every word you've encountered in the dashboard |
| 🔐 **Firebase Auth** | Google sign-in shared between the webapp and extension |
| 🌍 **10 Languages** | Japanese, Spanish, French, German, Korean, Portuguese, Italian, Chinese, Arabic, Hindi |

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Web App Frontend** | React 18, TypeScript, Vite |
| **Web App Styling** | CSS Variables (custom design system), Lucide Icons |
| **Backend / DB** | Firebase Firestore (NoSQL) |
| **Authentication** | Firebase Auth (Google OAuth + Email/Password) |
| **Extension** | Chrome Extension Manifest V3, TypeScript, Webpack |
| **AI Translations** | Google Gemini API (`gemini-2.0-flash`) |
| **AI Definitions** | Google Gemini API |
| **Pronunciation** | ElevenLabs Text-to-Speech (`eleven_multilingual_v2`) |
| **Hosting** | Firebase Hosting |

---

## 📁 Project Structure

```
langlua/
├── webapp/           # React + TypeScript web dashboard
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── firebase/
│       ├── services/
│       └── hooks/
│
└── extension/        # Chrome Extension (Manifest V3)
    └── src/
        ├── background/   # Service worker
        ├── content/      # DOM injection & tooltip
        ├── popup/        # Extension popup UI
        └── services/     # Gemini, ElevenLabs, Firebase
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js >= 18
- npm >= 9
- A modern Chromium-based browser (Chrome, Edge, Brave)
- Firebase account (already configured — see credentials below)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/langlua.git
cd langlua
```

---

### 2. Set Up the Web App

```bash
cd webapp
npm install
npm run dev
```

The app runs at `http://localhost:5173`

To build for production:
```bash
npm run build
```

To deploy to Firebase Hosting:
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only hosting
```

---

### 3. Set Up the Chrome Extension

```bash
cd extension
npm install
npm run build
```

This outputs bundled files to `extension/dist/`.

**Load the extension in Chrome:**
1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer Mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `extension/` folder (the root, not `/dist`)
5. The LangLua extension icon should appear in your toolbar

**Watch mode (for development):**
```bash
npm run watch
```
After each save, go to `chrome://extensions` and click the refresh icon on the LangLua card.

---

## 🔑 API Keys & Firebase Config

All credentials are preconfigured in the codebase. Here is a reference:

### Firebase (`webapp/src/firebase/config.ts`)
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyBeoK3maD-HOG_-KibN47AqzRUGxUhfW9c",
  authDomain: "langlua-f910b.firebaseapp.com",
  projectId: "langlua-f910b",
  storageBucket: "langlua-f910b.firebasestorage.app",
  messagingSenderId: "722900477082",
  appId: "1:722900477082:web:e35dfa96ebd3946636eb23",
  measurementId: "G-3HMGQRCZH2"
};
```

### Gemini API
```
Key: AIzaSyC0NDbA1GhusH5YHr2f4L7YhUMK5O94PyU
Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
```

### ElevenLabs
```
Key: sk_8a7a2a8957bb806497506a635b22f970080797881992ea28
Voice: pNInz6obpgDQGcFmaJgB (Adam, multilingual)
Model: eleven_multilingual_v2
```

---

## 🗺️ How It Works — Step by Step

```
1. User signs up at langlua.app
   → Firebase Auth creates account
   → Firestore document created: users/{uid}

2. User selects target language + intensity on dashboard
   → Saved to Firestore

3. User installs Chrome extension
   → Signs in through extension popup (same Firebase account)
   → Auth token stored in chrome.storage.local

4. User browses any English webpage
   → Content script loads after page idle
   → Fetches user preferences from Firestore (via background worker)
   → Scans DOM text nodes for qualifying English words
   → Filters by stopwords, length, and character type
   → Randomly samples based on intensity setting
   → Sends word list to Gemini for batch translation

5. Gemini returns translation map { word: translation }
   → Content script wraps each matched word in a <span class="langlua-word">
   → Replaced text shows the translated word
   → Original word stored in data-original attribute

6. User hovers over replaced word
   → Tooltip appears with:
      a) Play button → ElevenLabs speaks the translated word
      b) Guess input → User types definition → Gemini validates
         → Correct: +10 credits, green animation, word saved
         → Wrong: red shake, correct definition shown
      c) "Show definition" button → Gemini returns simple English definition

7. Credits increment in Firestore
   → Dashboard updates in real time
   → Streak checked and updated
```

---

## 🪙 Gamification System

| Action | Credits |
|---|---|
| Correct definition guess | +10 🪙 |
| Repeat correct guess (same word) | +5 🪙 |
| Opening a tooltip | +1 🪙 |
| Daily active streak | +25 🪙/day |
| 7-day streak milestone | +100 🪙 |

Credits are stored in Firestore using `increment()` for concurrency safety (safe across multiple browser tabs).

---

## 🧩 Firestore Data Schema

### `users/{uid}`
```typescript
{
  uid: string,
  email: string,
  displayName: string,
  targetLanguage: string,   // "ja", "es", "fr", etc.
  intensity: number,        // 1–10
  credits: number,
  streak: number,
  lastActiveDate: string,   // "YYYY-MM-DD"
  createdAt: Timestamp
}
```

### `users/{uid}/vocabulary/{docId}`
```typescript
{
  original: string,         // "ephemeral"
  translation: string,      // "エフェメラル" (phonetic) or "一時的な"
  language: string,         // "ja"
  guessedCorrectly: boolean,
  timesEncountered: number,
  firstSeenAt: Timestamp,
  lastSeenAt: Timestamp
}
```

---

## 🌍 Supported Languages (MVP)

| Language | Code | Flag |
|---|---|---|
| Japanese | `ja` | 🇯🇵 |
| Spanish | `es` | 🇪🇸 |
| French | `fr` | 🇫🇷 |
| German | `de` | 🇩🇪 |
| Korean | `ko` | 🇰🇷 |
| Portuguese | `pt` | 🇧🇷 |
| Italian | `it` | 🇮🇹 |
| Chinese (Simplified) | `zh` | 🇨🇳 |
| Arabic | `ar` | 🇸🇦 |
| Hindi | `hi` | 🇮🇳 |

---

## 🛠️ Development Notes

### Extension Rebuild After Changes
The extension must be rebuilt and reloaded in Chrome after any source change:
```bash
# In /extension
npm run build
# Then go to chrome://extensions → click refresh on LangLua
```

### Firestore Security Rules (for production)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
      match /vocabulary/{vocabId} {
        allow read, write: if request.auth.uid == uid;
      }
    }
  }
}
```

### Caching Strategy
- Translations are cached in `chrome.storage.local` keyed by `{word}_{language}`
- Cache TTL: 7 days (to avoid burning Gemini quota)
- Clear cache: extension popup has a hidden debug menu (triple-click logo)

### Rate Limits
| API | Limit | Our Usage Pattern |
|---|---|---|
| Gemini API | 15 req/min (free tier) | Batch translations = 1 request per page load |
| ElevenLabs | 10k characters/month (free) | Short words only, user-triggered |
| Firestore | 50k reads/day (free tier) | Cached aggressively |

---

## 🏗️ Roadmap

### MVP (Hackathon)
- [x] Firebase Auth (Google sign-in)
- [x] Web app dashboard with language + intensity settings
- [x] Chrome extension content script with word replacement
- [x] ElevenLabs pronunciation on hover
- [x] Gemini definition validation (guess quiz)
- [x] Credit system + streak tracking
- [x] Vocabulary history in dashboard

### Post-MVP
- [ ] Leaderboard (top LinguaCoin earners)
- [ ] Spaced repetition review mode
- [ ] Support for non-English source pages
- [ ] Firefox extension port
- [ ] Mobile app (React Native)
- [ ] Custom vocabulary lists
- [ ] Multiplayer word challenges

---

## 👤 Team

Built at [Hackathon Name] — [Date]

Inspired by [GlossPlus1](https://devpost.com/software/glossplusone) — an amazing project that proved in-place word replacement is a powerful learning paradigm. LangLua takes this further with AI validation, speech synthesis, and a full gamification layer.

---

## 📄 License

MIT License. See `LICENSE` for details.

---

*"The best way to learn a language is to live in it. LangLua brings the language to wherever you already live — the web."*
