// borderGlow.ts — minimal init, the CSS handles the animation via @property --angle
export function initBorderGlow(_cardId: string, _options: Record<string, unknown> = {}) {
  // The glow is now 100% CSS-driven (conic-gradient + @property --angle animation).
  // This function is kept as a no-op so popup.ts doesn't break.
}
