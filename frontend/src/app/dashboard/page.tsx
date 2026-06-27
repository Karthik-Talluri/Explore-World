'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Compass, ShieldAlert, Calendar, Ticket, Compass as CompassIcon, Sparkles, Heart, PlaneTakeoff, Info } from 'lucide-react';
import AuthModal from '@/components/AuthModal';

interface Booking {
  id: string;
  type: 'FLIGHT' | 'HOTEL' | 'PACKAGE';
  details: any;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  paymentStatus: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { apiUrl, token, user } = useApp();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const fetchBookings = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/api/bookings/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch bookings');
      setBookings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [token]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await fetch(`${apiUrl}/api/bookings/cancel/${bookingId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to cancel booking');

      // Update state in place
      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
      );
      alert('Booking cancelled successfully. Refund processed.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-md w-full px-4 py-32 text-center space-y-6">
        <div className="rounded-2xl border border-dashed border-border/80 p-8 bg-card shadow-sm space-y-4">
          <ShieldAlert className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <h2 className="text-xl font-bold text-foreground">Authentication Required</h2>
          <p className="text-xs text-muted-foreground">
            Please sign in to view your bookings history, wishlist, and active travel itineraries.
          </p>
          <button
            onClick={() => setIsAuthOpen(true)}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 shadow-md transition-all"
          >
            Sign In Now
          </button>
        </div>
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    );
  }

  // Find nearest confirmed flight booking for live tracker
  const activeFlightBooking = bookings.find(
    (b) => b.type === 'FLIGHT' && b.status === 'CONFIRMED'
  );

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      
      {/* Welcome Header banner */}
      <div className="rounded-3xl bg-slate-900 border border-white/5 relative p-6 sm:p-8 overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 space-y-1">
          <span className="text-xs font-bold text-primary uppercase tracking-widest block">Dashboard</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Welcome back, {user?.name}!</h1>
          <p className="text-xs text-slate-400">{user?.email} • Premium Explorer Account</p>
        </div>
        <div className="relative z-10 flex items-center space-x-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300">
          <Compass className="h-4 w-4 text-secondary animate-spin-slow" />
          <span>Active Explorer Status</span>
        </div>
      </div>

      {/* Live Booking Status Tracker */}
      {activeFlightBooking && (
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-border/20 pb-3">
            <PlaneTakeoff className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Live Booking Flight Status</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-3xs text-muted-foreground uppercase block font-bold">Flight</span>
              <span className="font-semibold text-foreground">
                {activeFlightBooking.details.airline} ({activeFlightBooking.details.flightNumber})
              </span>
            </div>
            <div>
              <span className="text-3xs text-muted-foreground uppercase block font-bold">Route</span>
              <span className="font-semibold text-foreground">
                {activeFlightBooking.details.departureCity} ➔ {activeFlightBooking.details.arrivalCity}
              </span>
            </div>
            <div>
              <span className="text-3xs text-muted-foreground uppercase block font-bold">Ref</span>
              <span className="font-semibold text-foreground font-mono">{activeFlightBooking.id.substring(0, 8)}</span>
            </div>
          </div>

          {/* Live Progress Bar Tracker */}
          <div className="relative pt-6">
            <div className="absolute inset-x-0 top-7 h-1 bg-muted rounded" />
            <div className="absolute left-0 top-7 h-1 bg-primary rounded w-1/2" />
            
            <div className="relative flex justify-between">
              {[
                { label: 'Booking Paid', active: true },
                { label: 'Ticket Issued', active: true },
                { label: 'Departed', active: false },
                { label: 'Arrived', active: false },
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center space-y-1">
                  <div
                    className={`h-3 w-3 rounded-full border-2 ${
                      step.active
                        ? 'border-primary bg-primary'
                        : 'border-muted bg-card'
                    }`}
                  />
                  <span className="text-4xs font-bold text-muted-foreground uppercase tracking-wide">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Bookings History List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center space-x-1.5">
            <Ticket className="h-5 w-5 text-primary" />
            <span>My Bookings History</span>
          </h2>

          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-28 w-full bg-muted/60 animate-pulse rounded-2xl border border-border/30" />
            ))
          ) : error ? (
            <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-5 text-xs text-destructive text-center">
              Failed to load bookings: {error}
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center bg-card">
              <CompassIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <h4 className="font-bold text-foreground">No bookings found</h4>
              <p className="text-xs text-muted-foreground">You haven't purchased any tickets or hotels yet.</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between gap-4 hover:border-primary/20 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-border/20 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider bg-primary/10 text-primary px-2.5 py-0.5 rounded">
                      {booking.type}
                    </span>
                    <span className="text-3xs font-mono text-muted-foreground">ID: {booking.id}</span>
                  </div>
                  <span
                    className={`rounded px-2.5 py-0.5 text-3xs font-semibold uppercase ${
                      booking.status === 'CONFIRMED'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : booking.status === 'CANCELLED'
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-amber-500/10 text-amber-500'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                {/* Details Render based on Type */}
                <div className="text-xs space-y-2">
                  {booking.type === 'FLIGHT' && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground">
                          Flight {booking.details.flightNumber} ({booking.details.airline})
                        </p>
                        <p className="text-muted-foreground">
                          Route: {booking.details.departureCity} ➔ {booking.details.arrivalCity}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-muted-foreground">Class: {booking.details.class}</p>
                      </div>
                    </div>
                  )}

                  {booking.type === 'HOTEL' && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground">{booking.details.name}</p>
                        <p className="text-muted-foreground">Location: {booking.details.location}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-muted-foreground">Amenities: Wifi, Pool</p>
                      </div>
                    </div>
                  )}

                  {booking.type === 'PACKAGE' && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground">{booking.details.title}</p>
                        <p className="text-muted-foreground">Highlights: {booking.details.highlights}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-muted-foreground">{booking.details.duration}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Price & Cancellation Actions */}
                <div className="border-t border-border/20 pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-4xs text-muted-foreground uppercase block font-bold">Booking Date</span>
                    <span className="text-2xs text-muted-foreground">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-extrabold text-foreground">${booking.totalPrice}</span>
                    {booking.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="rounded-lg border border-destructive/20 hover:bg-destructive/10 px-3 py-1.5 text-2xs font-semibold text-destructive transition-all"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Wishlist Sidebar */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center space-x-1.5">
            <Heart className="h-5 w-5 text-rose-500 fill-rose-500/20" />
            <span>My Travel Wishlist</span>
          </h2>
          
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
            {[
              {
                name: 'Grand Royal Palace',
                location: 'Paris, France',
                price: '$280/night',
                image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200',
              },
              {
                name: 'Serenity Boutique Resort',
                location: 'Tokyo, Japan',
                price: '$190/night',
                image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=200',
              },
            ].map((wish, idx) => (
              <div key={idx} className="flex items-center space-x-3 pb-3 border-b border-border/20 last:pb-0 last:border-b-0">
                <img
                  src={wish.image}
                  alt={wish.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-foreground block truncate">{wish.name}</span>
                  <span className="text-3xs text-muted-foreground block">{wish.location}</span>
                </div>
                <div className="text-right">
                  <span className="text-2xs font-semibold text-foreground block">{wish.price}</span>
                  <span className="text-3xs text-primary font-semibold hover:underline cursor-pointer">
                    Book
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Guide/Info Panel */}
          <div className="rounded-2xl bg-primary/5 border border-primary/20 p-5 space-y-2">
            <h4 className="text-xs font-bold text-primary flex items-center space-x-1">
              <Info className="h-4 w-4" />
              <span>Travel Protection Policy</span>
            </h4>
            <p className="text-2xs text-muted-foreground leading-relaxed">
              Standard cancellations are fully refundable within 24 hours of checkout. Cancellations afterwards may incur a 10% processing fee.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
