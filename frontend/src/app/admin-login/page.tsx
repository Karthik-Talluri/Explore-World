'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Compass, Lock, Mail, AlertCircle, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const { apiUrl, login, token, user } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in as Admin
  useEffect(() => {
    if (token && user?.role === 'ADMIN') {
      router.push('/admin');
    }
  }, [token, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (data.user.role !== 'ADMIN') {
        throw new Error('Access Forbidden: This portal is reserved for administrators only.');
      }

      login(data.token, data.user);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark bg-slate-950 text-slate-100 min-h-screen relative flex flex-col items-center justify-center px-4 py-16 overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 h-[450px] w-[450px] rounded-full bg-blue-500/5 blur-[130px] pointer-events-none"></div>
      <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1600&auto=format&fit=crop&q=80')] bg-cover bg-center opacity-5" />

      <div className="relative z-10 w-full max-w-md space-y-8">
        
        {/* Navigation Link back */}
        <Link 
          href="/" 
          className="inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Portals</span>
        </Link>

        {/* Branding header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-2 text-3xl">
            <Compass className="h-8.5 w-8.5 text-amber-500 animate-spin-slow" />
            <span className="font-bold text-white font-sans tracking-wide">
              Explore World
            </span>
          </div>
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 text-[9px] font-bold text-amber-500 tracking-widest uppercase font-sans">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Secure Admin Portal</span>
          </div>
        </div>

        {/* Login form Card */}
        <div className="rounded-[18px] border border-white/5 bg-slate-900/60 backdrop-blur-md p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-base font-bold text-white font-sans">Administrator Login</h2>
            <p className="text-[11px] text-slate-400 font-semibold">Enter credentials to authenticate secure management session.</p>
          </div>

          {error && (
            <div className="flex items-start space-x-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-2xs text-rose-450 font-semibold">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 font-semibold text-slate-400">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@exploreworld.com"
                  className="w-full rounded-xl border border-white/15 bg-slate-950/60 pl-10 pr-4 py-2.5 text-xs text-white focus:border-amber-500/50 focus:outline-none transition-all font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Secure Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/15 bg-slate-950/60 pl-10 pr-4 py-2.5 text-xs text-white focus:border-amber-500/50 focus:outline-none transition-all font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-955 shadow hover:brightness-110 disabled:opacity-50 transition-all duration-200 mt-2 font-sans"
            >
              {loading ? 'Authenticating...' : 'Sign In as Admin'}
            </button>
          </form>
        </div>

        <div className="text-center text-[10px] text-slate-650 font-mono">
          Explore World Security Gateway • Unauthorized Access Prohibited
        </div>
      </div>
    </div>
  );
}
