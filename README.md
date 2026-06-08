# LangLua

LangLua is a living language learning companion built to make the web your classroom. It blends content translation, practice, and long-term learning into a browser extension experience that grows with each page you browse.

This README is intentionally expansive — it documents the product, the implementation, the extension architecture, the features that matter long term, the way the project is structured, and the kinds of improvements that make LangLua feel like a platform rather than a one-time experiment.

---

## Table of Contents

1. Overview
2. What Makes LangLua Useful
3. Quick Start
4. Core Features
5. Extension Architecture
6. Service and Data Flow
7. Popup Experience
8. Content Script Behavior
9. Translation Strategy
10. History and Quiz System
11. Statistics and Progress Tracking
12. Keyboard Shortcuts and Productivity
13. Long-Term Growth
14. Design Principles
15. Development Workflow
16. Build and Release
17. Contribution Guide
18. Troubleshooting
19. Appendix
20. Future Roadmap
21. Very Long-Term Notes

---

## 1. Overview

LangLua is designed to let you learn a language while you browse the web. Rather than switch apps or memorize lists, LangLua keeps learning embedded in the pages you already read.

Key ideas:

- Learn by living on the web.
- Find words in context.
- Practice quickly and frequently.
- Build a persistent history of words and translations.
- Track progress and use data to refine your learning.

This project is a chrome-compatible extension with a lightweight service layer for translation, storage, and analytics.

---

## 2. What Makes LangLua Useful

LangLua is useful because it is low friction. It does not require a separate app session. Instead, it listens to what you already do online and upgrades those interactions into language practice.

Core value proposition:

- Quick translation in the browser.
- Practice prompts that fit into normal browsing.
- Visual highlighting and contextual quizzes.
- Daily review through a quiz flow.
- Storage of words and difficulty metadata.
- Reports that surface your learning progress.

This is not just a translation tool; it is a practice engine.

### 2.1 Good For Long-Term Use

LangLua is built for daily use. It preserves state with `chrome.storage.local`, it keeps a history of past words, and it surfaces long-term progress metrics.

Because the extension is lightweight, it can stay active without overwhelming performance, and it can accumulate data over time.

### 2.2 Good For Casual Learn-Farming

The extension supports farm-style learning: you can let words collect in your history, then revisit them repeatedly via quizzes and stats.

This makes it a good companion for both purpose-driven study and casual time accumulation.

---

## 3. Quick Start

### 3.1 Install Dependencies

```bash
cd extension
npm install
```

### 3.2 Build the Extension

```bash
npm run build
```

### 3.3 Load in Chrome

1. Open `chrome://extensions/`
2. Enable Developer Mode
3. Click `Load unpacked`
4. Select the `extension/dist` directory

### 3.4 Try It Out

1. Open a web page with text.
2. Toggle the extension on.
3. Select practice mode or leave it in live translation mode.
4. Check the popup for credits, streaks, and history.

### 3.5 Optional: Watch Mode

```bash
npm run watch
```

This keeps webpack rebuilding while you work.

---

## 4. Core Features

LangLua now offers multiple useful features:

- Persistent translation history
- Difficulty classification for words
- Daily quiz generation from history
- Progress stats and difficulty breakdown
- Exportable learning logs
- Keyboard shortcuts for toggling modes
- Background command handling for fast access
- Popup UI that surfaces learning metrics
- Local caching of translations
- Automatic practice mode toggling in the browser

Each feature is designed to support long-term learning.

### 4.1 History Tracker

A history tracker saves every translated word by language, difficulty, and timestamp. This lets you review what you already practiced.

### 4.2 Difficulty Levels

Words are automatically classified as easy, medium, or hard based on length.

This classification is intentionally simple, but it is easy to extend later with frequency, n-gram data, or usage statistics.

### 4.3 Daily Quiz Mode

The extension can now generate a daily quiz using the words in your history.

The daily quiz is meant to bring review into your actual browsing session.

### 4.4 Statistics Dashboard

The popup includes a dashboard showing:

- total words collected
- easy / medium / hard breakdown
- history count
- streak information
- credits

This is useful for understanding progress at a glance.

### 4.5 Keyboard Shortcuts

LangLua supports command palette shortcuts to:

- toggle practice mode
- open the sidebar quickly

These shortcuts make the extension feel more like a product than a one-off script.

---

## 5. Extension Architecture

The extension is organized into three main layers:

1. `popup/` — UI for configuration, stats, and quick actions.
2. `content/` — page scripts that annotate the web and manage practice mode.
3. `services/` — internal logic for translation, history, quiz generation, and stats.

Supporting files include:

- `manifest.json` — extension metadata and permissions.
- `webpack.config.js` — build settings.
- `popup.html` / `popup.css` — popup UI markup and styles.

### 5.1 Popup Layer

The popup is the user-facing control center. It displays:

- language selection
- intensity slider
- practice mode toggle
- credits and streak values
- history and difficulty metrics
- quiz controls
- export buttons

This is where you interact with the extension and see your progress.

### 5.2 Content Layer

The content script scans web pages and replaces or highlights words based on your settings.

It also listens for practice mode toggles from the popup.

### 5.3 Services Layer

The services layer contains reusable modules:

- `translationService.ts`
- `historyService.ts`
- `quizService.ts`
- `statsService.ts`
- `elevenLabsService.ts`
- `geminiService.ts`

These modules are intentionally isolated from the UI, so they can be used by multiple components.

---

## 6. Service and Data Flow

LangLua relies on local storage and caching to keep data persistent and fast.

### 6.1 Translation Flow

The translation flow works as follows:

1. The page script identifies a set of words.
2. It sends the words to the background or popup service.
3. `translationService` checks local cache first.
4. If missing, it fetches translations from Google Translate.
5. Results are cached to `chrome.storage.local`.
6. Translations are stored in history along with difficulty data.

### 6.2 History Flow

History is stored per-language under keys such as:

- `history_ja`
- `history_es`

Each entry includes:

- original word
- translated word
- difficulty level
- timestamp

### 6.3 Quiz Flow

Quiz questions are assembled from the most recent history entries. Each question includes:

- a prompt word
- the correct translation
- three distractor translations from history

This keeps quizzes relevant and varied.

### 6.4 Stats Flow

Stats are derived from the history entries.

The `statsService` computes:

- total word count
- easy / medium / hard counts
- last seen timestamp

These are surfaced in the popup UI.

---

## 7. Popup Experience

The popup is intentionally compact and information-rich.

### 7.1 What You Can Do in the Popup

- select your target language
- adjust intensity
- toggle practice mode
- start a daily quiz
- export your learning log
- clear word history for the current language
- see word difficulty breakdown
- track your streak and credits

### 7.2 Popup UI Guidelines

The popup uses simple buttons and stat cards. The goal is to keep the learning experience fast and actionable.

### 7.3 Popup Styling

The popup uses a rounded card aesthetic with soft colors. It is designed to feel modern and calm.

### 7.4 UX Notes

- The `Start Daily Quiz` button opens a dedicated panel.
- The export button downloads your local storage as JSON.
- The clear history action resets the history for just the current language.

This gives you control without losing the simplicity of the main UI.

---

## 8. Content Script Behavior

The content script is the part of LangLua that lives inside web pages.

### 8.1 What the Content Script Does

- scans text nodes for candidate words
- replaces or annotates words as needed
- renders tooltips and practice elements
- observes DOM changes to stay current on dynamic pages
- listens for practice mode toggles

### 8.2 Practice Mode

In practice mode, LangLua keeps a sidebar or quiz overlay active while you browse.

The content script reloads the page when practice mode is toggled, ensuring the latest page state is kept.

### 8.3 Messaging

The content script listens for messages such as:

- `TOGGLE_PRACTICE`
- `OPEN_SIDEBAR`

This allows the background or popup to control the current page.

---

## 9. Translation Strategy

LangLua uses a layered translation strategy.

### 9.1 Common Translations First

A local `COMMON_TRANSLATIONS` dictionary is checked before asking any external service.

This reduces network usage and gives instant results for high-frequency words.

### 9.2 Local Cache Second

The extension caches translations in `chrome.storage.local` with a time-to-live of 30 days.

This ensures repeated work is avoided and the extension remains fast.

### 9.3 External Fetch Third

For uncached words, LangLua uses the Google Translate unofficial endpoint.

If a translation returns successfully, it is stored in the local cache and saved to history.

### 9.4 Difficulty Assignment

Every word is assigned a difficulty level immediately after translation.

The current heuristic is length-based:

- <= 4 letters -> easy
- <= 7 letters -> medium
- > 7 letters -> hard

This heuristic is intentionally lightweight and easy to improve.

---

## 10. History and Quiz System

The history and quiz system is where long-term learning is captured.

### 10.1 History Service

`historyService.ts` provides:

- `addWordHistory`
- `getWordHistory`
- `clearWordHistory`

History entries are capped at 250 words per language to keep storage efficient.

### 10.2 Quiz Service

`quizService.ts` provides:

- `generateDailyQuiz`

It selects words from history and creates multiple-choice questions.

### 10.3 Stats Service

`statsService.ts` provides:

- `getWordStatistics`

This service aggregates a word count, difficulty counts, and last-seen timestamp.

### 10.4 Learning Loop

The learning loop looks like this:

1. Word is translated.
2. Word is saved in history.
3. Difficulty is assigned.
4. Word appears in stats.
5. Word may be selected for quiz review.

This loop keeps the product useful long term.

---

## 11. Statistics and Progress Tracking

LangLua surfaces progress through its popup and through storage.

### 11.1 Scoreboard

The popup shows:

- credits
- streak
- total words
- difficulty breakdown

### 11.2 Progress Metrics

Progress metrics are intentionally broad rather than strict.

The goal is to help learners notice growth without punishing them for imperfect sessions.

### 11.3 Activity History

Word history is preserved per language, so users can switch languages and preserve each language's timeline.

### 11.4 Export

The export feature allows you to download your local state as a JSON file.

This is useful for manual backups, analysis, or migrating data later.

---

## 12. Keyboard Shortcuts and Productivity

LangLua adds keyboard shortcuts to make learning faster.

### 12.1 Defined Shortcuts

The extension defines two commands:

- `Ctrl+Shift+P` / `Command+Shift+P` — toggle practice mode
- `Ctrl+Shift+S` / `Command+Shift+S` — open the sidebar

These are defined in `manifest.json` and handled in `background.ts`.

### 12.2 Why Shortcuts Matter

Shortcuts keep the extension from feeling like a separate app.

They let learners stay in flow while still controlling the practice experience.

### 12.3 Future Shortcut Ideas

- quick quiz start
- mark word as learned
- toggle history panel
- jump to next word

These are potential long-term enhancements.

---

## 13. Long-Term Growth

LangLua is designed to evolve.

### 13.1 Data-Driven Improvements

The extension stores history and statistics so future features can be data-driven.

Examples:

- spaced repetition scheduling
- difficulty calibration based on actual performance
- multi-word phrase support
- personalization based on browsing patterns

### 13.2 Extensibility

The codebase is structured to support extensions:

- popup code is isolated from service logic
- content script logic is isolated from popup logic
- service modules are reusable and composable

This makes it easier to add new features without rewriting the whole stack.

### 13.3 Long-Term Feature Ideas

- context-aware flashcards
- auto-translation hints in reading mode
- project-specific vocabulary sets
- integrated speech and pronunciation practice
- web-based progress dashboard

Each item above is a natural extension of the current architecture.

---

## 14. Design Principles

LangLua follows a set of design principles intended for long-lived products.

### 14.1 Keep It Simple

The UI should be simple and unobtrusive.

The extension should not overwhelm users with too much information.

### 14.2 Keep It Useful

Every added feature should serve the learning loop.

Avoid features that do not clearly support translation, practice, or progress.

### 14.3 Keep It Flexible

Settings like intensity, language, and practice mode should be easy to change.

This lets users use the extension in different contexts and with different goals.

### 14.4 Keep It Persistent

Data should be preserved.

Local storage is used for all user state, so progress survives reloads and restarts.

### 14.5 Keep It Modular

The codebase is modular to allow future growth.

This README documents each module so new developers can understand the system quickly.

---

## 15. Development Workflow

### 15.1 Directory Structure

The key folders are:

- `extension/` — Chrome extension code and build config
- `extension/src/popup` — popup UI and logic
- `extension/src/content` — content script logic
- `extension/src/services` — support services and utilities
- `extension/src/utils` — shared utility code

### 15.2 How to Work on Features

1. Add or update a service in `extension/src/services`.
2. Add UI interactions in `extension/src/popup`.
3. Add page interactions in `extension/src/content`.
4. Run `npm run build` to verify.
5. Load the `dist` folder in Chrome to test.

### 15.3 Build Commands

```bash
cd extension
npm install
npm run build
npm run watch
```

### 15.4 Debugging

If the extension fails to load:

- check the Chrome console for content script errors
- check the Extension background console for service worker errors
- verify the `manifest.json` commands and permissions
- ensure the `dist` folder contains the generated files

### 15.5 Iteration Tips

- Keep service logic small and reusable.
- Avoid putting too much state into the popup.
- Use `chrome.storage.local` for persistency.
- Keep the popup fast and responsive.

---

## 16. Build and Release

### 16.1 Packaging

The extension build output is generated in `extension/dist`.

This includes:

- `manifest.json`
- `popup.html`
- `popup.js`
- `popup.css`
- `background.js`
- `content.js`
- `styles.css`

### 16.2 Publishing

To publish to the Chrome Web Store, upload the `dist` folder.

Before publishing:

- update the version number in `extension/manifest.json`
- verify the extension icon and branding if present
- test in Developer Mode

### 16.3 Release Notes

Each release should include:

- new features
- bug fixes
- performance improvements
- docs updates

This README can serve as a release notes companion.

---

## 17. Contribution Guide

### 17.1 How to Contribute

1. Fork the repository.
2. Make your changes in a branch.
3. Run the extension build.
4. Open a pull request.
5. Describe the change clearly.

### 17.2 Coding Standards

- Keep TypeScript types clear.
- Prefer small reusable services.
- Keep the popup and content scripts separate.
- Prefer descriptive variable and function names.

### 17.3 Testing Changes

Test by:

- reloading the extension in Chrome
- exercising the popup features
- checking that history and quiz updates persist
- verifying the translation caching behavior

### 17.4 Documentation

Updates to this README are encouraged for any user-facing or architectural change.

If you add features, document them here.

---

## 18. Troubleshooting

### 18.1 Build Issues

If webpack fails:

- run `npm install`
- verify package versions
- check for TypeScript syntax errors

### 18.2 Extension Load Errors

If Chrome rejects the extension:

- verify `manifest.json` is valid JSON
- check permissions and host permissions
- ensure `dist/` has all copied files

### 18.3 Missing Popup UI

If popup UI does not appear:

- confirm `popup.html` exists in `dist`
- confirm `manifest.json` has `action.default_popup`
- reload the extension in Chrome

### 18.4 History Not Saving

If history is missing:

- confirm `translationService` calls `addWordHistory`
- check `chrome.storage.local` for `history_<lang>` keys
- refresh the page after changing language

### 18.5 Quiz Not Starting

If quiz does not start:

- ensure there is at least one history entry
- verify the popup script mounts the quiz button
- check the Chrome extension console for errors

---

## 19. Appendix

### 19.1 Language Codes

The extension supports the following codes:

- `ja` — Japanese
- `es` — Spanish
- `fr` — French
- `hi` — Hindi
- `ko` — Korean
- `pt` — Portuguese
- `it` — Italian
- `zh` — Chinese
- `ar` — Arabic
- `de` — German

### 19.2 Storage Keys

Current storage keys used by the extension:

- `targetLanguage`
- `intensity`
- `credits`
- `streak`
- `lastActiveDate`
- `practiceMode`
- `isActive`
- `history_<lang>`
- `t__<word>__<lang>`

### 19.3 Service File Responsibilities

- `translationService.ts` — translation and caching logic
- `historyService.ts` — word history persistence
- `quizService.ts` — quiz generation logic
- `statsService.ts` — metrics aggregation
- `elevenLabsService.ts` — audio generation API
- `geminiService.ts` — AI service integration

### 19.4 Popup State Flow

The popup loads state from storage, then updates the UI:

1. load defaults
2. sync with storage
3. attach event listeners
4. refresh stats
5. launch quiz or export functions

### 19.5 Content Script Activation

The content script only runs on permissioned pages and uses `document_idle` by default.

This means it executes after page load and can process dynamic updates reliably.

---

## 20. Future Roadmap

The roadmap below is intentionally broad. It is meant to capture long-term ideas that keep the extension useful for weeks, months, or years.

### 20.1 Near-Term Enhancements

- improved difficulty calibration
- multi-word phrase support
- spaced repetition integration
- language-specific word tagging
- better quiz question types

### 20.2 Medium-Term Enhancements

- browser sync / export import workflows
- personalized learning recommendations
- content-specific vocabulary lists
- pronunciation scoring
- dashboard analytics page

### 20.3 Long-Term Enhancements

- synced user accounts
- cross-device progress
- offline word review mode
- more advanced AI coaching prompts
- gamified streak and achievement systems

### 20.4 Experimental Ideas

- passive vocabulary farm mode
- browser reading mode with inline challenges
- partner study sessions
- community vocabulary packs
- AI-generated conversation practice

### 20.5 Feature Fusion Ideas

- combine quiz results with difficulty to recommend review frequency
- use browser reading patterns to suggest words before they appear
- connect word history to a spaced-repetition calendar
- surface context notes from pages with stored translations

### 20.6 Iteration Notes

When adding future features, keep the following checklist in mind:

- does it support long-term learning?
- does it integrate cleanly with existing storage?
- does it preserve browser performance?
- does it feel useful on a second and third visit?
- can it be toggled off if needed?

---

## 21. Very Long-Term Notes

LangLua is intended to be a living project. The long-term success of this extension depends on keeping the product simple, useful, and adaptable.

### 21.1 Durable Features

The most durable features are:

- translation caching
- history storage
- simple quizzes
- progress stats
- lightweight controls

### 21.2 Features to Avoid

Avoid features that:

- require heavy background processing
- force users into a strict study session
- clutter the popup with too many controls
- duplicate existing language learning apps without adding unique value

### 21.3 Philosophy

LangLua is about learning through usage, not through dedicated time blocks.

That is the core philosophy that should guide future work.

### 21.4 Long-Term Maintenance

This README is long because the extension is meant to be maintained over time.

Keep the documentation current with the code.

### 21.5 Why This Matters

A long-lived extension needs strong documentation. As features accumulate, the README herge to docu