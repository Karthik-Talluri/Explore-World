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
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      
      {/* Top Title Banner */}
      <div className="text-center sm:text-left space-y-1">
        <h1 className="text-3xl font-extrabold text-foreground">Escorted Holiday Tour Packages</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Browse luxury itineraries in over 26 Indian states and 32 global international locations.
        </p>
      </div>

      {/* Global Search Input */}
      <form onSubmit={handleSearchSubmit} className="glass rounded-2xl p-4 border border-border/40 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
            <Search className="h-5 w-5 text-secondary" />
          </span>
          <input
            type="text"
            placeholder="Search by state, country, or destination..."
            value={destQuery}
            onChange={(e) => setDestQuery(e.target.value)}
            className="w-full rounded-xl border border-input bg-background/50 pl-10 pr-3 py-2 text-sm text-foreground focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto rounded-xl bg-secondary px-6 py-2.5 text-xs font-bold text-slate-950 shadow hover:brightness-110 transition-all"
        >
          Query Catalog
        </button>
      </form>

      {/* Grid structure */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Filters Sidebar */}
        <div className="glass rounded-2xl p-5 border border-border/40 space-y-6">
          <div className="flex items-center justify-between border-b border-border/20 pb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center space-x-1.5">
              <SlidersHorizontal className="h-4 w-4 text-secondary" />
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
              className="text-3xs font-semibold text-secondary hover:underline"
            >
              Reset All
            </button>
          </div>

          {/* Region Tabs (Category) */}
          <div className="space-y-2">
            <span className="text-2xs font-bold text-muted-foreground uppercase tracking-wider block">Region Portfolio</span>
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
                  className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left ${
                    categoryFilter === cat.value ? 'bg-secondary/15 font-bold text-secondary' : 'hover:bg-accent text-muted-foreground'
                  }`}
                >
                  <span>{cat.label}</span>
                  {categoryFilter === cat.value && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Max Price</span>
              <span className="font-semibold text-foreground">₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="10000"
              max="300000"
              step="5000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-secondary bg-muted rounded-lg h-1"
            />
          </div>

          {/* Duration Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Max Duration</span>
              <span className="font-semibold text-foreground">{maxDuration} Days</span>
            </div>
            <input
              type="range"
              min="2"
              max="15"
              step="1"
              value={maxDuration}
              onChange={(e) => setMaxDuration(Number(e.target.value))}
              className="w-full accent-secondary bg-muted rounded-lg h-1"
            />
          </div>

          {/* Tour Tag type filters */}
          <div className="space-y-2">
            <span className="text-2xs font-bold text-muted-foreground uppercase tracking-wider block">Tour Style Type</span>
            <div className="flex flex-wrap gap-1.5">
              {['Adventure', 'Family', 'Honeymoon', 'Solo', 'Group', 'Luxury', 'Budget'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTypeFilter(typeFilter === tag ? null : tag)}
                  className={`rounded-lg px-3 py-1.5 text-2xs font-semibold border transition-all ${
                    typeFilter === tag 
                      ? 'bg-secondary text-slate-950 border-secondary' 
                      : 'border-border bg-background/50 hover:bg-accent text-muted-foreground'
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
                <div key={i} className="h-80 w-full bg-muted/60 animate-pulse rounded-2xl border border-border/30" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-8 text-center text-destructive space-y-2">
              <h4 className="font-bold text-foreground">Inquiries search error</h4>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 p-16 text-center bg-card">
              <Palmtree className="h-10 w-10 text-muted-foreground mx-auto mb-2 animate-bounce" />
              <h4 className="font-bold text-foreground">No tour packages found</h4>
              <p className="text-xs text-muted-foreground">Try relaxing your price sliders, tag clicks, or search spellings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPackages.map((pkg) => {
                const cardImg = pkg.images[0] || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600';
                return (
                  <div
                    key={pkg.id}
                    className="group rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:border-secondary/35 flex flex-col justify-between transition-colors"
                  >
                    {/* Thumbnail Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={cardImg}
                        alt={pkg.name}
                        className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 rounded-lg bg-black/60 px-2 py-0.5 text-2xs font-bold text-secondary flex items-center space-x-0.5">
                        <Star className="h-3.5 w-3.5 fill-secondary" />
                        <span>{pkg.rating.toFixed(1)}</span>
                      </div>
                      <div className="absolute bottom-3 left-3 flex items-center space-x-1 bg-slate-950/70 border border-white/10 px-2 py-0.5 rounded text-3xs font-bold text-white uppercase tracking-wider">
                        <span>{pkg.category}</span>
                      </div>
                    </div>

                    {/* Content body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-4xs font-bold text-secondary uppercase tracking-widest">
                          <span>{pkg.durationDays} Days / {pkg.durationDays - 1} Nights</span>
                          <span>{pkg.type}</span>
                        </div>
                        <h3 className="text-base font-bold text-foreground leading-snug group-hover:text-secondary transition-colors">
                          {pkg.name}
                        </h3>
                        <p className="text-3xs text-muted-foreground line-clamp-2 leading-relaxed">
                          <strong>Attractions:</strong> {pkg.attractions}
                        </p>
                      </div>

                      {/* Pricing Footer */}
                      <div className="border-t border-border/20 pt-4 flex items-center justify-between">
                        <div>
                          <span className="text-4xs text-muted-foreground block uppercase font-bold">Starts At</span>
                          <span className="text-base font-extrabold text-foreground">₹{(pkg.price * 85).toLocaleString('en-IN')} <span className="text-4xs text-muted-foreground font-normal">/ person</span></span>
                        </div>
                        <Link
                          href={`/packages/${pkg.id}`}
                          className="rounded-lg bg-primary/10 hover:bg-primary/20 px-4 py-2 text-2xs font-bold text-primary dark:text-secondary transition-all"
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
    <Suspense fallback={<div className="text-center py-20 text-muted-foreground font-semibold">Loading tour packages...</div>}>
      <PackagesCatalogContent />
    </Suspense>
  );
}
