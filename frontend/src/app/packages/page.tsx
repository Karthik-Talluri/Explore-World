'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Palmtree, SlidersHorizontal, Check, Search, Calendar, Star, Compass } from 'lucide-react';
import Link from 'next/link';

interface TourPackage {
  id: string;
  name: string;
  category: string;
  destination: string;
  price: number;
  durationDays: number;
  bestSeason: string;
  attractions: string;
  hotelDetails: string;
  mealPlan: string;
  transportation: string;
  rating: number;
  availableDates: string[];
  images: string[];
  type: string;
}

function PackagesCatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { apiUrl } = useApp();

  // Search/Filter states
  const [destQuery, setDestQuery] = useState(searchParams.get('destination') || '');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(searchParams.get('category') || null);
  const [typeFilter, setTypeFilter] = useState<string | null>(searchParams.get('type') || null);

  const [maxPrice, setMaxPrice] = useState<number>(250000);
  const [maxDuration, setMaxDuration] = useState<number>(10);

  // Data states
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      let queryUrl = `${apiUrl}/api/packages/search?`;
      if (destQuery) queryUrl += `destination=${encodeURIComponent(destQuery)}&`;
      if (categoryFilter) queryUrl += `category=${encodeURIComponent(categoryFilter)}&`;
      if (typeFilter) queryUrl += `type=${encodeURIComponent(typeFilter)}&`;
      
      const res = await fetch(queryUrl);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch packages');

      setPackages(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [searchParams, categoryFilter, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPackages();
  };

  // Filter listings client-side for immediate responsive sliders updates
  const filteredPackages = packages.filter((p) => {
    if ((p.price * 85) > maxPrice) return false;
    if (p.durationDays > maxDuration) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 space-y-8 animate-fade-in text-slate-900 font-sans">
      
      {/* Top Title Banner */}
      <div className="text-center sm:text-left space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight font-sans">
          Escorted Holiday Tour Portfolios
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-semibold">
          Browse handpicked luxury itineraries in over 26 Indian states and 32 global international locations.
        </p>
      </div>

      {/* Global Search Input (Airbnb style) */}
      <form onSubmit={handleSearchSubmit} className="bg-white rounded-[18px] p-3 border border-slate-200 shadow-md flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            <Search className="h-5 w-5 text-amber-500" />
          </span>
          <input
            type="text"
            placeholder="Search by state, country, or destination..."
            value={destQuery}
            onChange={(e) => setDestQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-100 bg-slate-50 pl-11 pr-4 py-3 text-xs text-slate-800 focus:outline-none focus:border-amber-500/50 transition-all font-semibold"
          />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto rounded-xl bg-slate-950 hover:bg-slate-900 px-7 py-3.5 text-xs font-bold text-white shadow-sm transition-all"
        >
          Search Packages
        </button>
      </form>

      {/* Grid structure */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Filters Sidebar (MakeMyTrip Style) */}
        <div className="bg-white rounded-[18px] p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5 font-sans">
              <SlidersHorizontal className="h-4 w-4 text-amber-500" />
              <span>Filters</span>
            </h3>
            <button
              onClick={() => {
                setCategoryFilter(null);
                setTypeFilter(null);
                setDestQuery('');
                setMaxPrice(250000);
                setMaxDuration(10);
                router.push('/packages');
              }}
              className="text-[10px] font-bold text-amber-500 hover:underline"
            >
              Reset All
            </button>
          </div>

          {/* Region Tabs (Category) */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Region Portfolio</span>
            <div className="flex flex-col space-y-1">
              {[
                { label: 'All Packages', value: null },
                { label: '🇮🇳 National Tours', value: 'national' },
                { label: '🌍 International Tours', value: 'international' },
              ].map((cat, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCategoryFilter(cat.value)}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-left transition-all ${
                    categoryFilter === cat.value ? 'bg-amber-500/10 text-amber-600 font-bold' : 'hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  <span>{cat.label}</span>
                  {categoryFilter === cat.value && <Check className="h-3.5 w-3.5 text-amber-500" />}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Slider */}
          <div className="space-y-2.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500">Max Budget</span>
              <span className="text-slate-900">₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="10000"
              max="300000"
              step="5000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-100 rounded-lg h-1.5 cursor-pointer"
            />
          </div>

          {/* Duration Slider */}
          <div className="space-y-2.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500">Max Duration</span>
              <span className="text-slate-900">{maxDuration} Days</span>
            </div>
            <input
              type="range"
              min="2"
              max="15"
              step="1"
              value={maxDuration}
              onChange={(e) => setMaxDuration(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-100 rounded-lg h-1.5 cursor-pointer"
            />
          </div>

          {/* Tour Tag type filters */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tour Style Type</span>
            <div className="flex flex-wrap gap-1.5">
              {['Adventure', 'Family', 'Honeymoon', 'Solo', 'Group', 'Luxury', 'Budget'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTypeFilter(typeFilter === tag ? null : tag)}
                  className={`rounded-xl px-3 py-1.5 text-[10px] font-bold border transition-all ${
                    typeFilter === tag 
                      ? 'bg-amber-500 text-slate-950 border-amber-500' 
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Listings Cards Area */}
        <div className="lg:col-span-3">
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-80 w-full bg-slate-200 animate-pulse rounded-[18px] border border-slate-100" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-[18px] bg-rose-50 border border-rose-100 p-8 text-center text-rose-600 space-y-2">
              <h4 className="font-bold text-slate-900 font-sans">Inquiries search error</h4>
              <p className="text-xs font-medium text-rose-500">{error}</p>
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="rounded-[18px] border border-dashed border-slate-300 p-16 text-center bg-white shadow-sm">
              <Palmtree className="h-10 w-10 text-slate-400 mx-auto mb-3 animate-bounce" />
              <h4 className="font-bold text-slate-950 font-sans">No tour packages found</h4>
              <p className="text-xs text-slate-500 font-semibold">Try relaxing your price sliders, tag clicks, or search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPackages.map((pkg) => {
                const cardImg = pkg.images[0] || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600';
                return (
                  <div
                    key={pkg.id}
                    className="group rounded-[18px] border border-slate-200/80 bg-white overflow-hidden shadow-sm hover:shadow-lg hover:border-amber-500/25 flex flex-col justify-between transition-all duration-300"
                  >
                    {/* Thumbnail Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={cardImg}
                        alt={pkg.name}
                        className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 rounded-lg bg-black/60 px-2 py-0.5 text-[10px] font-bold text-amber-400 flex items-center space-x-0.5">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{pkg.rating.toFixed(1)}</span>
                      </div>
                      <div className="absolute bottom-3 left-3 flex items-center space-x-1 bg-slate-950/70 border border-white/10 px-2 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-wider">
                        <span>{pkg.category}</span>
                      </div>
                    </div>

                    {/* Content body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[9px] font-bold text-amber-500 uppercase tracking-widest">
                          <span>{pkg.durationDays} Days / {pkg.durationDays - 1} Nights</span>
                          <span>{pkg.type}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-amber-500 transition-colors font-sans">
                          {pkg.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-semibold">
                          <strong>Attractions:</strong> {pkg.attractions}
                        </p>
                      </div>

                      {/* Pricing Footer */}
                      <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Starts At</span>
                          <span className="text-base font-extrabold text-slate-900">₹{(pkg.price * 85).toLocaleString('en-IN')} <span className="text-[10px] text-slate-400 font-normal">/ person</span></span>
                        </div>
                        <Link
                          href={`/packages/${pkg.id}`}
                          className="rounded-xl bg-slate-950 hover:bg-slate-900 px-4.5 py-2 text-xs font-bold text-white transition-all shadow-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default function PackagesCatalogPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-500 font-semibold">Loading tour packages...</div>}>
      <PackagesCatalogContent />
    </Suspense>
  );
}
