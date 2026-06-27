'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Compass, Search, Palmtree, Sparkles, MapPin, Star, ShieldCheck, Landmark } from 'lucide-react';
import AIAssistant from '@/components/AIAssistant';

export default function Home() {
  const router = useRouter();
  const [destinationQuery, setDestinationQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (destinationQuery.trim()) {
      router.push(`/packages?destination=${encodeURIComponent(destinationQuery.trim())}`);
    } else {
      router.push('/packages');
    }
  };

  const handleSelectCategory = (cat: 'national' | 'international') => {
    router.push(`/packages?category=${cat}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* LUXURY HERO HEADER */}
      <section className="relative flex min-h-[580px] items-center justify-center bg-slate-950 px-4 py-24 text-center overflow-hidden">
        {/* Background Image / Overlay */}
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/80 via-background to-background" />

        {/* Floating circles */}
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-blue-900/20 blur-3xl" />

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto space-y-10 animate-fade-in">
          
          <div className="space-y-4">
            <span className="inline-flex items-center space-x-1.5 rounded-full bg-secondary/15 border border-secondary/20 px-4 py-1 text-2xs font-bold text-secondary tracking-widest uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Bespoke Luxury Holiday Packages</span>
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Where would you like to{' '}
              <span className="text-gold-gradient block sm:inline">
                Travel?
              </span>
            </h1>
            <p className="max-w-xl mx-auto text-xs sm:text-sm text-muted-foreground">
              Discover customized tour packages across 26 Indian States and 32 global international countries. Fully escorted tours with private guides, premium transfers, and 5-star stays.
            </p>
          </div>

          {/* SEARCH BOX */}
          <form onSubmit={handleSearchSubmit} className="glass rounded-2xl p-3 shadow-2xl w-full max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-grow w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Search className="h-5 w-5 text-secondary" />
              </span>
              <input
                type="text"
                value={destinationQuery}
                onChange={(e) => setDestinationQuery(e.target.value)}
                placeholder="Search by destination (e.g. Kashmir, Maldives, Bali, Switzerland)..."
                className="w-full rounded-xl border-0 bg-transparent pl-10 pr-3 py-3 text-sm text-foreground focus:outline-none focus:ring-0"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-secondary to-amber-600 px-8 py-3 text-xs font-bold text-slate-950 shadow-md hover:brightness-110 active:scale-98 transition-all"
            >
              Search Packages
            </button>
          </form>

        </div>
      </section>

      {/* TWO LARGE INTERACTIVE SELECTION CARDS */}
      <section className="mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Curated Portfolios</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Select your region to explore hand-picked holiday package itineraries.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* CARD 1: National (India) */}
          <div
            onClick={() => handleSelectCategory('national')}
            className="group relative h-96 rounded-3xl overflow-hidden shadow-2xl border border-secondary/20 cursor-pointer hover:scale-101 hover:border-secondary transition-all duration-300"
          >
            <img
              src="https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&auto=format&fit=crop&q=80" // Taj Mahal/India
              alt="Explore India"
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
            
            {/* Content overlay */}
            <div className="absolute bottom-8 left-8 right-8 space-y-3">
              <span className="rounded bg-secondary px-3 py-1 text-3xs font-bold text-slate-950 uppercase tracking-widest">
                🇮🇳 National
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">Explore India</h3>
              <p className="text-xs text-slate-300 max-w-sm">
                From snow-capped Himalayan retreats in Kashmir and Ladakh to golden desert palaces in Rajasthan and tropical backwaters in Kerala.
              </p>
              <div className="flex items-center space-x-1 text-xs font-bold text-secondary pt-1 group-hover:translate-x-1.5 transition-transform">
                <span>View 26 States Packages</span>
                <span>➔</span>
              </div>
            </div>
          </div>

          {/* CARD 2: International */}
          <div
            onClick={() => handleSelectCategory('international')}
            className="group relative h-96 rounded-3xl overflow-hidden shadow-2xl border border-secondary/20 cursor-pointer hover:scale-101 hover:border-secondary transition-all duration-300"
          >
            <img
              src="https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&auto=format&fit=crop&q=80" // Sydney Opera / Global
              alt="Explore International"
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
            
            {/* Content overlay */}
            <div className="absolute bottom-8 left-8 right-8 space-y-3">
              <span className="rounded bg-secondary px-3 py-1 text-3xs font-bold text-slate-950 uppercase tracking-widest">
                🌍 International
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">Explore International</h3>
              <p className="text-xs text-slate-300 max-w-sm">
                Discover skyline luxury in Dubai, private overwater pool villas in Maldives, scenic Swiss Alps routes, or ancient temples in Japan.
              </p>
              <div className="flex items-center space-x-1 text-xs font-bold text-secondary pt-1 group-hover:translate-x-1.5 transition-transform">
                <span>View 32 Countries Packages</span>
                <span>➔</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FEATURED / BEST SEASON PACKAGE SELECTION */}
      <section className="bg-muted/40 py-16 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 space-y-3 sm:space-y-0">
            <div>
              <span className="text-xs font-bold text-secondary uppercase tracking-widest block">Signature Tours</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Best Season Holiday Packages</h2>
            </div>
            <button
              onClick={() => router.push('/packages')}
              className="text-xs font-bold text-secondary hover:underline"
            >
              Browse All Packages ➔
            </button>
          </div>

          {/* Grid list of featured packages */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Featured 1 */}
            <div
              onClick={() => router.push('/packages')}
              className="group rounded-2xl border border-border bg-card overflow-hidden shadow-md cursor-pointer hover:border-secondary/30 transition-colors"
            >
              <img
                src="https://images.unsplash.com/photo-1566837945700-30057527ade0?w=600"
                alt="Kashmir"
                className="h-48 w-full object-cover group-hover:scale-102 transition-transform duration-500"
              />
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-center text-3xs font-semibold text-muted-foreground uppercase">
                  <span>6 Days • National</span>
                  <span className="text-secondary">Best: Mar-Oct</span>
                </div>
                <h4 className="text-sm font-bold text-foreground group-hover:text-secondary transition-colors">
                  Kashmir Paradise Valley Tour
                </h4>
                <div className="flex justify-between items-center border-t border-border/20 pt-3">
                  <span className="text-xs font-extrabold text-foreground">$499 <span className="text-4xs text-muted-foreground font-normal">/ traveler</span></span>
                  <span className="text-3xs font-bold text-secondary">View Details</span>
                </div>
              </div>
            </div>

            {/* Featured 2 */}
            <div
              onClick={() => router.push('/packages')}
              className="group rounded-2xl border border-border bg-card overflow-hidden shadow-md cursor-pointer hover:border-secondary/30 transition-colors"
            >
              <img
                src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600"
                alt="Maldives"
                className="h-48 w-full object-cover group-hover:scale-102 transition-transform duration-500"
              />
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-center text-3xs font-semibold text-muted-foreground uppercase">
                  <span>5 Days • International</span>
                  <span className="text-secondary">Best: Nov-Apr</span>
                </div>
                <h4 className="text-sm font-bold text-foreground group-hover:text-secondary transition-colors">
                  Maldives Overwater Pool Villa Getaway
                </h4>
                <div className="flex justify-between items-center border-t border-border/20 pt-3">
                  <span className="text-xs font-extrabold text-foreground">$1899 <span className="text-4xs text-muted-foreground font-normal">/ traveler</span></span>
                  <span className="text-3xs font-bold text-secondary">View Details</span>
                </div>
              </div>
            </div>

            {/* Featured 3 */}
            <div
              onClick={() => router.push('/packages')}
              className="group rounded-2xl border border-border bg-card overflow-hidden shadow-md cursor-pointer hover:border-secondary/30 transition-colors"
            >
              <img
                src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600"
                alt="Dubai"
                className="h-48 w-full object-cover group-hover:scale-102 transition-transform duration-500"
              />
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-center text-3xs font-semibold text-muted-foreground uppercase">
                  <span>5 Days • International</span>
                  <span className="text-secondary">Best: Nov-Apr</span>
                </div>
                <h4 className="text-sm font-bold text-foreground group-hover:text-secondary transition-colors">
                  Dubai Luxury Skyline Escape
                </h4>
                <div className="flex justify-between items-center border-t border-border/20 pt-3">
                  <span className="text-xs font-extrabold text-foreground">$1399 <span className="text-4xs text-muted-foreground font-normal">/ traveler</span></span>
                  <span className="text-3xs font-bold text-secondary">View Details</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* LUXURY TRUST & VALUES */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
            <div className="inline-block rounded-xl bg-secondary/15 p-3 text-secondary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Escorted Group Safety</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every tour package includes licensed professional local guides and dedicated luxury vehicles with round-the-clock emergency assistance.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
            <div className="inline-block rounded-xl bg-secondary/15 p-3 text-secondary">
              <Landmark className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Verified Luxury Lodgings</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We partner strictly with 4-star and 5-star properties, guaranteeing room upgrades, buffet breakfasts, and complimentary spa benefits.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
            <div className="inline-block rounded-xl bg-secondary/15 p-3 text-secondary">
              <Palmtree className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Tailored Special Requests</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Customize your packages with private candlelight dinners, anniversary cakes, vegetarian catering, and wheelchair-accessible transport.
            </p>
          </div>
        </div>
      </section>

      {/* Floating chatbot assistant */}
      <AIAssistant />

    </div>
  );
}
