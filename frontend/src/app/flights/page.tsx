'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Plane, Calendar, ArrowRightLeft, ShieldAlert, ArrowRight, SlidersHorizontal, Check } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import CheckoutModal from '@/components/CheckoutModal';

interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  departureCity: string;
  arrivalCity: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  class: string;
  availableSeats: number;
  stops: number;
}

function FlightsContent() {
  const searchParams = useSearchParams();
  const { apiUrl, token, setActiveBooking } = useApp();

  // Search parameters
  const [fromCity, setFromCity] = useState(searchParams.get('from') || 'New York');
  const [toCity, setToCity] = useState(searchParams.get('to') || 'Paris');
  const [date, setDate] = useState(searchParams.get('date') || '2026-07-15');
  const [seatClass, setSeatClass] = useState('Economy');

  // Flight search result state
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [stopsFilter, setStopsFilter] = useState<number | null>(null); // null = all, 0 = direct, 1 = 1 stop
  const [selectedAirline, setSelectedAirline] = useState<string | null>(null);

  // Modal controls
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const fetchFlights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${apiUrl}/api/flights/search?from=${encodeURIComponent(fromCity)}&to=${encodeURIComponent(toCity)}&date=${encodeURIComponent(date)}&class=${seatClass}`
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch flights');
      }
      setFlights(data);
      // Auto-set max price filter limit
      if (data.length > 0) {
        const prices = data.map((f: Flight) => f.price);
        setMaxPrice(Math.max(...prices));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFlights();
  };

  const handleSelectFlight = (flight: Flight) => {
    if (!token) {
      setIsAuthOpen(true);
      return;
    }
    setActiveBooking({
      type: 'FLIGHT',
      details: flight,
      totalPrice: flight.price,
    });
    setIsCheckoutOpen(true);
  };

  // Filtered flights selector
  const filteredFlights = flights.filter((f) => {
    if (f.price > maxPrice) return false;
    if (stopsFilter !== null && f.stops !== stopsFilter) return false;
    if (selectedAirline && f.airline !== selectedAirline) return false;
    return true;
  });

  const airlines = Array.from(new Set(flights.map((f) => f.airline)));

  // Format dates/times helper
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateLabel = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Top Search Bar */}
      <form onSubmit={handleSearchSubmit} className="glass rounded-2xl p-5 border border-border/40 shadow flex flex-col md:flex-row items-end gap-4">
        <div className="w-full md:flex-1">
          <label className="block text-2xs font-medium uppercase tracking-wider text-muted-foreground mb-1">From</label>
          <input
            type="text"
            value={fromCity}
            onChange={(e) => setFromCity(e.target.value)}
            className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none"
          />
        </div>
        <div className="w-full md:flex-1">
          <label className="block text-2xs font-medium uppercase tracking-wider text-muted-foreground mb-1">To</label>
          <input
            type="text"
            value={toCity}
            onChange={(e) => setToCity(e.target.value)}
            className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none"
          />
        </div>
        <div className="w-full md:w-48">
          <label className="block text-2xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none"
          />
        </div>
        <div className="w-full md:w-40">
          <label className="block text-2xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Class</label>
          <select
            value={seatClass}
            onChange={(e) => setSeatClass(e.target.value)}
            className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none"
          >
            <option value="Economy">Economy</option>
            <option value="Business">Business</option>
            <option value="First">First</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full md:w-auto rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 transition-all shadow"
        >
          Search
        </button>
      </form>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Filters Pane */}
        <div className="glass rounded-2xl p-5 border border-border/40 space-y-6">
          <div className="flex items-center justify-between border-b border-border/20 pb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center space-x-1.5">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <span>Filters</span>
            </h3>
            <button
              onClick={() => {
                setStopsFilter(null);
                setSelectedAirline(null);
                if (flights.length > 0) {
                  setMaxPrice(Math.max(...flights.map(f => f.price)));
                }
              }}
              className="text-3xs font-semibold text-primary hover:underline"
            >
              Reset All
            </button>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Max Price</span>
              <span className="font-semibold text-foreground">${maxPrice}</span>
            </div>
            <input
              type="range"
              min="0"
              max="5000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary bg-muted rounded-lg h-1"
            />
          </div>

          {/* Stops Filter */}
          <div className="space-y-2">
            <span className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider block">Stops</span>
            <div className="flex flex-col space-y-1">
              {[
                { label: 'All Flights', value: null },
                { label: 'Non-stop', value: 0 },
                { label: '1 Stop', value: 1 },
              ].map((stop, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setStopsFilter(stop.value)}
                  className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left ${
                    stopsFilter === stop.value ? 'bg-primary/10 font-semibold text-primary' : 'hover:bg-accent text-muted-foreground'
                  }`}
                >
                  <span>{stop.label}</span>
                  {stopsFilter === stop.value && <Check className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Airlines Filter */}
          {airlines.length > 0 && (
            <div className="space-y-2">
              <span className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider block">Airlines</span>
              <div className="flex flex-col space-y-1">
                {airlines.map((airline, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedAirline(selectedAirline === airline ? null : airline)}
                    className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left ${
                      selectedAirline === airline ? 'bg-secondary/15 font-semibold text-secondary' : 'hover:bg-accent text-muted-foreground'
                    }`}
                  >
                    <span>{airline}</span>
                    {selectedAirline === airline && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Flight Cards Area */}
        <div className="lg:col-span-3 space-y-4">
          
          {loading ? (
            /* Loading Skeleton */
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 w-full bg-muted/60 animate-pulse rounded-2xl border border-border/30" />
            ))
          ) : error ? (
            <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-6 text-center space-y-2">
              <ShieldAlert className="h-8 w-8 text-destructive mx-auto" />
              <h4 className="font-bold text-foreground">Flight search error</h4>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
          ) : filteredFlights.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center bg-card">
              <Plane className="h-10 w-10 text-muted-foreground mx-auto mb-2 animate-bounce" />
              <h4 className="font-bold text-foreground">No flights found</h4>
              <p className="text-xs text-muted-foreground">Try relaxing your search dates or price filters.</p>
            </div>
          ) : (
            filteredFlights.map((flight) => (
              <div
                key={flight.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-primary/40 transition-colors"
              >
                {/* Airline & Number */}
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                    <Plane className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{flight.airline}</h4>
                    <span className="text-3xs font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {flight.flightNumber}
                    </span>
                  </div>
                </div>

                {/* Route Times */}
                <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-8 w-full sm:w-auto">
                  <div className="text-center sm:text-right">
                    <span className="text-lg font-bold text-foreground block">{formatTime(flight.departureTime)}</span>
                    <span className="text-3xs font-semibold text-muted-foreground uppercase">{flight.departureCity}</span>
                  </div>
                  <div className="flex flex-col items-center min-w-16 sm:min-w-24">
                    <span className="text-3xs font-semibold text-muted-foreground">{flight.stops === 0 ? 'Direct' : `${flight.stops} Stop`}</span>
                    <div className="relative w-full flex items-center justify-center my-1">
                      <span className="h-px bg-border w-full" />
                      <ArrowRight className="h-3 w-3 text-muted-foreground absolute" />
                    </div>
                    <span className="text-3xs font-semibold text-primary">{flight.class}</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <span className="text-lg font-bold text-foreground block">{formatTime(flight.arrivalTime)}</span>
                    <span className="text-3xs font-semibold text-muted-foreground uppercase">{flight.arrivalCity}</span>
                  </div>
                </div>

                {/* Action Price */}
                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-border/40 w-full sm:w-auto pt-4 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-3xs text-muted-foreground block">{flight.availableSeats} seats left</span>
                    <span className="text-xl font-extrabold text-foreground">${flight.price}</span>
                  </div>
                  <button
                    onClick={() => handleSelectFlight(flight)}
                    className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:brightness-110 shadow transition-all"
                  >
                    Select Ticket
                  </button>
                </div>
              </div>
            ))
          )}

        </div>

      </div>

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} onSuccess={() => {}} />

    </div>
  );
}

export default function FlightsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted-foreground font-semibold">Loading flight search...</div>}>
      <FlightsContent />
    </Suspense>
  );
}
