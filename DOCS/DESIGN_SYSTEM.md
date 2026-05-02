# 🎨 LangLua — Design System

> Visual identity, component library, and UX guidelines for the LangLua web app and browser extension.

---

## 1. Brand Identity

| Property | Value |
|---|---|
| **Product Name** | LangLua |
| **Tagline** | *Learn by Living the Web* |
| **Tone** | Playful, motivating, smart — like Duolingo meets a browser dev tool |
| **Target User** | Language learners who want passive immersion while browsing |

### Logo Concept
- **Wordmark**: "Lang" in bold weight + "Lua" in a contrasting italic or accent color
- **Icon**: A speech bubble containing a translated letter (e.g., "A → あ") — represents in-place word replacement
- **Usage**: Always show on dark or light backgrounds with sufficient contrast; never stretch or rotate

---

## 2. Color Palette

### Primary (Web App)

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#6C63FF` | Buttons, links, active states |
| `--color-primary-dark` | `#4B44CC` | Hover states, pressed buttons |
| `--color-primary-light` | `#A89BFF` | Highlights, badges |
| `--color-accent` | `#FF6584` | Gamification streak, XP bar, alerts |
| `--color-accent-yellow` | `#FFD166` | Credits, coin indicators, rewards |

### Neutrals

| Token | Hex | Usage |
|---|---|---|
| `--color-bg` | `#0F0F1A` | App dark background |
| `--color-surface` | `#1A1A2E` | Cards, modals, panels |
| `--color-surface-raised` | `#252540` | Hover cards, tooltips |
| `--color-border` | `#2E2E50` | Dividers, input borders |
| `--color-text-primary` | `#F0EEFF` | Headings, main body text |
| `--color-text-secondary` | `#9D9DC0` | Subtitles, labels, placeholders |
| `--color-text-muted` | `#5A5A80` | Disabled states, hints |

### Semantic

| Token | Hex | Usage |
|---|---|---|
| `--color-success` | `#06D6A0` | Correct answer feedback |
| `--color-error` | `#EF476F` | Wrong answer, error states |
| `--color-warning` | `#FFD166` | Caution banners |
| `--color-info` | `#118AB2` | Neutral info banners |

### Extension Overlay Colors

| Token | Hex | Usage |
|---|---|---|
| `--ext-highlight-bg` | `rgba(108, 99, 255, 0.25)` | Replaced word background on page |
| `--ext-highlight-underline` | `#A89BFF` | Dashed underline on replaced words |
| `--ext-tooltip-bg` | `#1A1A2E` | Hover tooltip background |
| `--ext-tooltip-border` | `#6C63FF` | Tooltip border |

---

## 3. Typography

### Font Stack

| Role | Font | Source |
|---|---|---|
| **Display / Headings** | `Syne` | Google Fonts |
| **Body** | `DM Sans` | Google Fonts |
| **Monospace / Code** | `JetBrains Mono` | Google Fonts |
| **Extension UI** | `DM Sans` (self-contained in extension CSS) | Google Fonts (preloaded) |

```css
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
```

### Type Scale

| Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `--text-display` | 3rem (48px) | 800 | 1.1 | Hero headings |
| `--text-h1` | 2rem (32px) | 700 | 1.2 | Page titles |
| `--text-h2` | 1.5rem (24px) | 600 | 1.3 | Section headers |
| `--text-h3` | 1.125rem (18px) | 600 | 1.4 | Card titles |
| `--text-body` | 1rem (16px) | 400 | 1.6 | Main body content |
| `--text-small` | 0.875rem (14px) | 400 | 1.5 | Labels, captions |
| `--text-xs` | 0.75rem (12px) | 500 | 1.4 | Badges, tags |

---

## 4. Spacing & Layout

```css
/* 4px base grid */
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;
--space-5:  20px;
--space-6:  24px;
--space-8:  32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;

/* Border Radius */
--radius-sm:  6px;
--radius-md:  12px;
--radius-lg:  20px;
--radius-xl:  32px;
--radius-full: 9999px;

/* Shadows */
--shadow-sm:  0 2px 8px rgba(0,0,0,0.3);
--shadow-md:  0 4px 20px rgba(108,99,255,0.15);
--shadow-lg:  0 8px 40px rgba(108,99,255,0.25);
--shadow-glow: 0 0 24px rgba(108,99,255,0.4);
```

### Page Layout
- **Max content width**: 1200px
- **Side padding**: 24px (mobile), 48px (tablet), 80px (desktop)
- **Sidebar (Dashboard)**: 240px fixed left, collapsible on mobile

---

## 5. Component Library

### 5.1 Buttons

```
PRIMARY BUTTON
- Background: var(--color-primary)
- Text: white, DM Sans 500
- Padding: 12px 24px
- Radius: var(--radius-full)
- Hover: background var(--color-primary-dark), shadow var(--shadow-md)
- Active: scale(0.97)
- Transition: all 200ms ease

SECONDARY BUTTON
- Background: transparent
- Border: 1px solid var(--color-primary)
- Text: var(--color-primary)
- Same padding/radius as primary

GHOST BUTTON
- Background: transparent
- Text: var(--color-text-secondary)
- Hover: text var(--color-text-primary), background var(--color-surface)

DANGER BUTTON
- Background: var(--color-error)
- Same structure as PRIMARY
```

### 5.2 Input Fields

```
TEXT INPUT
- Background: var(--color-surface)
- Border: 1px solid var(--color-border)
- Radius: var(--radius-md)
- Padding: 12px 16px
- Font: DM Sans 400, 1rem
- Color: var(--color-text-primary)
- Focus: border-color var(--color-primary), box-shadow var(--shadow-md)
- Placeholder: var(--color-text-muted)
```

### 5.3 Cards

```
STANDARD CARD
- Background: var(--color-surface)
- Border: 1px solid var(--color-border)
- Radius: var(--radius-lg)
- Padding: var(--space-6)
- Shadow: var(--shadow-sm)
- Hover: border-color var(--color-primary-light), shadow var(--shadow-md)

STAT CARD (Dashboard)
- Same as above + accent top-border: 3px solid var(--color-primary)
- Contains: icon, big number, label
```

### 5.4 Extension Tooltip (Hover Card)

```
TOOLTIP CONTAINER
- Background: var(--ext-tooltip-bg) with 95% opacity + backdrop-filter: blur(12px)
- Border: 1px solid var(--ext-tooltip-border)
- Radius: var(--radius-md)
- Padding: 16px
- Max-width: 320px
- Shadow: var(--shadow-lg)
- z-index: 2147483647 (always on top)

SECTIONS INSIDE TOOLTIP:
┌─────────────────────────────────┐
│  🔊 [Play Pronunciation]        │ ← ElevenLabs audio button
│  ─────────────────────────────  │
│  Original: "hello"              │ ← source word
│  Translation: "こんにちは"       │ ← replaced word (large, accent color)
│  ─────────────────────────────  │
│  💡 What do you think it means? │ ← Gamification prompt
│  [___________________________]  │ ← Text input
│  [Submit] → earn +10 credits    │
│  ─────────────────────────────  │
│  [Show definition instead →]    │ ← Gemini fallback button
└─────────────────────────────────┘
```

### 5.5 Language Badge

```
BADGE
- Background: var(--color-primary-light) at 20% opacity
- Text: var(--color-primary-light)
- Padding: 4px 10px
- Radius: var(--radius-full)
- Font: DM Sans 500, 12px
- Icon: country flag emoji prefix
```

### 5.6 XP / Credit Bar

```
CREDIT BAR (Dashboard & Extension popup)
- Track: var(--color-surface-raised), height 8px, radius full
- Fill: linear-gradient(90deg, var(--color-primary), var(--color-accent))
- Animated fill on change: transition width 500ms cubic-bezier(0.34,1.56,0.64,1)
- Label above: "{n} LinguaCoins 🪙"
```

### 5.7 Notification / Toast

```
TOAST
- Position: fixed bottom-right, 24px margin
- Background: var(--color-surface-raised)
- Border-left: 4px solid [semantic color]
- Padding: 14px 18px
- Radius: var(--radius-md)
- Auto-dismiss: 4 seconds
- Enter: slide up + fade in
- Exit: slide down + fade out
```

---

## 6. Iconography

- **Library**: Lucide Icons (consistent with React ecosystem)
- **Size standard**: 16px (inline), 20px (buttons), 24px (section icons), 32px (feature icons)
- **Stroke width**: 1.5px for all icons
- **Color**: Inherit from parent or explicit semantic token

### Key Icons
| Icon | Usage |
|---|---|
| `Globe` | Language selection |
| `Volume2` | Pronunciation play |
| `Zap` | Credits / XP |
| `Brain` | Vocabulary quiz mode |
| `PuzzlePiece` | Extension |
| `Trophy` | Leaderboard |
| `BookOpen` | Definition view |
| `Flame` | Streak indicator |

---

## 7. Animation & Motion

```css
/* Easing curves */
--ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);   /* bouncy, playful */
--ease-smooth:   cubic-bezier(0.25, 0.46, 0.45, 0.94); /* natural, refined */
--ease-sharp:    cubic-bezier(0.4, 0, 0.2, 1);          /* snappy UI */

/* Durations */
--dur-fast:   150ms;
--dur-normal: 250ms;
--dur-slow:   400ms;
--dur-page:   600ms;
```

### Motion Rules
- Page transitions: fade + slide up (--dur-page, --ease-smooth)
- Tooltip appear: scale(0.9)→1 + opacity 0→1 (--dur-fast, --ease-spring)
- Credit gain: number count-up animation + brief glow pulse
- Correct answer: green flash + confetti burst (using canvas confetti)
- Wrong answer: horizontal shake (keyframe: -8px → +8px × 3)
- Replaced word on page: subtle highlight pulse on first load (2s, then static)

---

## 8. Web App Page Structure

```
/                     → Landing Page (hero, features, CTA to sign up)
/signup               → Sign Up (Firebase Auth)
/login                → Log In (Firebase Auth)
/dashboard            → Main dashboard
  - Language selector
  - Word replacement intensity (slider: Light / Medium / Heavy)
  - Credits/XP overview
  - Vocabulary review list
  - Streak tracker
/settings             → Account settings, language preferences
/leaderboard          → (Optional MVP+) Top learners by credits
```

---

## 9. Chrome Extension UI

### Extension Popup (128×400px)
```
┌──────────────────────────┐
│  🌐 LangLua              │
│  ─────────────────────── │
│  Status: ● Active        │ ← toggle on/off
│  Language: 🇯🇵 Japanese   │
│  Intensity: ████░ 80%    │
│  ─────────────────────── │
│  🪙 Credits: 240         │
│  🔥 Streak: 7 days       │
│  ─────────────────────── │
│  [Open Dashboard ↗]      │
│  [Sign Out]              │
└──────────────────────────┘
```

### Replaced Word Styling (injected CSS on host page)
```css
.langlua-word {
  background: rgba(108, 99, 255, 0.15);
  border-bottom: 2px dashed #A89BFF;
  border-radius: 3px;
  padding: 0 2px;
  cursor: pointer;
  transition: background 150ms ease;
}
.langlua-word:hover {
  background: rgba(108, 99, 255, 0.3);
}
```

---

## 10. Accessibility

- All interactive elements: minimum 44×44px touch target
- Color contrast ratio: minimum 4.5:1 for body text, 3:1 for UI components
- All images: `alt` attributes required
- Keyboard navigation: full tab order, visible focus rings (`outline: 2px solid var(--color-primary)`)
- Extension tooltip: closes on `Escape` key, focus-trapped while open
- Audio playback: always user-initiated, never auto-play
- Reduced motion: respect `prefers-reduced-motion` — disable all animations except opacity
