'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { Compass, Mail, Lock, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function GuideLoginPage() {
  const { apiUrl, token, user, login } = useApp();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in as a guide, redirect directly
  useEffect(() => {
    if (token && user) {
      if (user.role === 'GUIDE') {
        router.push('/guide-dashboard');
      } else if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [token, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid email or password');
      }

      // Role check: Only allow users with GUIDE role to log in through this page
      if (data.user.role !== 'GUIDE') {
        throw new Error('Access Denied: Only Tour Guide accounts are permitted to sign in here.');
      }

      // Store in AppContext
      login(data.token, data.user);
      router.push('/guide-dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[90vh] items-center justify-center bg-slate-950 px-4 py-24 sm:px-6 lg:px-8 overflow-hidden">
      
      {/* Background ambient glow circles */}
      <div className="absolute top-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />

      <div className="relative w-full max-w-md space-y-8 z-10">
        
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Link href="/" className="flex items-center space-x-2 text-primary font-bold text-2xl">
            <Compass className="h-8 w-8 text-secondary animate-spin-slow" />
            <span className="bg-gradient-to-r from-secondary via-amber-300 to-secondary bg-clip-text text-transparent font-black tracking-wide">
              Explore World
            </span>
          </Link>
          <div className="space-y-1 mt-2">
            <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
              Tour Guide Console
            </h2>
            <p className="text-xs text-slate-400">
              Sign in with your Guide credentials to manage assigned tours
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="glass rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl bg-slate-900/60 backdrop-blur-xl">
          
          {error && (
            <div className="mb-6 flex items-start space-x-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-3xs font-bold uppercase tracking-wider text-slate-400 block">
                Guide Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="guide@exploreworld.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-slate-950/80 border border-white/10 pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-secondary transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-3xs font-bold uppercase tracking-wider text-slate-400 block">
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-slate-950/80 border border-white/10 pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-secondary transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center items-center space-x-2 rounded-xl bg-gradient-to-r from-secondary to-amber-600 py-3 text-xs font-bold text-slate-950 shadow-lg hover:brightness-110 disabled:opacity-50 transition-all duration-200"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In as Guide'}</span>
              {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />}
            </button>
          </form>

        </div>

        {/* Bottom Helper Info */}
        <div className="flex justify-between items-center text-3xs text-slate-500 px-4">
          <Link href="/" className="hover:text-white transition-colors">
            ← Back to explore website
          </Link>
          <span className="flex items-center space-x-1">
            <ShieldAlert className="h-3 w-3 text-secondary" />
            <span>Secure Portal Authorization</span>
          </span>
        </div>

      </div>
    </div>
  );
}
