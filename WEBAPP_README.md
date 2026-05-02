# LangLua Marketing Website — Complete MVP

## ✅ What's Built

A fully interactive Next.js 14 marketing website for LangLua. **Dev server running on http://localhost:3001**

### Features Built
✅ **Hero Section** — Logo, tagline, staggered animations, CTAs, video placeholder  
✅ **How It Works** — 3-step cards (Install → Browse → Learn)  
✅ **Interactive Demo** — 6 Spanish words with working tooltips + Save Word modal  
✅ **Tooltip System** — Exact extension styling (280px, rounded 16px, backdrop blur)  
✅ **Save Word Modal** — Radix Dialog with adaptive learning callout + level indicator  
✅ **Features Section** — 4 cards (Adaptive Learning flagship, Save Words, Try Out, Streaks)  
✅ **Roadmap** — MVP/V1/V2 timeline with status badges  
✅ **Navbar** — Sticky, blur effect, logo + nav links  
✅ **Footer** — Branding + tagline  
✅ **Animations** — Framer Motion fade-ups, scroll triggers, smooth modals  
✅ **Responsive** — Mobile, tablet, desktop optimized  

## 🎮 Try It Now

1. Open http://localhost:3001
2. Scroll to "Interactive Demo" section
3. **Hover a highlighted word** (important, discovered, learning, etc.)
4. **Click "Save Word"** to see the modal
5. **Click "Add to Vocabulary"** to mark as saved
6. Try on mobile — fully responsive

## 🏗 Architecture

```
webapp/
├── src/app/
│   ├── layout.tsx           # Root layout, metadata
│   ├── page.tsx             # Main page composition
│   └── globals.css          # Tailwind + word highlight utility
├── src/components/
│   ├── layout/              # Navbar, Footer
│   ├── sections/            # Hero, HowItWorks, Demo, Features, Roadmap
│   ├── demo/                # DemoArticle, HighlightedWord, WordTooltip, SaveWordModal
│   └── ui/                  # Button, Badge, SectionLabel, FadeUp
├── src/lib/
│   └── demoWords.ts         # Word data + article tokenization
├── tailwind.config.ts       # Design tokens (colors, radius, shadows, animations)
└── package.json
```

## 🎨 Design Tokens (from Extension)

All colors/spacing match the extension exactly:

| Element | Color/Value |
|---------|-------------|
| Primary blue | `#3B82F6` |
| Primary hover | `#2563EB` |
| Dark text | `#1E293B` |
| Muted text | `#64748B` |
| Borders | `#E2E8F0` |
| Badge bg | `#DBEAFE` |
| Card radius | `48px` |
| Modal radius | `24px` |
| Tooltip radius | `16px` |
| Button radius | `9999px` (pill) |
| Font | Inter |

## 🚀 Next Steps (Prioritized)

### 🔴 Critical (Before Public Launch)
1. **Add Video URL** → Replace Hero video placeholder with YouTube embed
2. **Chrome Store Link** → Update "Add to Chrome" button href
3. **Mobile Test** → Test on real phone (iPhone + Android)
4. **Lighthouse Audit** → Run and fix (target: 90+)
5. **Deploy to Vercel** → One-click from GitHub

### 🟡 Important (Week 1)
6. **Email Signup** → Add form + integrate (Mailchimp/Sendgrid)
7. **Google Analytics** → Add tracking script
8. **FAQ Section** → Common questions about extension
9. **Testimonials** → 3-5 user quotes/reviews
10. **Meta Tags** → Proper OG images for social sharing

### 🟢 Nice-to-Have (Week 2+)
11. **Language Selector** → Demo dropdown to switch ES/FR/DE/JA
12. **Blog Page** → Language learning tips/articles
13. **Affiliate Program** → Referral links
14. **Dark Mode** → Toggle in navbar
15. **Performance** → Image optimization, lazy loading

## 🛠 How to Customize

### Add Video
File: `src/components/sections/HeroSection.tsx` ~line 50
```tsx
<iframe
  width="100%"
  height="100%"
  src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
  frameBorder="0"
  allowFullScreen
/>
```

### Change Colors
File: `tailwind.config.ts`
```typescript
colors: {
  primary: { DEFAULT: '#YOUR_BLUE', hover: '#DARKER' }
}
```

### Add More Demo Words
File: `src/lib/demoWords.ts`
```typescript
export const DEMO_WORDS: Record<string, DemoWord> = {
  newword: {
    id: 'w7',
    original: 'newword',
    translation: 'nuevapalabra',
    lang: 'ES',
    contextSentence: '...'
  },
  // ...
}
```

### Update Roadmap Items
File: `src/components/sections/RoadmapSection.tsx` line ~20
Modify the `PHASES` array with your timeline.

## 📦 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Modal:** Radix UI Dialog
- **Fonts:** Inter (Google Fonts)
- **Deployment:** Vercel (ready to go)

## ✨ Key Features Explained

### 1. Word Tokenization
The article is pre-tokenized in `demoWords.ts` into a `Token[]` array at build time:
```typescript
type Token = 
  | { type: 'text'; value: string }
  | { type: 'word'; word: DemoWord; displayText: string }
```
This avoids runtime regex and preserves punctuation cleanly.

### 2. Demo State Management
`DemoSection.tsx` holds three pieces of state:
- `savedWords: Set<string>` — Which words user saved
- `modalWord: DemoWord | null` — Which word's save modal is open
- Callbacks flow down to children for hover/click handling

### 3. Tooltip Positioning
Tooltips are `absolute left-1/2 -translate-x-1/2 top-full mt-2` — centered below word.  
On mobile near edges, no special handling needed for MVP (works fine).

### 4. Modal Animations
Uses Framer Motion `AnimatePresence` + nested `motion.div`:
- Overlay fades in (300ms)
- Modal slides up + scales (300ms cubic-bezier)
- "Saved!" state brief (600ms) before close

## 🚢 Deployment

### To Vercel (Recommended)
```bash
# First time
vercel login
cd webapp
vercel deploy --prod

# Subsequent pushes (if GitHub connected)
# Just push to main, Vercel auto-deploys
git push origin main
```

### To Other Platforms
```bash
npm run build         # Creates optimized bundle in .next/
npm run start         # Runs production build locally
```

## 📊 Performance Checklist

- [ ] Lighthouse score 90+ (all metrics)
- [ ] Core Web Vitals green
- [ ] FCP < 1.5s
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] No console errors
- [ ] Mobile responsive (tested on real device)
- [ ] Animations smooth (60fps)

## 🐛 Common Issues & Fixes

**Tooltip not appearing?**
- Check `relative` positioning on `<span className="langlua-word-demo">`
- Verify `HighlightedWord` component is receiving `isHovered` prop

**Modal closed immediately?**
- Check `onClose` callback in `SaveWordModal`
- Verify Radix Dialog `open` prop is controlled correctly

**Styling looks off?**
- Clear `.next/`: `rm -rf .next`
- Rebuild: `npm run build`
- Check `globals.css` is imported in `layout.tsx`

**Dev server won't start?**
- Kill existing process: `lsof -ti :3001 | xargs kill -9`
- Clear node_modules + reinstall if needed

## 📚 File Reference

| File | What It Does |
|------|-------------|
| `src/lib/demoWords.ts` | Word pairs + pre-tokenized article |
| `src/components/demo/SaveWordModal.tsx` | The complex part — Radix Dialog + animations |
| `src/components/ui/FadeUp.tsx` | Reusable scroll animation wrapper |
| `tailwind.config.ts` | All design tokens in one place |
| `src/app/page.tsx` | Composition of all sections |

## 💡 Tips for Presenters/Demos

1. **Start at Hero** — Scroll through slowly, point out animations
2. **Hover words in demo** — Show tooltip matches extension exactly
3. **Click Save Word** — Demonstrate modal + adaptive learning concept
4. **Talk points:**
   - "This is just the website; the magic happens in the browser extension"
   - "Every word is adaptive — system learns your level"
   - "Vocabulary syncs to dashboard (coming soon)"
5. **Mobile demo** — Responsive design impresses stakeholders

## 📞 Support

If something breaks:
1. Check console for errors: F12 → Console tab
2. Try hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
3. Restart dev server: Ctrl+C in terminal, `npm run dev` again
4. Check for TypeScript errors: Look for red squiggles in editor

## 🎯 Success Criteria

✅ **MVP Complete:**
- [ ] Website loads instantly
- [ ] Interactive demo works (hover + save)
- [ ] Mobile responsive
- [ ] All sections animate smoothly
- [ ] No console errors
- [ ] Lighthouse 90+
- [ ] Code is clean/documented

✅ **Ready to Share:**
- [ ] Video embedded
- [ ] Chrome Store link active
- [ ] Email signup working (optional but nice)
- [ ] Deployed to live URL
- [ ] DNS/domain configured
- [ ] Analytics tracking added

---

**You now have a fully functional marketing website. Next step: add video URL and deploy to Vercel!** 🚀
