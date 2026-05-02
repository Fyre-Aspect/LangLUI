"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { getUserProfile, updateLanguage, updateIntensity } from '@/services/userService';
import { SUPPORTED_LANGUAGES } from '@/firebase/config';
import { Flame, Coins, Settings } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
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
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-8">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <Link href="/settings" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <Settings className="w-5 h-5 text-gray-600" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-center justify-between">
            <div>
              <p className="text-blue-600 font-semibold mb-1">Credits</p>
              <p className="text-4xl font-bold text-blue-900 flex items-center"><Coins className="mr-2 text-yellow-500" /> {profile.credits}</p>
            </div>
            <div>
              <p className="text-orange-600 font-semibold mb-1">Streak</p>
              <p className="text-4xl font-bold text-orange-900 flex items-center"><Flame className="mr-2 text-orange-500" /> {profile.streak}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
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
              <p className="text-xs text-gray-500 mt-1">Higher intensity highlights more words.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Recent Vocabulary</h2>
          <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
            Start browsing the web with the LangLua extension to see vocabulary here!
          </div>
        </div>
      </div>
    </div>
  );
}
