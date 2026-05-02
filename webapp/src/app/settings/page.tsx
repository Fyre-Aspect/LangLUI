"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { getUserProfile, updateLanguage, updateIntensity } from '@/services/userService';
import { SUPPORTED_LANGUAGES } from '@/firebase/config';
import { logOut } from '@/firebase/auth';
import Link from 'next/link';

export default function Settings() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      getUserProfile(user.uid).then(setProfile);
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await logOut();
    router.push('/');
  };

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    if (user) {
      await updateLanguage(user.uid, newLang);
      setProfile({ ...profile, targetLanguage: newLang });
    }
  };

  const handleIntensityChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIntensity = parseInt(e.target.value, 10);
    if (user) {
      await updateIntensity(user.uid, newIntensity);
      setProfile({ ...profile, intensity: newIntensity });
    }
  };

  if (loading || !profile) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <Link href="/dashboard" className="text-blue-600 hover:underline">Back to Dashboard</Link>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Account Profile</h3>
            <p className="text-gray-600">Email: {user?.email}</p>
            <p className="text-gray-600">Name: {profile?.displayName}</p>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Learning Preferences</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Language</label>
              <select 
                value={profile.targetLanguage} 
                onChange={handleLanguageChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vocabulary Intensity: {profile.intensity}
              </label>
              <input 
                type="range" 
                min="1" max="10" 
                value={profile.intensity} 
                onChange={handleIntensityChange}
                className="w-full"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <button 
              onClick={handleSignOut}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
