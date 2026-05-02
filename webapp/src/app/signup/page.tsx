"use client";

import { useState } from 'react';
import { signUpWithEmail, signInWithGoogle } from '@/firebase/auth';
import { createUserProfile } from '@/services/userService';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { user } = await signUpWithEmail(email, password);
      await createUserProfile(user.uid, user.email, name);
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Signup failed');
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const { user } = await signInWithGoogle();
      await createUserProfile(user.uid, user.email, user.displayName);
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Google Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Sign Up for LangLua</h2>
        <form onSubmit={handleEmailSignup} className="space-y-4">
          <input 
            type="text" 
            placeholder="Display Name" 
            required 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input 
            type="email" 
            placeholder="Email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input 
            type="password" 
            placeholder="Password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
            Sign Up
          </button>
        </form>
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t"></div>
          <span className="px-4 text-gray-500 text-sm">OR</span>
          <div className="flex-1 border-t"></div>
        </div>
        <button 
          onClick={handleGoogleSignup}
          className="w-full py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
