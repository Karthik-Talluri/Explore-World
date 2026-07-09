'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Compass, Sparkles, ShieldCheck, Landmark, CheckSquare, MessageSquare, 
  PhoneCall, Globe, Map, User, CheckCircle2, ArrowRight
} from 'lucide-react';
import AIAssistant from '@/components/AIAssistant';

export default function Home() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setSelectedRole(sessionStorage.getItem('explore_world_role'));
    setIsMounted(true);
  }, []);

  const handleSelectTraveller = () => {
    sessionStorage.setItem('explore_world_role', 'traveller');
    setSelectedRole('traveller');
    window.dispatchEvent(new Event('explore-world-role-changed'));
  };

  const handleSelectGuide = () => {
    router.push('/guide');
  };

  if (!isMounted) {
    return (
      <div className="flex min-h-screen bg-slate-950 items-center justify-center text-white">
        <Compass className="h-8 w-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  // 1. ROLE SELECTION LANDING PAGE
  if (selectedRole !== 'traveller') {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-16 overflow-hidden font-sans text-white">
        {/* Glow backgrounds */}
        <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 h-[450px] w-[450px] rounded-full bg-blue-500/5 blur-[130px] pointer-events-none"></div>
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10" />

        <div className="relative z-10 w-full max-w-4xl space-y-12 text-center">
          
          {/* Logo Header */}
          <div className="flex flex-col items-center space-y-3">
            <div className="flex items-center space-x-2.5 text-primary font-bold text-3xl">
              <Compass className="h-9 w-9 text-amber-500 animate-spin-slow" />
              <span className="bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 bg-clip-text text-transparent font-black tracking-wide">
                Explore World
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Elite Portals Gateway</p>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Select Your Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Please choose whether you are traveling with us or guiding our guests.
            </p>
          </div>

          {/* TRIPLE ROLE SELECTION CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto pt-4">
            
            {/* Card 1: Traveller */}
            <div 
              onClick={handleSelectTraveller}
              className="group relative rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-md p-8 text-left space-y-6 hover:border-amber-500/30 transition-all duration-300 cursor-pointer shadow-2xl hover:-translate-y-1"
            >
              <div className="inline-flex rounded-2xl bg-amber-500/10 p-4 text-amber-500">
                <Globe className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white group-hover:text-amber-500 transition-colors">Traveller</h3>
                <p className="text-2xs text-slate-400">Embark on bespoke journeys curated by local experts.</p>
              </div>
              
              <ul className="space-y-2.5 border-t border-white/5 pt-4 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckSquare className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Explore tour packages</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckSquare className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Book trips</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckSquare className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Track bookings</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckSquare className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Manage profile</span>
                </li>
              </ul>

              <button className="w-full mt-4 flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-bold text-slate-950 shadow hover:brightness-110 transition-all">
                <span>Continue as Traveller</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Card 2: Tour Guide */}
            <div 
              onClick={handleSelectGuide}
              className="group relative rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-md p-8 text-left space-y-6 hover:border-amber-500/30 transition-all duration-300 cursor-pointer shadow-2xl hover:-translate-y-1"
            >
              <div className="inline-flex rounded-2xl bg-amber-500/10 p-4 text-amber-500">
                <User className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white group-hover:text-amber-500 transition-colors">Tour Guide</h3>
                <p className="text-2xs text-slate-400">Escort travelers through amazing landmarks.</p>
              </div>

              <ul className="space-y-2.5 border-t border-white/5 pt-4 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckSquare className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Receive booking requests</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckSquare className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Manage assigned tours</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckSquare className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>View earnings</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckSquare className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Update availability</span>
                </li>
              </ul>

              <button className="w-full mt-4 flex items-center justify-center space-x-2 rounded-xl border border-amber-500/20 hover:bg-amber-500/10 py-3 text-xs font-bold text-amber-500 transition-all">
                <span>Continue as Tour Guide</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <div className="text-center pt-2">
                <span className="text-[10px] text-slate-500">New guide? </span>
                <Link href="/guide-register" className="text-[10px] text-amber-500 font-bold hover:underline" onClick={(e) => e.stopPropagation()}>
                  Submit Registration Request
                </Link>
              </div>
            </div>

            {/* Card 3: Admin */}
            <div 
              onClick={() => router.push('/admin-login')}
              className="group relative rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-md p-8 text-left space-y-6 hover:border-amber-500/30 transition-all duration-300 cursor-pointer shadow-2xl hover:-translate-y-1"
            >
              <div className="inline-flex rounded-2xl bg-amber-500/10 p-4 text-amber-500">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white group-hover:text-amber-500 transition-colors">Admin Portal</h3>
                <p className="text-2xs text-slate-400">Configure platform data, adjust packages, and assign guides.</p>
              </div>

              <ul className="space-y-2.5 border-t border-white/5 pt-4 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckSquare className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Manage packages & catalogs</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckSquare className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Track payment transactions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckSquare className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Reassign bookings manually</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckSquare className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>Moderate guide registrations</span>
                </li>
              </ul>

              <button className="w-full mt-4 flex items-center justify-center space-x-2 rounded-xl border border-amber-500/20 hover:bg-amber-500/10 py-3 text-xs font-bold text-amber-500 transition-all">
                <span>Continue as Admin</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

          </div>

          <div className="text-[10px] text-slate-500 font-mono">
            Explore World Escapes Portal Gateway • All Rights Reserved
          </div>

        </div>
      </div>
    );
  }

  // 2. EXISTING TRAVELLER HOME PAGE WEBSITE
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      
      {/* 1. FULL-SCREEN HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden pt-20">
        
        {/* Background Luxury Travel Image */}
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80')] bg-cover bg-center opacity-35" />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-950/90 via-slate-900/60 to-slate-950" />
        
        {/* Floating Abstract Glows */}
        <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-blue-900/20 blur-3xl z-0" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-secondary/15 blur-3xl z-0" />

        {/* Hero Content & Dual Cards */}
        <div className="relative z-10 w-full max-w-6xl mx-auto text-center space-y-12 animate-fade-in my-10">
          
          {/* Headline & Subtitle */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 rounded-full bg-secondary/15 border border-secondary/35 px-4 py-1.5 text-3xs font-extrabold text-secondary tracking-widest uppercase shadow-[0_0_15px_rgba(197,160,89,0.15)]">
              <Sparkles className="h-3.5 w-3.5 text-secondary animate-pulse" />
              <span>Explore World Portfolios</span>
            </div>
            <h1 className="text-4xl sm:text-7xl font-black tracking-tight text-white leading-tight">
              Discover Your{' '}
              <span className="text-gold-gradient block sm:inline font-extrabold drop-shadow">
                Next Adventure
              </span>
            </h1>
            <p className="text-xs sm:text-base text-slate-300 font-medium">
              Choose your travel destination and explore unforgettable tour packages.
            </p>
          </div>

          {/* TWO LARGE INTERACTIVE SELECTION CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto pt-4">
            
            {/* CARD 1: National Tours */}
            <div
              onClick={() => router.push('/national-tours')}
              className="group relative rounded-3xl border border-secondary/20 bg-slate-900/40 backdrop-blur-md overflow-hidden p-1 shadow-2xl hover:border-secondary/40 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
            >
              <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&auto=format&fit=crop&q=80" // Taj Mahal
                  alt="National Tours"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <span className="absolute top-4 left-4 rounded-lg bg-black/60 px-3 py-1 text-3xs font-bold text-secondary uppercase tracking-widest">
                  🇮🇳 National Tours
                </span>
              </div>
              <div className="p-6 text-left space-y-4">
                <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-secondary transition-colors">
                  National Tours
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed min-h-12">
                  Explore the beauty, culture, heritage, beaches, mountains, wildlife, and spiritual destinations across India.
                </p>
                <button className="w-full rounded-xl bg-gradient-to-r from-secondary to-amber-600 py-3 text-xs font-black text-slate-950 uppercase tracking-wider shadow hover:brightness-110 active:scale-98 transition-all">
                  Explore National Tours
                </button>
              </div>
            </div>

            {/* CARD 2: International Tours */}
            <div
              onClick={() => router.push('/international-tours')}
              className="group relative rounded-3xl border border-secondary/20 bg-slate-900/40 backdrop-blur-md overflow-hidden p-1 shadow-2xl hover:border-secondary/40 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
            >
              <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&auto=format&fit=crop&q=80" // World Travel Beach
                  alt="International Tours"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <span className="absolute top-4 left-4 rounded-lg bg-black/60 px-3 py-1 text-3xs font-bold text-secondary uppercase tracking-widest">
                  🌍 International Tours
                </span>
              </div>
              <div className="p-6 text-left space-y-4">
                <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-secondary transition-colors">
                  International Tours
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed min-h-12">
                  Discover amazing international destinations, iconic landmarks, beaches, islands, mountains, and unforgettable travel experiences around the world.
                </p>
                <button className="w-full rounded-xl bg-gradient-to-r from-secondary to-amber-600 py-3 text-xs font-black text-slate-950 uppercase tracking-wider shadow hover:brightness-110 active:scale-98 transition-all">
                  Explore International Tours
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. WHY CHOOSE EXPLORE WORLD SECTION */}
      <section className="mx-auto max-w-7xl w-full px-4 py-20 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest">Our Promise</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Why Choose Explore World?</h2>
          <p className="text-xs sm:text-sm text-slate-400">Experience world-class luxury and tailored escorted tours.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          
          {/* 1. Best Tour Packages */}
          <div className="rounded-2xl border border-border bg-slate-900/30 p-5 shadow-sm space-y-3 hover:border-secondary/30 transition-colors">
            <div className="inline-block rounded-xl bg-secondary/15 p-3 text-secondary shrink-0">
              <Map className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Best Tour Packages</h4>
            <p className="text-3xs text-slate-400 leading-relaxed">
              Curated itineraries with 5-star cottages and experienced local escorts.
            </p>
          </div>

          {/* 2. Verified Destinations */}
          <div className="rounded-2xl border border-border bg-slate-900/30 p-5 shadow-sm space-y-3 hover:border-secondary/30 transition-colors">
            <div className="inline-block rounded-xl bg-secondary/15 p-3 text-secondary shrink-0">
              <Globe className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Verified Destinations</h4>
            <p className="text-3xs text-slate-400 leading-relaxed">
              We inspect every resort, transfer path, and entry route prior to reservations.
            </p>
          </div>

          {/* 3. Affordable Prices */}
          <div className="rounded-2xl border border-border bg-slate-900/30 p-5 shadow-sm space-y-3 hover:border-secondary/30 transition-colors">
            <div className="inline-block rounded-xl bg-secondary/15 p-3 text-secondary shrink-0">
              <Landmark className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Affordable Prices</h4>
            <p className="text-3xs text-slate-400 leading-relaxed">
              Enjoy premium tours at transparent competitive prices with zero hidden markups.
            </p>
          </div>

          {/* 4. 24/7 Customer Support */}
          <div className="rounded-2xl border border-border bg-slate-900/30 p-5 shadow-sm space-y-3 hover:border-secondary/30 transition-colors">
            <div className="inline-block rounded-xl bg-secondary/15 p-3 text-secondary shrink-0">
              <PhoneCall className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white">24/7 Support</h4>
            <p className="text-3xs text-slate-400 leading-relaxed">
              A dedicated team of customer coordinators is online around-the-clock.
            </p>
          </div>

          {/* 5. Secure Online Booking */}
          <div className="rounded-2xl border border-border bg-slate-900/30 p-5 shadow-sm space-y-3 hover:border-secondary/30 transition-colors">
            <div className="inline-block rounded-xl bg-secondary/15 p-3 text-secondary shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Secure Online Booking</h4>
            <p className="text-3xs text-slate-400 leading-relaxed">
              Safe transaction checkout backed by encrypted tokenized payment gateways.
            </p>
          </div>

        </div>
      </section>

      {/* 3. ABOUT US SECTION ANCHOR */}
      <section id="about-us" className="mx-auto max-w-5xl w-full px-4 py-16 border-t border-border/20 space-y-4 text-center">
        <h3 className="text-xl sm:text-2xl font-extrabold text-white">About Explore World</h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-3xl mx-auto">
          Explore World is a premier luxury travel agency specializing exclusively in domestic and international holiday tour packages. We design private, fully-escorted travel itineraries tailored to your unique desires, from romantic beach getaways in the Maldives to culturally rich heritage trails in Rajasthan. We prioritize safety, authentic local experiences, and 5-star lodgings on every single booking.
        </p>
      </section>

      {/* 4. CONTACT US SECTION ANCHOR */}
      <section id="contact-us" className="mx-auto max-w-md w-full px-4 py-16 border-t border-border/20 space-y-4 text-center">
        <h3 className="text-xl sm:text-2xl font-extrabold text-white">Contact Our Planners</h3>
        <p className="text-xs text-slate-400">Have questions about visa guides or custom tours? Get in touch!</p>
        <div className="space-y-2 text-xs">
          <p>📞 Phone support: <strong>+1 (800) 555-Tours</strong></p>
          <p>✉️ Email inbox: <strong>concierge@exploreworld.com</strong></p>
          <p>📍 Office: <strong>Explore World Elite HQ, Mumbai & San Francisco</strong></p>
        </div>
      </section>

      {/* Floating chatbot assistant */}
      <AIAssistant />

    </div>
  );
}
