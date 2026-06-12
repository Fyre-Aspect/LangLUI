# LangLua

> **Learn languages by living the web.**
> LangLua replaces words on any webpage with their translations, turning your daily browsing into passive language immersion with pronunciation, gamified quizzes, and AI-powered definitions.

---

## What is LangLua?
- A **Chrome extension** that silently works in the background, replacing words on every page you visit with their translations in your desired language!

When you hover over a replaced word, you get:
1. **Audio pronunciation** via ElevenLabs TTS
2. **Definitions** — guess what the word means and earn credits
3. **AI-powered definition** via Gemini if you just want to learn passively

Supported Languages - Hindi, Japanese, and Spanish.

Progress is stored locally in the extension (no login required).

---

## Features

| Feature | Description |
|---|---|
| **Word Replacement** | Replaces a percentage of words on any English webpage with the language of choice |
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
| **Extension** | Chrome Extension Manifest V3, TypeScript, Webpack |
| **AI Translations & Definitions** | Google Gemini API (`gemini-2.0-flash`) |
| **Pronunciation** | ElevenLabs Text-to-Speech (`eleven_multilingual_v2`) |

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

### 2. Set Up the Chrome Extension

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

After each save, go to `chrome://extensions` and click the refresh icon on the LangLua card.


---

## Future Things to Come
- [ ] Leaderboard (top LinguaCoin earners)
- [ ] Spaced repetition review mode
- [ ] Support for non-English source pages
- [ ] Mobile app (React Native)
- [ ] Custom vocabulary lists
- [ ] Multiplayer word challenges

---

## AI Usage
- Gemini is used for translations.
- ElevenLabs used for Audio translations.
- Used AI to code basic backend setup and frontend architecture.

## Team

Built at EurekaHacks 2026
By Aamir, Jeevithan, and Arnav
---

https://github.com/user-attachments/assets/f2ff83e0-2a1b-4aea-a528-d60efe85450d
