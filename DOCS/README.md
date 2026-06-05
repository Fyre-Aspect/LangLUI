# LangLua

> **Learn languages by living the web.**
> LangLua replaces words on any webpage with their translations, turning your daily browsing into passive language immersion — with pronunciation, gamified quizzes, and AI-powered definitions.

---

## What is LangLua?

LangLua is a two-part application:
- A **web app** for managing your progress (optional)
- A **Chrome extension** that silently works in the background, replacing words on every page you visit with their translated counterparts!

When you hover over a replaced word, you get:
1. **Audio pronunciation** via ElevenLabs TTS
2. **Definitions** — guess what the word means and earn credits!
3. **AI-powered definition** via Gemini if you just want to learn passively

Progress is stored locally in the extension (no login required).

---

## Features

| Feature | Description |
|---|---|
| **Word Replacement** | Intelligently replaces a percentage of words on any English webpage with the language of choice |
| **Intensity Control** | Slider from 1–10 controls what percentage of words are replaced |
| **Pronunciation** | ElevenLabs multilingual TTS reads the translated word aloud on hover |
| **Definition Quiz** | Guess the meaning for credits — Gemini checks if your answer is acceptable |
| **AI Definitions** | Get a simple definition from Gemini anytime |
| **LinguaCoins** | Credit system rewards guessing and daily streaks |
| **Streak Tracker** | Daily active streak with milestone bonuses |
| **Local Sign-In** | A local-only "Sign in with Google" button for quick access |
| **4 Languages** | Japanese, Spanish, French, Hindi |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Web App Frontend** | React 18, TypeScript, Vite |
| **Web App Styling** | CSS Variables (custom design system), Lucide Icons |
| **Backend / DB** | None (local storage only) |
| **Authentication** | None (local-only access) |
| **Extension** | Chrome Extension Manifest V3, TypeScript, Webpack |
| **AI Translations** | Google Gemini API (`gemini-2.0-flash`) |
| **AI Definitions** | Google Gemini API |
| **Pronunciation** | ElevenLabs Text-to-Speech (`eleven_multilingual_v2`) |
| **Hosting** | Optional (static web app) |

---

## 📁 Project Structure

```
langlua/
├── webapp/           # React + TypeScript web dashboard
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── hooks/
│
└── extension/        # Chrome Extension (Manifest V3)
    └── src/
        ├── background/   # Service worker
        ├── content/      # DOM injection & tooltip
      ├── popup/        # Extension popup UI
      └── services/     # Gemini, ElevenLabs
```

---

## Setup & Installation

### Prerequisites

- Node.js >= 18
- npm >= 9
- A modern Chromium-based browser (Chrome, Edge, Brave)
- No backend or auth required

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

To deploy the web app, use any static hosting provider.

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

### Testing the Extension

1. Ensure `extension/.env` contains:
   - `GEMINI_API_KEY`
   - `ELEVENLABS_API_KEY`
   - `ELEVENLABS_VOICE_ID`
2. Run `npm run build` in `extension/`.
3. Reload the extension in `chrome://extensions`.
4. Click the extension icon and press "Sign in with Google" (local-only).
5. Visit any English webpage and confirm translations appear on load.

---

## Local Storage Shape

The extension stores a small local profile in `chrome.storage.local`:

```typescript
{
   uid: string,
   targetLanguage: string,
   intensity: number,
   credits: number,
   streak: number,
   lastActiveDate: string
}
```

---

## 🌍 Supported Languages

Japanese 🇯🇵 
Spanish 🇪🇸 
French 🇫🇷 
Hindi 🇮🇳 

---

## 🛠️ Development Notes

### Extension Rebuild After Changes
The extension must be rebuilt and reloaded in Chrome after any source change:
```bash
# In /extension
npm run build
# Then go to chrome://extensions → click refresh on LangLua
```


---

## Roadmap
- [ ] Leaderboard (top LinguaCoin earners)
- [ ] Spaced repetition review mode
- [ ] Support for non-English source pages
- [ ] Firefox extension port
- [ ] Mobile app (React Native)
- [ ] Custom vocabulary lists
- [ ] Multiplayer word challenges

---

## Team

Built at EurekaHacks 2026
By Aamir, Jeevithan, and Arnav
---
