'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { Compass, ShieldAlert, Mail, Lock, ArrowRight } from 'lucide-react';

export default function GuideLoginPage() {
  const { apiUrl, token, user, login, logout } = useApp();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // If already authenticated as GUIDE, redirect straight to guide-dashboard
  useEffect(() => {
    if (token && user) {
      if (user.role === 'GUIDE') {
        router.push('/guide-dashboard');
      }
    }
  }, [token, user]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please verify your credentials.');
      }

      if (data.user.role !== 'GUIDE') {
        throw new Error('Only Tour Guide accounts are permitted to sign in here.');
      }

      login(data.token, data.user);
      router.push('/guide-dashboard');
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-24 sm:px-6 lg:px-8 overflow-hidden font-sans text-white">
      {/* Glow backgrounds */}
      <div className="absolute top-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-amber-500/10 blur-[130px] pointer-events-none"></div>

      <div className="relative w-full max-w-md space-y-8 z-10">
        
        {user && user.role !== 'GUIDE' ? (
          <div className="rounded-3xl border border-rose-500/20 p-8 shadow-2xl bg-slate-900/60 backdrop-blur-xl space-y-6 text-center">
            <ShieldAlert className="h-14 w-14 text-rose-500 mx-auto animate-pulse" />
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold tracking-tight text-white">Guide Credentials Required</h2>
              <p className="text-xs text-slate-400">
                Your current account is registered as a <strong className="text-amber-500 uppercase">{user.role}</strong>. Only Tour Guide accounts are permitted to access this portal.
              </p>
            </div>
            <button
              onClick={logout}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-bold text-slate-950 shadow-lg hover:brightness-110 transition-all duration-200"
            >
              Logout & Sign In as Guide
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center text-center space-y-3">
              <a className="flex items-center space-x-2 text-primary font-bold text-2xl" href="/">
                <Compass className="h-8 w-8 text-amber-500 animate-spin-slow" />
                <span className="bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 bg-clip-text text-transparent font-black tracking-wide">
                  Explore World
                </span>
              </a>
              <div className="space-y-1 mt-2">
                <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">Tour Guide Portal</h2>
                <p className="text-xs text-slate-400">Sign in with your Guide credentials to manage assigned tours</p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl bg-slate-900/60 backdrop-blur-xl">
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                
                {loginError && (
                  <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500 flex items-center space-x-2">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Guide Email Address</label>
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
                      className="w-full rounded-xl bg-slate-950/80 border border-white/10 pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Security Password</label>
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
                      className="w-full rounded-xl bg-slate-950/80 border border-white/10 pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="group relative flex w-full justify-center items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-bold text-slate-950 shadow-lg hover:brightness-110 disabled:opacity-50 transition-all duration-200"
                >
                  <span>{loginLoading ? 'Signing In...' : 'Sign In as Guide'}</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 px-4">
              <a className="hover:text-white transition-colors" href="/">← Back to explorer website</a>
              <span className="flex items-center space-x-1 font-mono">
                <ShieldAlert className="h-3 w-3 text-amber-500" />
                <span>Authorized Guides Only</span>
              </span>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
