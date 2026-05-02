"use client";

import { useState } from 'react';
import Link from 'next/link';
import { signUpWithEmail, signInWithGoogle } from '@/firebase/auth';
import { createUserProfile } from '@/services/userService';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { user } = await signUpWithEmail(email, password);
      await createUserProfile(user.uid, user.email, name);
      router.push('/dashboard');
    } catch {
      setError('Signup failed. The email may already be in use.');
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    try {
      const { user } = await signInWithGoogle();
      await createUserProfile(user.uid, user.email, user.displayName);
      router.push('/dashboard');
    } catch {
      setError('Google sign-up failed. Please try again.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 40,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: '1.75rem', fontWeight: 800,
            marginBottom: 8,
          }}>
            Lang<span style={{ color: 'var(--color-primary)' }}>Lua</span>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Create your account — it&apos;s free
          </p>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleSignup}
          style={{
            width: '100%', padding: '12px 16px',
            background: '#fff', color: '#1f1f1f',
            border: '1px solid #dadce0', borderRadius: 'var(--radius-full)',
            fontFamily: 'DM Sans, sans-serif', fontSize: '0.9375rem', fontWeight: 500,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, transition: 'background 200ms ease', marginBottom: 20,
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#f8f8f8')}
          onMouseOut={e => (e.currentTarget.style.background = '#fff')}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        <div className="divider-text" style={{ marginBottom: 20 }}>
          or sign up with email
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,71,111,0.1)', border: '1px solid rgba(239,71,111,0.3)',
            borderRadius: 'var(--radius-md)', padding: '10px 14px',
            color: 'var(--color-error)', fontSize: '0.875rem', marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSignup} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
              Display Name
            </label>
            <input
              className="input"
              type="text"
              placeholder="Your name"
              required
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
              Email
            </label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 6 }}>
              Password
            </label>
            <input
              className="input"
              type="password"
              placeholder="At least 6 characters"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 8 }}>
            Create Account
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
