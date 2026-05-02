"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Landing() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 px-4">
      <main className="text-center max-w-2xl mx-auto space-y-8">
        <h1 className="text-5xl font-bold tracking-tight text-blue-600">LangLua</h1>
        <h2 className="text-2xl text-gray-600 font-medium">Learn by Living the Web</h2>
        <p className="text-lg text-gray-500">
          Replaces words on any webpage with their translation. Build your vocabulary just by browsing.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link href="/signup" className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
            Sign Up Now
          </Link>
          <Link href="/login" className="px-8 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition">
            Log In
          </Link>
        </div>
      </main>
    </div>
  );
}
