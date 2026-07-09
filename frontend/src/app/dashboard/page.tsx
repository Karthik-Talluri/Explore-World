'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Compass, ShieldAlert, Ticket, Calendar, Heart, Info, ArrowDownToLine, Receipt, FileText, Home, Palmtree, MessageSquare, Send, Phone, User } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Booking {
  id: string;
  travelDate: string;
  travelersCount: number;
  roomType: string;
  specialRequests: string;
  pickupLocation: string;
  contactNumber: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  invoiceId: string;
  createdAt: string;
  package: { name: string; destination: string; price: number };
  guideAssignment?: {
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'STARTED' | 'COMPLETED' | 'CANCELLED';
    rating?: number | null;
    feedback?: string | null;
    guide: {
      phone?: string;
      averageRating?: number;
      user: {
        name: string;
        email: string;
      };
    };
  } | null;
}

export default function DashboardPage() {
  const { apiUrl, token, user } = useApp();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Invoice display state
  const [selectedInvoice, setSelectedInvoice] = useState<Booking | null>(null);

  // Rating state
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [guideRating, setGuideRating] = useState<number>(5);
  const [guideFeedback, setGuideFeedback] = useState<string>('');
  const [ratingLoading, setRatingLoading] = useState<boolean>(false);

  // Chat state
  const [activeChat, setActiveChat] = useState<Booking | null>(null);
  const [chatMessages, setChatMessages] = useState<{[key: string]: { sender: 'guide' | 'customer', text: string, time: string }[]}>({});
  const [newMessage, setNewMessage] = useState('');
  const steps = [
    { label: 'Booking Confirmed', desc: 'Your reservation is safe' },
    { label: 'Guide Assigned', desc: 'Matching local guide' },
    { label: 'Guide Accepted', desc: 'Guide accepted your trip' },
    { label: 'Tour Started', desc: 'Tour is currently ongoing' },
    { label: 'Tour Completed', desc: 'Hope you enjoyed!' }
  ];

  const getStepIndex = (b: Booking) => {
    if (b.status === 'CANCELLED') return -1;
    if (b.status === 'Tour Completed') return 5;
    if (b.status === 'Tour Started') return 4;
    if (b.status === 'Guide Accepted') return 3;
    if (b.status === 'Waiting for Guide Acceptance') return 2;
    if (b.guideAssignment) {
      if (b.guideAssignment.status === 'COMPLETED') return 5;
      if (b.guideAssignment.status === 'STARTED') return 4;
      if (b.guideAssignment.status === 'ACCEPTED') return 3;
      if (b.guideAssignment.status === 'PENDING') return 2;
    }
    return 1;
  };

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
    if (token && user) {
      if (user.role === 'GUIDE' || user.role === 'TOUR_GUIDE') {
        router.push('/guide');
      } else if (user.role === 'ADMIN') {
        router.push('/admin');
      }
    }
  }, [token, user]);

  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [token]);

  const getInitialMessages = (b: Booking) => [
    { sender: 'customer' as const, text: `Hello! Can we confirm the pickup location?`, time: '9:02 AM' },
    { sender: 'guide' as const, text: `Hi ${user?.name || 'Traveller'}! I will meet you at the ${b.pickupLocation || 'scheduled location'}.`, time: '9:05 AM' },
    { sender: 'customer' as const, text: `Perfect! My contact number is ${b.contactNumber || 'on file'} in case you need to call.`, time: '9:08 AM' },
  ];

  const handleOpenChat = (b: Booking) => {
    setActiveChat(b);
    if (!chatMessages[b.id]) {
      setChatMessages(prev => ({
        ...prev,
        [b.id]: getInitialMessages(b)
      }));
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const userMsg = {
      sender: 'customer' as const,
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), userMsg]
    }));
    setNewMessage('');

    // Trigger mock automatic reply from guide
    setTimeout(() => {
      const reply = {
        sender: 'guide' as const,
        text: `Hi! Understood. I will keep you updated. See you soon!`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => ({
        ...prev,
        [activeChat.id]: [...(prev[activeChat.id] || []), reply]
      }));
    }, 1500);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this tour booking reservation? Refund operations take 2-3 business days.')) return;
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
      alert('Booking cancelled successfully.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRateGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingBooking) return;
    setRatingLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/bookings/${ratingBooking.id}/rate-guide`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: guideRating,
          feedback: guideFeedback,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit rating');

      alert('Thank you for rating your tour guide!');
      setRatingBooking(null);
      setGuideRating(5);
      setGuideFeedback('');
      fetchBookings();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRatingLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in flex flex-col justify-between min-h-[75vh]">
      
      {!token ? (
        /* LOGGED OUT / AUTHENTICATION REQUIRED VIEW */
        <div className="mx-auto max-w-md w-full py-16 text-center space-y-6 flex-grow flex flex-col justify-center">
          <div className="rounded-2xl border border-dashed border-secondary/30 p-8 bg-card shadow-sm space-y-4">
            <ShieldAlert className="h-12 w-12 text-secondary mx-auto animate-pulse" />
            <h2 className="text-xl font-bold text-foreground">Authentication Required</h2>
            <p className="text-xs text-muted-foreground">
              Please sign in to view your bookings history, wishlist, and active tour itineraries.
            </p>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="w-full rounded-xl bg-gradient-to-r from-secondary to-amber-600 py-2.5 text-sm font-bold text-slate-950 shadow transition-all"
            >
              Sign In Now
            </button>
          </div>
        </div>
      ) : (
        /* LOGGED IN VIEW */
        <>
          {/* Welcome Header */}
          <div className="rounded-3xl bg-slate-950 border border-secondary/20 relative p-6 sm:p-8 overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
            <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800')] bg-cover bg-center opacity-10" />
            <div className="relative z-10 space-y-1">
              <span className="text-xs font-bold text-secondary uppercase tracking-widest block">Dashboard</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Welcome back, {user?.name}!</h1>
              <p className="text-xs text-slate-400">{user?.email} • Premium Tour Member</p>
            </div>
            <div className="relative z-10 flex items-center space-x-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-xs font-semibold text-secondary">
              <Compass className="h-4 w-4 animate-spin-slow" />
              <span>Active Escorted Travel Status</span>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Bookings History */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center space-x-1.5">
                <Ticket className="h-5 w-5 text-secondary" />
                <span>My Bookings & Invoices</span>
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
                  <Compass className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <h4 className="font-bold text-foreground">No bookings found</h4>
                  <p className="text-xs text-muted-foreground">You haven't reserved any holiday packages yet.</p>
                </div>
              ) : (
                bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between gap-4 hover:border-secondary/20 transition-colors"
                  >
                    <div className="flex items-center justify-between border-b border-border/20 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-3xs font-bold text-slate-950 bg-secondary px-2.5 py-0.5 rounded">
                          {booking.package.destination.toUpperCase()}
                        </span>
                        <span className="text-3xs font-mono text-muted-foreground">Invoice: {booking.invoiceId}</span>
                      </div>
                      <span
                        className={`rounded px-2.5 py-0.5 text-3xs font-semibold uppercase ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-destructive/10 text-destructive'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 text-muted-foreground">
                      <div>
                        <p className="font-bold text-foreground text-sm">{booking.package.name}</p>
                        <p className="flex items-center space-x-1 mt-1">
                          <Calendar className="h-3.5 w-3.5 text-secondary" />
                          <span>Date: {new Date(booking.travelDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p>Travelers: <strong>{booking.travelersCount} Adults</strong></p>
                        <p>Lodging: <strong>{booking.roomType} Room</strong></p>
                      </div>
                    </div>

                     {/* Progress Timeline */}
                    {booking.status !== 'CANCELLED' && (
                      <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/40">
                        <span className="text-4xs font-bold uppercase tracking-widest text-secondary block mb-3">
                          Tour Timeline & Status
                        </span>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-2 relative">
                          {steps.map((step, idx) => {
                            const stepNum = idx + 1;
                            const currentStep = getStepIndex(booking);
                            const isCompleted = currentStep >= stepNum;
                            const isCurrent = currentStep === stepNum;
                            
                            return (
                              <div key={idx} className="flex md:flex-col items-center md:text-center flex-1 w-full relative">
                                {idx < steps.length - 1 && (
                                  <div className="hidden md:block absolute left-[55%] right-[-45%] top-3.5 h-[2px] bg-slate-800 z-0">
                                    <div 
                                      className="h-full bg-secondary transition-all duration-300" 
                                      style={{ width: currentStep > stepNum ? '100%' : '0%' }}
                                    />
                                  </div>
                                )}
                                
                                <div className="flex items-center md:flex-col z-10">
                                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                    isCompleted 
                                      ? 'bg-secondary text-slate-950 font-black shadow-lg shadow-secondary/20' 
                                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                                  } ${isCurrent ? 'ring-4 ring-secondary/20 animate-pulse' : ''}`}>
                                    {isCompleted ? '✓' : stepNum}
                                  </div>
                                  <div className="ml-3 md:ml-0 md:mt-2 text-left md:text-center">
                                    <p className={`text-2xs font-bold leading-tight ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                                      {step.label}
                                    </p>
                                    <p className="text-4xs text-muted-foreground hidden md:block mt-0.5">
                                      {step.desc}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Guide Information Block */}
                        {booking.guideAssignment && (
                          <div className="mt-4 pt-4 border-t border-border/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-2xs">
                            <div className="space-y-0.5">
                              <span className="text-4xs font-bold uppercase tracking-widest text-muted-foreground block font-mono">Tour Guide</span>
                              <span className="font-semibold text-foreground">{booking.guideAssignment.guide.user.name}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-4xs font-bold uppercase tracking-widest text-muted-foreground block font-mono">Guide Phone</span>
                              <span className="font-semibold text-secondary font-mono">{booking.guideAssignment.guide.phone || '+1-555-0199'}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-4xs font-bold uppercase tracking-widest text-muted-foreground block font-mono">Guide Rating</span>
                              <span className="font-semibold text-foreground flex items-center gap-0.5">
                                <span className="text-amber-400">★</span>
                                <span>{booking.guideAssignment.guide.averageRating || '5.0'} / 5</span>
                              </span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-4xs font-bold uppercase tracking-widest text-muted-foreground block font-mono">Meeting Location</span>
                              <span className="font-semibold text-foreground truncate">{booking.pickupLocation || 'Hotel Lobby / Airport'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Pricing & Invoices */}
                    <div className="border-t border-border/20 pt-3 flex items-center justify-between">
                      <span className="text-sm font-extrabold text-foreground">₹{booking.totalPrice.toLocaleString('en-IN')}</span>
                      <div className="flex items-center space-x-2">
                        {booking.guideAssignment && ['ACCEPTED', 'STARTED'].includes(booking.guideAssignment.status) && (
                          <button
                            onClick={() => handleOpenChat(booking)}
                            className="rounded-lg border border-white/10 bg-slate-900/60 hover:bg-slate-950 px-3 py-1.5 text-2xs font-bold text-slate-300 flex items-center space-x-1"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-secondary animate-pulse" />
                            <span>Chat with Guide</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedInvoice(booking)}
                          className="rounded-lg border border-border hover:bg-accent px-3 py-1.5 text-2xs font-semibold text-foreground flex items-center space-x-1"
                        >
                          <Receipt className="h-3.5 w-3.5 text-secondary" />
                          <span>Invoice Summary</span>
                        </button>
                        {booking.guideAssignment && booking.guideAssignment.status === 'COMPLETED' && !booking.guideAssignment.rating && (
                          <button
                            onClick={() => setRatingBooking(booking)}
                            className="rounded-lg bg-secondary hover:brightness-110 px-3.5 py-1.5 text-2xs font-bold text-slate-950 flex items-center space-x-1 transition-all"
                          >
                            <span>★</span>
                            <span>Rate Guide</span>
                          </button>
                        )}
                        {booking.guideAssignment && booking.guideAssignment.rating && (
                          <div className="text-3xs text-secondary font-bold flex items-center space-x-1 bg-secondary/10 px-2.5 py-1.5 rounded-lg border border-secondary/20">
                            <span>Rated: {booking.guideAssignment.rating}/5 ★</span>
                          </div>
                        )}
                        {booking.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="rounded-lg border border-destructive/20 hover:bg-destructive/10 px-3 py-1.5 text-2xs font-semibold text-destructive transition-all"
                          >
                            Cancel Reservation
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
                <span>My Wishlist Destinations</span>
              </h2>
              
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                {[
                  {
                    name: 'Kashmir Paradise Valley Tour',
                    price: '₹42,415/person',
                    image: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=200',
                  },
                  {
                    name: 'Maldives Overwater Pool Villa Getaway',
                    price: '₹161,415/person',
                    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=200',
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
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-2xs font-bold text-foreground block">{wish.price}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-primary/10 border border-secondary/20 p-5 space-y-2 text-xs">
                <h4 className="font-bold text-secondary flex items-center space-x-1">
                  <Info className="h-4 w-4" />
                  <span>Baggage Policy Info</span>
                </h4>
                <p className="text-2xs text-muted-foreground leading-relaxed">
                  Escorted vehicle transfers accommodate 1 medium bag (23kg) per traveler. Excess luggage requests must be submitted to planners.
                </p>
              </div>
            </div>

          </div>
        </>
      )}

      {/* Bottom Navigation Bar */}
      <div className="sticky bottom-4 z-35 bg-slate-950/90 backdrop-blur-md border border-secondary/20 rounded-2xl py-3 px-6 max-w-sm mx-auto mt-12 flex justify-around items-center shadow-2xl">
        <Link href="/" className="flex flex-col items-center space-y-1 text-muted-foreground hover:text-secondary transition-colors">
          <Home className="h-5 w-5" />
          <span className="text-4xs font-bold uppercase tracking-wider">Home</span>
        </Link>
        <Link href="/packages" className="flex flex-col items-center space-y-1 text-muted-foreground hover:text-secondary transition-colors">
          <Palmtree className="h-5 w-5" />
          <span className="text-4xs font-bold uppercase tracking-wider">Tour Packages</span>
        </Link>
        <Link href="/dashboard" className="flex flex-col items-center space-y-1 text-secondary transition-colors">
          <Ticket className="h-5 w-5" />
          <span className="text-4xs font-bold uppercase tracking-wider font-extrabold">My Bookings</span>
        </Link>
      </div>

      {/* DETAILED INVOICE MODAL SIMULATOR */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl animate-fade-in space-y-6">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center border-b border-border/20 pb-4">
              <FileText className="h-10 w-10 text-secondary mx-auto mb-1" />
              <h3 className="text-lg font-black text-foreground">Explore World Billed Invoice</h3>
              <p className="text-3xs text-muted-foreground uppercase font-semibold">Reference ID: {selectedInvoice.invoiceId}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tour Package</span>
                <span className="font-semibold text-foreground text-right">{selectedInvoice.package.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Travel Date</span>
                <span className="font-semibold text-foreground">{new Date(selectedInvoice.travelDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Travelers</span>
                <span className="font-semibold text-foreground">{selectedInvoice.travelersCount} Adults</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lodgings Plan</span>
                <span className="font-semibold text-foreground">{selectedInvoice.roomType} Room</span>
              </div>
              <div className="border-t border-dashed border-border/80 my-3" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Billed Item</span>
                <span className="font-semibold text-foreground">₹{(selectedInvoice.package.price * 85).toLocaleString('en-IN')} / person</span>
              </div>
              <div className="flex justify-between font-bold text-sm">
                <span className="text-foreground">Total Price Charged</span>
                <span className="text-secondary">₹{selectedInvoice.totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => {
                alert('Invoice downloaded successfully as PDF!');
                setSelectedInvoice(null);
              }}
              className="w-full rounded-xl bg-secondary py-2.5 text-xs font-bold text-slate-950 flex items-center justify-center space-x-1 hover:brightness-110"
            >
              <ArrowDownToLine className="h-4 w-4" />
              <span>Download Billed PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* RATE TOUR GUIDE MODAL */}
      {ratingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <form onSubmit={handleRateGuide} className="relative w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl animate-fade-in space-y-6">
            <button
              type="button"
              onClick={() => setRatingBooking(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center border-b border-border/20 pb-4">
              <h3 className="text-lg font-black text-foreground">Rate Tour Guide</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Share your travel experience with guide **{ratingBooking.guideAssignment?.guide.user.name}**
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="block text-3xs font-bold uppercase text-muted-foreground text-center">Your Rating</label>
                <div className="flex justify-center space-x-2 text-2xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setGuideRating(star)}
                      className={`transition-colors duration-150 ${
                        star <= guideRating ? 'text-amber-400' : 'text-slate-600'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-3xs font-bold uppercase text-muted-foreground">Feedback Comments</label>
                <textarea
                  required
                  placeholder="How was the guide's coordination, knowledge, and behavior?"
                  value={guideFeedback}
                  onChange={(e) => setGuideFeedback(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-xs text-foreground focus:outline-none h-20 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={ratingLoading}
              className="w-full rounded-xl bg-secondary py-2.5 text-xs font-bold text-slate-950 flex items-center justify-center space-x-1 hover:brightness-110 disabled:opacity-50 transition-all duration-200"
            >
              <span>{ratingLoading ? 'Submitting...' : 'Submit Rating & Feedback'}</span>
            </button>
          </form>
        </div>
      )}

      {/* MOCK GUIDE CHAT DIALOG */}
      {activeChat && activeChat.guideAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-5 shadow-2xl flex flex-col h-[500px] text-xs">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-border/20 pb-3.5 mb-3.5">
              <div className="flex items-center space-x-2.5">
                <div className="rounded-full bg-secondary/10 p-2 text-secondary">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Guide: {activeChat.guideAssignment.guide.user.name}</h3>
                  <span className="text-3xs text-secondary font-semibold font-mono">Contact: +1-555-0199</span>
                </div>
              </div>
              <button
                onClick={() => setActiveChat(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 mb-4">
              {(chatMessages[activeChat.id] || []).map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col max-w-[80%] ${
                    msg.sender === 'customer' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                      msg.sender === 'customer'
                        ? 'bg-secondary text-slate-950 font-medium rounded-tr-none'
                        : 'bg-slate-800 text-white rounded-tl-none border border-slate-700/50'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-4xs text-slate-500 mt-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChat} className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type your message to the guide..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 rounded-xl bg-slate-950 border border-white/10 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-secondary"
              />
              <button
                type="submit"
                className="rounded-xl bg-secondary p-2.5 text-slate-950 hover:brightness-110 shadow"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

          </div>
        </div>
      )}

      {/* Auth Modal Trigger in case session logs out */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}

// X icon for closing modal
function X({ className, ...props }: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
