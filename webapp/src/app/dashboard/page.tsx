"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { getUserProfile, updateLanguage, updateIntensity } from '@/services/userService';
import { SUPPORTED_LANGUAGES } from '@/firebase/config';
import { logOut } from '@/firebase/auth';
import { LayoutDashboard, BookOpen, Settings, LogOut, Zap, Flame, BookMarked } from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/settings',  label: 'Settings',  Icon: Settings },
];

function Sidebar({ user, onSignOut }: { user: any; onSignOut: () => void }) {
  const initials = (user?.displayName ?? user?.email ?? 'U').slice(0, 2).toUpperCase();
  return (
    <aside style={{
      width: 240, minHeight: '100vh', flexShrink: 0,
      background: 'var(--color-surface)',
      borderRight: '1px solid var(--color-border)',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, bottom: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid var(--color-border)' }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.25rem', fontWeight: 800 }}>
          Lang<span style={{
            color: 'var(--color-primary)',
            textShadow: '0 0 12px rgba(108,99,255,0.5)',
          }}>Lua</span>
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {NAV.map(({ href, label, Icon }) => (
          <Link key={href} href={href} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-secondary)',
            fontSize: '0.9375rem', fontWeight: 500,
            textDecoration: 'none', marginBottom: 4,
            transition: 'all 150ms ease',
          }}
          onMouseOver={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-raised)';
            (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)';
          }}
          onMouseOut={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)';
          }}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8125rem', fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>{initials}</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.displayName || 'Learner'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
        </div>
        <button
          onClick={onSignOut}
          style={{
            width: '100%', padding: '8px 12px',
            background: 'transparent', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', color: 'var(--color-text-muted)',
            fontSize: '0.875rem', cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: 6, transition: 'all 150ms ease',
          }}
          onMouseOver={e => {
            (e.currentTarget as HTMLElement).style.color = 'var(--color-error)';
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-error)';
          }}
          onMouseOut={e => {
            (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
          }}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    else if (user) getUserProfile(user.uid).then(setProfile);
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await logOut();
    router.push('/');
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    setSaving(true);
    await updateLanguage(user.uid, profile.targetLanguage);
    await updateIntensity(user.uid, profile.intensity);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const credits = profile?.credits ?? 0;
  const milestone = 100;
  const progressPct = Math.min((credits % milestone) / milestone * 100, 100);

  const intensityLabel = (v: number) => {
    if (v <= 3) return 'Light — a few words per page';
    if (v <= 6) return 'Balanced — moderate replacement';
    return 'Immersive — heavy replacement';
  };

  if (loading || !profile) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
        <aside style={{ width: 240, background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }} />
        <main style={{ flex: 1, marginLeft: 240, padding: 40 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 80, marginBottom: 16, borderRadius: 'var(--radius-md)' }} />
          ))}
        </main>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sidebar user={user} onSignOut={handleSignOut} />

      <main style={{ flex: 1, marginLeft: 240, padding: '32px 40px', maxWidth: 'calc(100vw - 240px)' }}>

        {/* Credit bar */}
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)', padding: '14px 20px', marginBottom: 32,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            <span>🪙 LinguaCoins</span>
            <span style={{ color: 'var(--color-text-muted)' }}>{credits % milestone} / {milestone} to next milestone</span>
          </div>
          <div style={{ height: 8, background: 'var(--color-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${progressPct}%`,
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
              borderRadius: 'var(--radius-full)',
              transition: 'width 600ms cubic-bezier(0.34,1.56,0.64,1)',
            }} />
          </div>
        </div>

        {/* Stat strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          {/* Credits */}
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderTop: '3px solid var(--color-primary)',
            borderRadius: 'var(--radius-lg)', padding: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Zap size={18} style={{ color: 'var(--color-accent-yellow)' }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Total Credits</span>
            </div>
            <div style={{
              fontSize: '2.25rem', fontWeight: 800, fontFamily: "'Syne', sans-serif",
              background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-accent))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>{credits}</div>
          </div>

          {/* Streak */}
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderTop: '3px solid var(--color-accent)',
            borderRadius: 'var(--radius-lg)', padding: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Flame size={18} style={{ color: 'var(--color-accent)' }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Current Streak</span>
            </div>
            <div style={{
              fontSize: '2.25rem', fontWeight: 800, fontFamily: "'Syne', sans-serif",
              color: 'var(--color-text-primary)',
            }}>{profile.streak ?? 0}<span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 400 }}> days</span></div>
          </div>

          {/* Words */}
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderTop: '3px solid var(--color-success)',
            borderRadius: 'var(--radius-lg)', padding: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <BookMarked size={18} style={{ color: 'var(--color-success)' }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Words Learned</span>
            </div>
            <div style={{
              fontSize: '2.25rem', fontWeight: 800, fontFamily: "'Syne', sans-serif",
              color: 'var(--color-text-primary)',
            }}>—</div>
          </div>
        </div>

        {/* Language & Intensity */}
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)', padding: 28, marginBottom: 28,
        }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.125rem', fontWeight: 700, marginBottom: 24 }}>
            Learning Settings
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 24 }}>
            {/* Language */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                Target Language
              </label>
              <select
                className="input"
                value={profile.targetLanguage}
                onChange={e => setProfile({ ...profile, targetLanguage: e.target.value })}
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Intensity */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                Intensity — <span style={{ color: 'var(--color-primary-light)' }}>{profile.intensity}</span>
              </label>
              <input
                type="range" min="1" max="10"
                value={profile.intensity}
                onChange={e => setProfile({ ...profile, intensity: parseInt(e.target.value, 10) })}
                style={{
                  width: '100%', marginBottom: 8,
                  background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${(profile.intensity - 1) / 9 * 100}%, var(--color-border) ${(profile.intensity - 1) / 9 * 100}%, var(--color-border) 100%)`,
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                <span>Light</span><span>Balanced</span><span>Immersive</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: 6 }}>
                {intensityLabel(profile.intensity)}
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
            style={{ minWidth: 120 }}
          >
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Settings'}
          </button>
        </div>

        {/* Recent Vocabulary */}
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)', padding: 28,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <BookOpen size={20} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.125rem', fontWeight: 700 }}>
              Recent Vocabulary
            </h2>
          </div>
          <div style={{
            background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-md)',
            padding: '32px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📖</div>
            <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Start browsing with the LangLua extension to build your vocabulary here.
            </p>
          </div>
        </div>

      </main>

      {/* Toast */}
      {saved && (
        <div className="toast" style={{ borderLeftColor: 'var(--color-success)' }}>
          ✓ Settings saved successfully
        </div>
      )}
    </div>
  );
}
