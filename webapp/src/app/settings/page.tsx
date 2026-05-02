"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { getUserProfile, updateLanguage, updateIntensity } from '@/services/userService';
import { SUPPORTED_LANGUAGES } from '@/firebase/config';
import { logOut } from '@/firebase/auth';
import { LayoutDashboard, Settings, LogOut, AlertTriangle } from 'lucide-react';

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
      <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid var(--color-border)' }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.25rem', fontWeight: 800 }}>
          Lang<span style={{ color: 'var(--color-primary)', textShadow: '0 0 12px rgba(108,99,255,0.5)' }}>Lua</span>
        </span>
      </div>
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {NAV.map(({ href, label, Icon }) => (
          <Link key={href} href={href} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-secondary)', fontSize: '0.9375rem', fontWeight: 500,
            textDecoration: 'none', marginBottom: 4, transition: 'all 150ms ease',
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
            <Icon size={18} />{label}
          </Link>
        ))}
      </nav>
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8125rem', fontWeight: 700, color: '#fff',
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
        <button onClick={onSignOut} style={{
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

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  if (loading || !profile) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
        <aside style={{ width: 240, background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }} />
        <main style={{ flex: 1, marginLeft: 240, padding: 40 }}>
          <div className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-lg)' }} />
        </main>
      </div>
    );
  }

  const section = (title: string, children: React.ReactNode) => (
    <div style={{
      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)', padding: 28, marginBottom: 20,
    }}>
      <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.0625rem', fontWeight: 700, marginBottom: 20, color: 'var(--color-text-primary)' }}>
        {title}
      </h2>
      {children}
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Sidebar user={user} onSignOut={handleSignOut} />

      <main style={{ flex: 1, marginLeft: 240, padding: '32px 40px', maxWidth: 680 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.75rem', fontWeight: 800, marginBottom: 28 }}>
          Settings
        </h1>

        {/* Account */}
        {section('Account', (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Display Name</div>
              <div style={{
                padding: '10px 14px', background: 'var(--color-surface-raised)',
                borderRadius: 'var(--radius-md)', color: 'var(--color-text-secondary)',
                fontSize: '0.9375rem',
              }}>{profile?.displayName || '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Email</div>
              <div style={{
                padding: '10px 14px', background: 'var(--color-surface-raised)',
                borderRadius: 'var(--radius-md)', color: 'var(--color-text-secondary)',
                fontSize: '0.9375rem',
              }}>{user?.email}</div>
            </div>
          </div>
        ))}

        {/* Language Prefs */}
        {section('Language Preferences', (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 24 }}>
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
                    <option key={lang.code} value={lang.code}>{lang.flag} {lang.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                  Replacement Intensity — <span style={{ color: 'var(--color-primary-light)' }}>{profile.intensity}</span>
                </label>
                <input
                  type="range" min="1" max="10"
                  value={profile.intensity}
                  onChange={e => setProfile({ ...profile, intensity: parseInt(e.target.value, 10) })}
                  style={{
                    width: '100%', marginBottom: 6,
                    background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${(profile.intensity - 1) / 9 * 100}%, var(--color-border) ${(profile.intensity - 1) / 9 * 100}%, var(--color-border) 100%)`,
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  <span>Light (1)</span><span>Balanced (5)</span><span>Immersive (10)</span>
                </div>
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ minWidth: 120 }}>
              {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
            </button>
          </>
        ))}

        {/* Danger Zone */}
        {section('Danger Zone', (
          <div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: 16 }}>
              Signing out will end your session. You can sign back in at any time.
            </p>
            {!confirmDelete ? (
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={handleSignOut} className="btn btn-danger">
                  <LogOut size={16} /> Sign Out
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  style={{
                    padding: '12px 24px', borderRadius: 'var(--radius-full)',
                    background: 'transparent', border: '1px solid var(--color-error)',
                    color: 'var(--color-error)', cursor: 'pointer', fontWeight: 500,
                    fontSize: '0.9375rem', transition: 'all 200ms ease', display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <AlertTriangle size={16} /> Delete Account
                </button>
              </div>
            ) : (
              <div style={{
                background: 'rgba(239,71,111,0.08)', border: '1px solid rgba(239,71,111,0.3)',
                borderRadius: 'var(--radius-md)', padding: 20,
              }}>
                <p style={{ color: 'var(--color-error)', fontWeight: 600, marginBottom: 12 }}>
                  Are you sure? This action cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-danger">Yes, delete my account</button>
                  <button onClick={() => setConfirmDelete(false)} className="btn btn-ghost">Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </main>

      {saved && (
        <div className="toast" style={{ borderLeftColor: 'var(--color-success)' }}>
          ✓ Preferences saved
        </div>
      )}
    </div>
  );
}
