'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Plane, Building, Compass, ShieldCheck, FileText, Landmark, ArrowRight, Star, Heart } from 'lucide-react';
import AIAssistant from '@/components/AIAssistant';
import AuthModal from '@/components/AuthModal';
import CheckoutModal from '@/components/CheckoutModal';

const DESTINATIONS = [
  {
    name: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80',
    tag: 'Romantic',
    rating: 4.9,
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?w=600&auto=format&fit=crop&q=80',
    tag: 'Adventure',
    rating: 4.8,
  },
  {
    name: 'Dubai',
    country: 'UAE',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop&q=80',
    tag: 'Luxury',
    rating: 4.7,
  },
  {
    name: 'Sydney',
    country: 'Australia',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&auto=format&fit=crop&q=80',
    tag: 'Nature',
    rating: 4.8,
  },
];

const PACKAGES = [
  {
    id: 'pkg-1',
    title: 'Parisian Romance & Fine Art',
    location: 'PARIS',
    duration: '5 Days, 4 Nights',
    price: 1250,
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&auto=format&fit=crop&q=80',
    highlights: 'Luxury hotel, Louvre VIP Pass, Seine dinner cruise',
  },
  {
    id: 'pkg-2',
    title: 'Tokyo Neon & Historic Temples',
    location: 'TOKYO',
    duration: '6 Days, 5 Nights',
    price: 1580,
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&auto=format&fit=crop&q=80',
    highlights: 'Shibuya Skyline suite, Mt Fuji day trip, Sushi master class',
  },
];

export default function Home() {
  const router = useRouter();
  const { token, setActiveBooking } = useApp();
  
  const [searchTab, setSearchTab] = useState<'flights' | 'hotels'>('flights');
  const [fromCity, setFromCity] = useState('New York');
  const [toCity, setToCity] = useState('Paris');
  const [date, setDate] = useState('2026-07-15');
  const [hotelLocation, setHotelLocation] = useState('Paris');

  // Modal controls
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTab === 'flights') {
      router.push(`/flights?from=${encodeURIComponent(fromCity)}&to=${encodeURIComponent(toCity)}&date=${encodeURIComponent(date)}`);
    } else {
      router.push(`/hotels?location=${encodeURIComponent(hotelLocation)}`);
    }
  };

  const handleBookPackage = (pkg: any) => {
    if (!token) {
      setIsAuthOpen(true);
      return;
    }
    setActiveBooking({
      type: 'PACKAGE',
      details: {
        title: pkg.title,
        duration: pkg.duration,
        highlights: pkg.highlights,
        destination: pkg.location,
      },
      totalPrice: pkg.price,
    });
    setIsCheckoutOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* HERO SECTION */}
      <section className="relative flex min-h-[600px] items-center justify-center bg-slate-900 px-4 py-24 text-center overflow-hidden">
        
        {/* Background Image / Overlay */}
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40" />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-background via-slate-900/60 to-slate-900/90" />

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center space-x-1.5 rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary">
              <Compass className="h-4 w-4 animate-spin-slow" />
              <span>Let's explore the world together</span>
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
              Unveil Your Next Grand{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-teal-400 bg-clip-text text-transparent">
                Destination
              </span>
            </h1>
            <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-300">
              Instant airline tickets, hand-picked luxury suites, and customized itineraries powered by AI.
            </p>
          </div>

          {/* SEARCH CARD */}
          <div className="glass rounded-2xl p-6 shadow-2xl w-full max-w-3xl mx-auto text-left border border-white/10">
            {/* Search Tabs */}
            <div className="flex space-x-4 mb-4 border-b border-border/20 pb-3">
              <button
                onClick={() => setSearchTab('flights')}
                className={`flex items-center space-x-1.5 pb-2 text-sm font-semibold transition-colors duration-200 border-b-2 ${
                  searchTab === 'flights' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Plane className="h-4 w-4" />
                <span>Flights</span>
              </button>
              <button
                onClick={() => setSearchTab('hotels')}
                className={`flex items-center space-x-1.5 pb-2 text-sm font-semibold transition-colors duration-200 border-b-2 ${
                  searchTab === 'hotels' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Building className="h-4 w-4" />
                <span>Hotels</span>
              </button>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {searchTab === 'flights' ? (
                <>
                  <div>
                    <label className="block text-2xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                      From
                    </label>
                    <input
                      type="text"
                      required
                      value={fromCity}
                      onChange={(e) => setFromCity(e.target.value)}
                      placeholder="Departure City"
                      className="w-full rounded-xl border border-input bg-background/50 px-3 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                      To
                    </label>
                    <input
                      type="text"
                      required
                      value={toCity}
                      onChange={(e) => setToCity(e.target.value)}
                      placeholder="Arrival Destination"
                      className="w-full rounded-xl border border-input bg-background/50 px-3 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                      Departure Date
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background/50 px-3 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="sm:col-span-2">
                    <label className="block text-2xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                      Where are you staying?
                    </label>
                    <input
                      type="text"
                      required
                      value={hotelLocation}
                      onChange={(e) => setHotelLocation(e.target.value)}
                      placeholder="City, region, or country (e.g. Paris)"
                      className="w-full rounded-xl border border-input bg-background/50 px-3 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                      Guests
                    </label>
                    <select className="w-full rounded-xl border border-input bg-background/50 px-3 py-2.5 text-sm focus:outline-none">
                      <option>1 Guest</option>
                      <option>2 Guests</option>
                      <option>3 Guests</option>
                      <option>4+ Guests</option>
                    </select>
                  </div>
                </>
              )}

              <div className="sm:col-span-3 mt-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:brightness-110 shadow-lg transition-all"
                >
                  Search Tickets & Rooms
                </button>
              </div>
            </form>
          </div>

        </div>
      </section>

      {/* POPULAR DESTINATIONS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 space-y-2 sm:space-y-0">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Curated Top Destinations</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Hand-picked destinations boasting prime accommodations and sightseeing routes.</p>
          </div>
          <span className="text-xs font-semibold text-primary flex items-center space-x-1 hover:underline cursor-pointer">
            <span>Explore all spots</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DESTINATIONS.map((dest, i) => (
            <div
              key={i}
              onClick={() => router.push(`/hotels?location=${dest.name}`)}
              className="group relative rounded-2xl overflow-hidden shadow-md border border-border/40 cursor-pointer hover:scale-103 transition-all duration-300"
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="h-64 w-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              
              {/* Overlay content */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div>
                  <span className="rounded bg-secondary/80 px-2 py-0.5 text-3xs font-semibold text-secondary-foreground uppercase tracking-wide">
                    {dest.tag}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1.5">{dest.name}</h3>
                  <p className="text-2xs text-slate-300">{dest.country}</p>
                </div>
                <div className="flex items-center space-x-1 text-xs font-semibold text-amber-400 bg-black/40 px-2 py-1 rounded-lg">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <span>{dest.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOLIDAY PACKAGES */}
      <section className="bg-muted/40 py-16 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Luxury Holiday Packages</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">All-inclusive stays, VIP museum access, and premium flights combined at one cost.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PACKAGES.map((pkg, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg flex flex-col sm:flex-row hover:border-primary/40 transition-colors"
              >
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="h-48 sm:h-auto sm:w-48 object-cover"
                />
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-3xs font-bold uppercase tracking-wider text-primary">
                      {pkg.duration}
                    </span>
                    <h3 className="text-lg font-bold text-foreground leading-snug">{pkg.title}</h3>
                    <p className="text-2xs text-muted-foreground">{pkg.highlights}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-3xs text-muted-foreground block uppercase">Price Starts At</span>
                      <span className="text-lg font-bold text-foreground">${pkg.price}</span>
                    </div>
                    <button
                      onClick={() => handleBookPackage(pkg)}
                      className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:brightness-110 shadow"
                    >
                      Book Package
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRAVEL INSURANCE & VISA ASSISTANCE */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
            <div className="inline-block rounded-xl bg-primary/10 p-3 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Comprehensive Insurance</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Travel stress-free with customizable medical coverage, baggage protection, and flight disruption reimbursement options up to $50,000.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
            <div className="inline-block rounded-xl bg-secondary/10 p-3 text-secondary">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Global Visa Assistance</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Instant access to visa checklists, embassy appointment guides, and simplified application portals for 80+ countries.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
            <div className="inline-block rounded-xl bg-teal-500/10 p-3 text-teal-500">
              <Landmark className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Exchange Rate Tracker</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Verify local live currency rates instantly with our live conversions. Powered by exchange API feeds.
            </p>
          </div>

        </div>
      </section>

      {/* FLOATING AI ASSISTANT & MODALS */}
      <AIAssistant />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} onSuccess={() => {}} />

    </div>
  );
}
