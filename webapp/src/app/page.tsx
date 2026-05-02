"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Landing() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push('/dashboard');
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>
      {/* Hero */}
      <section className="hero-bg" style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Glow orbs */}
        <div style={{
          position: 'absolute', top: '20%', left: '10%',
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', right: '8%',
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(255,101,132,0.1) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', maxWidth: 760, margin: '0 auto' }}>
          {/* Wordmark */}
          <div style={{ marginBottom: 32, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 14, fontWeight: 600, letterSpacing: '0.15em',
              color: 'var(--color-primary-light)',
              background: 'rgba(108,99,255,0.12)',
              border: '1px solid rgba(108,99,255,0.25)',
              padding: '6px 14px', borderRadius: 'var(--radius-full)',
            }}>
              🌐 Lang<span style={{ color: 'var(--color-primary)' }}>Lua</span>
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 24,
            letterSpacing: '-0.02em',
          }}>
            Learn by Living<br />
            <span style={{
              background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>the Web</span>
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: 'var(--color-text-secondary)',
            marginBottom: 48,
            lineHeight: 1.6,
          }}>
            Browse any page. Replace words. Learn your language.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
              Get Started Free
            </Link>
            <Link href="/login" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '80px 24px',
      }}>
        <h2 style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: '1.75rem', fontWeight: 700,
          textAlign: 'center', marginBottom: 48,
          color: 'var(--color-text-primary)',
        }}>
          How it works
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
        }}>
          {/* Card 1 */}
          <div className="card" style={{ cursor: 'default' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🔄</div>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.125rem', fontWeight: 700, marginBottom: 12 }}>
              Words replace themselves
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
              As you browse, common words are automatically swapped with their translation.
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-md)', padding: '12px 16px',
              fontWeight: 600,
            }}>
              <span style={{ color: 'var(--color-text-muted)' }}>hello</span>
              <span style={{ color: 'var(--color-text-muted)' }}>→</span>
              <span style={{
                color: 'var(--color-primary-light)',
                background: 'rgba(108,99,255,0.15)',
                borderBottom: '2px dashed var(--color-primary-light)',
                borderRadius: 3, padding: '0 4px',
              }}>こんにちは</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="card" style={{ cursor: 'default' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🔊</div>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.125rem', fontWeight: 700, marginBottom: 12 }}>
              Hear every word
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
              Click any replaced word to hear native-quality pronunciation powered by ElevenLabs AI.
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(108,99,255,0.12)',
              border: '1px solid rgba(108,99,255,0.25)',
              borderRadius: 'var(--radius-full)', padding: '8px 16px',
              color: 'var(--color-primary-light)', fontSize: '0.875rem',
            }}>
              🔊 Play pronunciation
            </div>
          </div>

          {/* Card 3 */}
          <div className="card" style={{ cursor: 'default' }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🪙</div>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.125rem', fontWeight: 700, marginBottom: 12 }}>
              Earn LinguaCoins
            </h3>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
              Guess what a word means to earn credits. Build streaks and climb the leaderboard.
            </p>
            <div style={{
              background: 'var(--color-surface-raised)',
              borderRadius: 'var(--radius-md)', padding: '12px 16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                <span>🪙 240 LinguaCoins</span>
                <span>🔥 7 day streak</span>
              </div>
              <div style={{ height: 8, background: 'var(--color-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: '72%',
                  background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                  borderRadius: 'var(--radius-full)',
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', marginTop: 64 }}>
          <Link href="/signup" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 40px' }}>
            Start Learning for Free →
          </Link>
        </div>
      </section>
    </div>
  );
}
