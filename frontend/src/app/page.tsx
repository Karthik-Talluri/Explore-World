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
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <Compass className="h-8 w-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  // 1. ROLE SELECTION LANDING PAGE (LIGHT MODERN AESTHETIC)
  if (selectedRole !== 'traveller') {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-16 overflow-hidden font-sans text-slate-900">
        {/* Soft elegant glows */}
        <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-amber-500/5 blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 h-[550px] w-[550px] rounded-full bg-blue-500/5 blur-[160px] pointer-events-none"></div>
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80')] bg-cover bg-center opacity-5 pointer-events-none" />

        <div className="relative z-10 w-full max-w-5xl space-y-12 text-center">
          
          {/* Logo Header */}
          <div className="flex flex-col items-center space-y-2 animate-fade-in">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-3xl">
              <Compass className="h-9 w-9 text-amber-500 animate-spin-slow" />
              <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent font-black tracking-tight">
                Explore World
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Luxury Portals Gateway</p>
          </div>

          <div className="space-y-3 max-w-2xl mx-auto animate-fade-in">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-none">
              Welcome to Explore World
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
              Please choose a portal to access your bookings, guide dashboard, or administrative console.
            </p>
          </div>

          {/* TRIPLE ROLE SELECTION CARDS (Airbnb Style) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto pt-4 px-2">
            
            {/* Card 1: Traveller */}
            <div 
              onClick={handleSelectTraveller}
              className="group relative rounded-3xl border border-slate-200/60 bg-white p-8 text-left space-y-6 hover:border-amber-500/30 hover:shadow-2xl transition-all duration-300 cursor-pointer shadow-lg hover:-translate-y-1.5 flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div className="inline-flex rounded-2xl bg-amber-500/10 p-4 text-amber-500">
                  <Globe className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-950 group-hover:text-amber-500 transition-colors font-sans">Traveller Portal</h3>
                  <p className="text-2xs text-slate-500 leading-relaxed font-medium">Embark on bespoke journeys curated by local experts.</p>
                </div>
                
                <ul className="space-y-2.5 border-t border-slate-100 pt-4 text-xs text-slate-600 font-medium">
                  <li className="flex items-center space-x-2">
                    <CheckSquare className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Explore tour packages</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckSquare className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Book trips seamlessly</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckSquare className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Track real-time itineraries</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckSquare className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Manage customer profile</span>
                  </li>
                </ul>
              </div>

              <button className="w-full mt-6 flex items-center justify-center space-x-2 rounded-2xl bg-slate-950 hover:bg-slate-900 py-3 text-xs font-bold text-white shadow-md transition-all">
                <span>Continue as Traveller</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Card 2: Tour Guide */}
            <div 
              onClick={handleSelectGuide}
              className="group relative rounded-3xl border border-slate-200/60 bg-white p-8 text-left space-y-6 hover:border-amber-500/30 hover:shadow-2xl transition-all duration-300 cursor-pointer shadow-lg hover:-translate-y-1.5 flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div className="inline-flex rounded-2xl bg-amber-500/10 p-4 text-amber-500">
                  <User className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-950 group-hover:text-amber-500 transition-colors font-sans">Tour Guide</h3>
                  <p className="text-2xs text-slate-500 leading-relaxed font-medium">Escort travelers through amazing landmarks worldwide.</p>
                </div>

                <ul className="space-y-2.5 border-t border-slate-100 pt-4 text-xs text-slate-600 font-medium">
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
                    <span>View earnings & details</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckSquare className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Update profile availability</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <button className="w-full mt-6 flex items-center justify-center space-x-2 rounded-2xl border border-slate-200 hover:bg-slate-50 py-3 text-xs font-bold text-slate-900 transition-all">
                  <span>Continue as Tour Guide</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <div className="text-center pt-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">New guide? </span>
                  <Link href="/guide-register" className="text-[10px] text-amber-500 font-bold hover:underline" onClick={(e) => e.stopPropagation()}>
                    Submit Application Request
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 3: Admin */}
            <div 
              onClick={() => router.push('/admin-login')}
              className="group relative rounded-3xl border border-slate-200/60 bg-white p-8 text-left space-y-6 hover:border-amber-500/30 hover:shadow-2xl transition-all duration-300 cursor-pointer shadow-lg hover:-translate-y-1.5 flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div className="inline-flex rounded-2xl bg-amber-500/10 p-4 text-amber-500">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-950 group-hover:text-amber-500 transition-colors font-sans">Admin Console</h3>
                  <p className="text-2xs text-slate-500 leading-relaxed font-medium">Configure platforms, moderate guides, and oversee bookings.</p>
                </div>

                <ul className="space-y-2.5 border-t border-slate-100 pt-4 text-xs text-slate-600 font-medium">
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
                    <span>Moderate guide reviews</span>
                  </li>
                </ul>
              </div>

              <button className="w-full mt-6 flex items-center justify-center space-x-2 rounded-2xl border border-slate-200 hover:bg-slate-50 py-3 text-xs font-bold text-slate-900 transition-all">
                <span>Continue as Admin</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

          </div>

          <div className="text-[10px] text-slate-400 font-mono">
            Explore World Security Gateway • All Rights Reserved
          </div>

        </div>
      </div>
    );
  }

  // 2. EXISTING TRAVELLER HOME PAGE WEBSITE (LIGHT LUXURY AIRBNB STYLE)
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* 1. FULL-SCREEN HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden pt-20">
        
        {/* Background Luxury Travel Image */}
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80')] bg-cover bg-center opacity-70" />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/90 via-slate-50/70 to-slate-50" />
        
        {/* Floating Abstract Glows */}
        <div className="absolute top-1/4 left-10 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl z-0" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl z-0" />

        {/* Hero Content & Dual Cards */}
        <div className="relative z-10 w-full max-w-6xl mx-auto text-center space-y-12 animate-fade-in my-10">
          
          {/* Headline & Subtitle */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 text-[10px] font-bold text-amber-600 tracking-wider uppercase shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
              <span>Explore World Escorted Portfolios</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 leading-tight">
              Discover Your{' '}
              <span className="bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent font-extrabold block sm:inline drop-shadow-sm">
                Next Adventure
              </span>
            </h1>
            <p className="text-xs sm:text-base text-slate-600 font-semibold max-w-xl mx-auto">
              Select one of our luxury domestic or international holiday portfolios to explore handpicked itineraries.
            </p>
          </div>

          {/* TWO LARGE INTERACTIVE SELECTION CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-4 px-2">
            
            {/* CARD 1: National Tours */}
            <div
              onClick={() => router.push('/national-tours')}
              className="group relative rounded-3xl border border-slate-200/80 bg-white overflow-hidden p-2 shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
            >
              <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&auto=format&fit=crop&q=80" // Taj Mahal
                  alt="National Tours"
                  className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-750"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <span className="absolute top-4 left-4 rounded-lg bg-black/60 px-3 py-1 text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                  🇮🇳 National Tours
                </span>
              </div>
              <div className="p-6 text-left space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-950 group-hover:text-amber-500 transition-colors">
                  National Portfolios
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium min-h-12">
                  Explore the beauty, heritage, beaches, and spiritual destinations across the regions of India.
                </p>
                <button className="w-full rounded-xl bg-slate-950 py-3 text-xs font-bold text-white uppercase tracking-wider shadow hover:bg-slate-900 transition-all">
                  Explore National Tours
                </button>
              </div>
            </div>

            {/* CARD 2: International Tours */}
            <div
              onClick={() => router.push('/international-tours')}
              className="group relative rounded-3xl border border-slate-200/80 bg-white overflow-hidden p-2 shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
            >
              <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&auto=format&fit=crop&q=80" // Beach
                  alt="International Tours"
                  className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-750"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <span className="absolute top-4 left-4 rounded-lg bg-black/60 px-3 py-1 text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                  🌍 International Tours
                </span>
              </div>
              <div className="p-6 text-left space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-950 group-hover:text-amber-500 transition-colors">
                  International Portfolios
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium min-h-12">
                  Discover amazing world-class destinations, coastal islands, and curated travel packages.
                </p>
                <button className="w-full rounded-xl bg-slate-950 py-3 text-xs font-bold text-white uppercase tracking-wider shadow hover:bg-slate-900 transition-all">
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
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Our Promise</span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-950 tracking-tight">Why Choose Explore World?</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold">Experience world-class luxury and tailored escorted tours.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          
          {/* 1. Best Tour Packages */}
          <div className="rounded-2xl border border-slate-200/50 bg-white p-5 shadow-sm space-y-3 hover:shadow-md hover:border-amber-500/20 transition-all">
            <div className="inline-block rounded-xl bg-amber-500/10 p-3 text-amber-500 shrink-0">
              <Map className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-950">Best Tour Packages</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Curated itineraries with 5-star cottages and experienced local escorts.
            </p>
          </div>

          {/* 2. Verified Destinations */}
          <div className="rounded-2xl border border-slate-200/50 bg-white p-5 shadow-sm space-y-3 hover:shadow-md hover:border-amber-500/20 transition-all">
            <div className="inline-block rounded-xl bg-amber-500/10 p-3 text-amber-500 shrink-0">
              <Globe className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-950">Verified Destinations</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              We inspect every resort, transfer path, and entry route prior to reservations.
            </p>
          </div>

          {/* 3. Affordable Prices */}
          <div className="rounded-2xl border border-slate-200/50 bg-white p-5 shadow-sm space-y-3 hover:shadow-md hover:border-amber-500/20 transition-all">
            <div className="inline-block rounded-xl bg-amber-500/10 p-3 text-amber-500 shrink-0">
              <Landmark className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-950">Transparent Prices</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Enjoy premium tours at competitive prices with zero hidden markups.
            </p>
          </div>

          {/* 4. 24/7 Customer Support */}
          <div className="rounded-2xl border border-slate-200/50 bg-white p-5 shadow-sm space-y-3 hover:shadow-md hover:border-amber-500/20 transition-all">
            <div className="inline-block rounded-xl bg-amber-500/10 p-3 text-amber-500 shrink-0">
              <PhoneCall className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-950">24/7 Support</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              A dedicated team of customer coordinators is online around-the-clock.
            </p>
          </div>

          {/* 5. Secure Online Booking */}
          <div className="rounded-2xl border border-slate-200/50 bg-white p-5 shadow-sm space-y-3 hover:shadow-md hover:border-amber-500/20 transition-all">
            <div className="inline-block rounded-xl bg-amber-500/10 p-3 text-amber-500 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-950">Secure Bookings</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Safe transaction checkout backed by encrypted tokenized payment gateways.
            </p>
          </div>

        </div>
      </section>

      {/* 3. ABOUT US SECTION ANCHOR */}
      <section id="about-us" className="mx-auto max-w-5xl w-full px-4 py-16 border-t border-slate-200/80 space-y-4 text-center">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-950">About Explore World</h3>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium max-w-3xl mx-auto">
          Explore World is a premier luxury travel agency specializing exclusively in domestic and international holiday tour packages. We design private, fully-escorted travel itineraries tailored to your unique desires, from romantic beach getaways in the Maldives to culturally rich heritage trails in Rajasthan. We prioritize safety, authentic local experiences, and 5-star lodgings on every single booking.
        </p>
      </section>

      {/* 4. CONTACT US SECTION ANCHOR */}
      <section id="contact-us" className="mx-auto max-w-md w-full px-4 py-16 border-t border-slate-200/80 space-y-4 text-center">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-950">Contact Our Planners</h3>
        <p className="text-xs text-slate-500 font-semibold">Have questions about visa guides or custom tours? Get in touch!</p>
        <div className="space-y-2 text-xs text-slate-600 font-medium">
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
