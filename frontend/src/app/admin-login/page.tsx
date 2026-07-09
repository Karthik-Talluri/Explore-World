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
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-16 overflow-hidden text-white font-sans">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 h-[450px] w-[450px] rounded-full bg-blue-500/5 blur-[130px] pointer-events-none"></div>
      <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1600&auto=format&fit=crop&q=80')] bg-cover bg-center opacity-5" />

      <div className="relative z-10 w-full max-w-md space-y-8">
        
        {/* Navigation Link back */}
        <Link 
          href="/" 
          className="inline-flex items-center space-x-2 text-2xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Portals</span>
        </Link>

        {/* Branding header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-2.5 text-primary font-bold text-3xl">
            <Compass className="h-9 w-9 text-amber-500 animate-spin-slow" />
            <span className="bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 bg-clip-text text-transparent font-black tracking-wide">
              Explore World
            </span>
          </div>
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-secondary/15 border border-secondary/35 px-3 py-1 text-4xs font-bold text-secondary tracking-widest uppercase">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Secure Admin Portal</span>
          </div>
        </div>

        {/* Login form Card */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-md p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-white">Administrator Login</h2>
            <p className="text-3xs text-slate-400">Enter credentials to authenticate secure management session.</p>
          </div>

          {error && (
            <div className="flex items-start space-x-2.5 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-2xs text-destructive">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-4xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@exploreworld.com"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/50 pl-10 pr-4 py-2.5 text-xs text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-4xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Secure Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/50 pl-10 pr-4 py-2.5 text-xs text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-bold text-slate-950 shadow hover:brightness-110 focus:outline-none disabled:opacity-50 transition-all duration-200 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In as Admin'}
            </button>
          </form>
        </div>

        <div className="text-center text-[10px] text-slate-500 font-mono">
          Explore World Security Gateway • Unauthorized Access Prohibited
        </div>
      </div>
    </div>
  );
}
