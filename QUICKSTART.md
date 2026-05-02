# LangLua Website — Quick Start Guide

## ✅ What You Have

A **fully functional marketing website** running at **http://localhost:3001**

Everything is complete and interactive:
- ✅ Interactive demo with word tooltips
- ✅ Save Word modal with animations
- ✅ Responsive design
- ✅ Smooth scrolling sections
- ✅ Professional UI matching extension

## 🎮 Try It Right Now

1. Open your browser to **http://localhost:3001**
2. Scroll down to "Interactive Demo" section
3. **Hover** any blue highlighted word (e.g., "important", "learning", "daily")
4. A tooltip appears! Click **"Save Word"**
5. A modal slides up with Adaptive Learning info
6. Click **"Add to Vocabulary"** — word is saved

**That's the MVP demo in action!**

## 🚀 Top 5 Next Steps (Do These First)

### 1️⃣ Add a Video (15 min)
Edit: `webapp/src/components/sections/HeroSection.tsx` line ~50

Replace this:
```tsx
<div className="bg-slate-100 rounded-2xl aspect-video ...">
  <div className="text-center">
    <div className="text-4xl mb-3">▶</div>
    <p className="text-slate-500 text-sm">Demo video coming soon</p>
  </div>
</div>
```

With YouTube embed:
```tsx
<iframe
  width="100%"
  height="100%"
  src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
  className="rounded-2xl"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
/>
```

### 2️⃣ Deploy to Vercel (5 min, one-click)
```bash
# In webapp folder
vercel deploy --prod
```

Or connect GitHub repo to Vercel dashboard → auto-deploys on push

### 3️⃣ Update "Add to Chrome" Link (2 min)
Edit: `webapp/src/components/layout/Navbar.tsx` line ~20

Change:
```tsx
<Button variant="primary" size="sm">
  Add to Chrome
</Button>
```

To:
```tsx
<Button 
  variant="primary" 
  size="sm"
  href="https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID"
>
  Add to Chrome
</Button>
```

### 4️⃣ Test on Mobile (10 min)
- Open DevTools (F12)
- Toggle device toolbar (Ctrl+Shift+M)
- Test all sections on phone + tablet sizes
- Try demo: hover words, click save

### 5️⃣ Run Lighthouse Audit (5 min)
- DevTools → Lighthouse tab
- Click "Analyze page load"
- Target: 90+ on all metrics
- Fix any warnings (usually image optimization)

## 📝 File Quick Reference

| Task | File | Line |
|------|------|------|
| Add video | `src/components/sections/HeroSection.tsx` | 50 |
| Change colors | `tailwind.config.ts` | 15 |
| Update Chrome link | `src/components/layout/Navbar.tsx` | 20 |
| Add more words | `src/lib/demoWords.ts` | 7+ |
| Modify roadmap | `src/components/sections/RoadmapSection.tsx` | 20 |

## 🎯 Optional Quick Wins

### Add Email Signup (Email integration)
Add to Hero section in `HeroSection.tsx`:
```tsx
<form className="flex gap-2 max-w-sm mx-auto">
  <input
    type="email"
    placeholder="you@example.com"
    className="flex-1 px-4 py-2.5 rounded-pill border border-slate-200"
  />
  <Button variant="primary">Notify Me</Button>
</form>
```

### Add Testimonials Section
Copy `FeaturesSection.tsx`, modify for quotes/photos.

### Add More Languages to Demo
In `src/lib/demoWords.ts`, add Spanish, French, etc. word sets, then add language selector to Demo.

### Enable Dark Mode
Install: `npm install next-themes`
Add to `layout.tsx`:
```tsx
import { ThemeProvider } from 'next-themes'
<ThemeProvider attribute="class" defaultTheme="light">
  {children}
</ThemeProvider>
```

## 🔍 Testing Checklist

- [ ] Click all nav links (scroll works?)
- [ ] Hover every word in demo (tooltip appears?)
- [ ] Click Save Word (modal opens + closes?)
- [ ] Click on different words (each saves independently?)
- [ ] Refresh page (saved state persists? — currently it won't, need localStorage)
- [ ] Test on phone (responsive, touch works?)
- [ ] Test on tablet (layout good?)
- [ ] Scroll animations smooth? (watch while scrolling)

## 🐛 Troubleshooting

| Problem | Fix |
|---------|-----|
| Demo not showing? | Scroll down to "Interactive Demo" section |
| Tooltip not appearing? | Hover slower, give it time to render |
| Modal not opening? | Check browser console (F12) for errors |
| Page layout broken? | Clear `.next`: `rm -rf .next`, then `npm run build` |
| Dev server slow? | Restart: Ctrl+C, then `npm run dev` |
| Styling looks weird? | Hard refresh: Ctrl+Shift+R |

## 🎨 Customization Quick Tips

**Change primary color:**
```typescript
// tailwind.config.ts
colors: {
  primary: {
    DEFAULT: '#YOUR_BLUE',  // was #3B82F6
    hover: '#DARKER_BLUE',   // was #2563EB
  }
}
```

**Change button text:**
All buttons use the `<Button>` component. Find them and edit the text.

**Change section titles:**
Search for "How It Works", "Demo", "Features", "Roadmap" — edit text directly in components.

**Change animation speed:**
In `tailwind.config.ts`, modify animation timings (e.g., `0.5s` to `1s`).

## 📊 Analytics to Add Next

Once deployed, add:
1. **Google Analytics** — Track page views, clicks, scroll depth
2. **Hotjar** — See where users click/scroll
3. **Vercel Analytics** — Built-in performance monitoring

```tsx
// Add to app/layout.tsx
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=YOUR_GA_ID"
/>
```

## 💬 Architecture Overview (30 seconds)

```
User opens http://localhost:3001
         ↓
    Next.js serves layout.tsx
         ↓
    Composes page.tsx (sections)
         ↓
    Each section is a React component
         ↓
    Demo is interactive (useState hooks)
         ↓
    Animations use Framer Motion
         ↓
    Styles via Tailwind CSS
         ↓
    Pretty website! 🎉
```

## ✅ Ready to Launch Checklist

### Must-Have (Do Before Public)
- [ ] Video embedded
- [ ] Chrome Web Store link active
- [ ] Mobile tested
- [ ] Lighthouse 90+
- [ ] Deployed to Vercel

### Nice-to-Have (Can Come Later)
- [ ] Email signup
- [ ] Analytics
- [ ] FAQ section
- [ ] Testimonials
- [ ] Dark mode

### Polish (After Launch)
- [ ] Blog
- [ ] Multi-language demo
- [ ] Community features
- [ ] Mobile app promo

## 🎓 Learning the Code

If you want to understand how it works:

1. Start with `src/app/page.tsx` — shows all sections
2. Look at `src/lib/demoWords.ts` — data layer
3. Check `src/components/demo/SaveWordModal.tsx` — most complex part
4. Read `tailwind.config.ts` — all design tokens
5. Browse Framer Motion docs — understand animations

**Tip:** Every component has comments explaining what it does.

## 🤝 What's Different from Extension?

| Aspect | Extension | Website |
|--------|-----------|---------|
| Purpose | Actual learning tool | Marketing + demo |
| State | Saves to Chrome storage | In-memory (resets on refresh) |
| Database | Firebase (real) | None (MVP) |
| Video | N/A | Embedded in Hero |
| Interactivity | Full learning | Demo only |

The website is a **marketing tool** showing what the extension does. The extension is the actual product.

## 🚀 You're Ready!

You have a professional marketing website. Next step: add video + deploy. That's it!

**Questions?** Check `WEBAPP_README.md` for detailed docs.

---

**Happy launching!** 🎉
