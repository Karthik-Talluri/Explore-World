'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Compass, Lock, Mail, AlertCircle, ArrowLeft, CheckCircle2, User as UserIcon, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function GuideRegisterPage() {
  const { apiUrl } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/api/auth/register-guide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, specialization, phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess(true);
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
      <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&auto=format&fit=crop&q=80')] bg-cover bg-center opacity-5" />

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
          <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase font-sans">Tour Guide Network Application</p>
        </div>

        {/* Form Card */}
        <div className="rounded-[18px] border border-white/5 bg-slate-900/60 backdrop-blur-md p-8 shadow-2xl space-y-6">
          {success ? (
            <div className="text-center space-y-5 py-4">
              <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto animate-bounce" />
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white font-sans">Application Submitted!</h3>
                <p className="text-xs text-slate-350 leading-relaxed font-semibold">
                  Thank you for applying. Your registration request is pending review. Once an administrator approves your account, you will be able to log in to the Tour Guide Portal.
                </p>
              </div>
              <Link 
                href="/" 
                className="inline-block rounded-xl bg-amber-500 px-6 py-3 text-xs font-bold text-slate-950 hover:brightness-110 transition-all shadow"
              >
                Return to Gateway
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center space-y-1">
                <h2 className="text-base font-bold text-white font-sans">Register as Tour Guide</h2>
                <p className="text-[11px] text-slate-400 font-semibold">Fill in details below to submit your service registration request.</p>
              </div>

              {error && (
                <div className="flex items-start space-x-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-2xs text-rose-400 font-semibold">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 font-semibold text-slate-400">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <UserIcon className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alexander Guide"
                      className="w-full rounded-xl border border-white/15 bg-slate-950/60 pl-10 pr-4 py-2.5 text-xs text-white focus:border-amber-500/50 focus:outline-none transition-all font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Email Address
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
                      placeholder="alexander@exploreworld.com"
                      className="w-full rounded-xl border border-white/15 bg-slate-950/60 pl-10 pr-4 py-2.5 text-xs text-white focus:border-amber-500/50 focus:outline-none transition-all font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Security Password
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

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Specializations (Destinations, Comma Separated)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Compass className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="text"
                      required
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="Kashmir, Rajasthan, Dubai"
                      className="w-full rounded-xl border border-white/15 bg-slate-950/60 pl-10 pr-4 py-2.5 text-xs text-white focus:border-amber-500/50 focus:outline-none transition-all font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Contact Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Phone className="h-4.5 w-4.5" />
                    </span>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-white/15 bg-slate-950/60 pl-10 pr-4 py-2.5 text-xs text-white focus:border-amber-500/50 focus:outline-none transition-all font-semibold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-955 shadow hover:brightness-110 disabled:opacity-50 transition-all duration-200 mt-2"
                >
                  {loading ? 'Submitting Application...' : 'Register Registration Request'}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="text-center text-[10px] text-slate-600 font-mono">
          Explore World Security Gateway • All Applications Logged
        </div>
      </div>
    </div>
  );
}
