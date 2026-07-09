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
    { label: 'Confirmed', desc: 'Reservation safe' },
    { label: 'Guide Assigned', desc: 'Local guide matches' },
    { label: 'Accepted', desc: 'Guide accepted trip' },
    { label: 'Started', desc: 'Tour is ongoing' },
    { label: 'Completed', desc: 'Hope you enjoyed!' }
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
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in flex flex-col justify-between min-h-[80vh] bg-slate-50 text-slate-900 font-sans">
      
      {!token ? (
        /* LOGGED OUT / AUTHENTICATION REQUIRED VIEW */
        <div className="mx-auto max-w-md w-full py-16 text-center space-y-6 flex-grow flex flex-col justify-center">
          <div className="rounded-[18px] border border-dashed border-slate-300 p-8 bg-white shadow-sm space-y-4">
            <ShieldAlert className="h-12 w-12 text-amber-500 mx-auto animate-pulse" />
            <h2 className="text-lg font-bold text-slate-950 font-sans">Authentication Required</h2>
            <p className="text-xs text-slate-500 font-semibold">
              Please sign in to view your bookings history, wishlist, and active tour itineraries.
            </p>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="w-full rounded-xl bg-slate-950 hover:bg-slate-900 py-3 text-xs font-bold text-white shadow-sm transition-all"
            >
              Sign In Now
            </button>
          </div>
        </div>
      ) : (
        /* LOGGED IN VIEW */
        <>
          {/* Welcome Header */}
          <div className="rounded-[18px] bg-slate-900 text-white relative p-6 sm:p-8 overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md">
            <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800')] bg-cover bg-center opacity-10" />
            <div className="relative z-10 space-y-1">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block font-sans">Traveller Portal</span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans">Welcome back, {user?.name}!</h1>
              <p className="text-xs text-slate-400 font-medium">{user?.email} • Premium Explorer Member</p>
            </div>
            <div className="relative z-10 flex items-center space-x-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-xs font-bold text-amber-400">
              <Compass className="h-4.5 w-4.5 text-amber-400 animate-spin-slow" />
              <span>Active Escorted Travel Status</span>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Bookings History */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-base font-bold text-slate-950 flex items-center space-x-2 font-sans">
                <Ticket className="h-5 w-5 text-amber-500" />
                <span>My Bookings & Escorts</span>
              </h2>

              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-32 w-full bg-white animate-pulse rounded-[18px] border border-slate-200 shadow-sm" />
                ))
              ) : error ? (
                <div className="rounded-[18px] bg-rose-50 border border-rose-150 p-5 text-xs text-rose-600 text-center font-bold">
                  Failed to load bookings: {error}
                </div>
              ) : bookings.length === 0 ? (
                <div className="rounded-[18px] border border-dashed border-slate-300 p-12 text-center bg-white shadow-sm">
                  <Compass className="h-8 w-8 text-slate-400 mx-auto mb-2 animate-bounce" />
                  <h4 className="font-bold text-slate-900 font-sans">No bookings found</h4>
                  <p className="text-xs text-slate-500 font-semibold mt-1">You haven't reserved any escorted holiday packages yet.</p>
                </div>
              ) : (
                bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-[18px] border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between gap-5 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-slate-950 bg-amber-400 px-2.5 py-0.5 rounded-lg font-sans">
                          {booking.package.destination.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 font-mono">INV-{booking.invoiceId}</span>
                      </div>
                      <span
                        className={`rounded px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          booking.status === 'CONFIRMED' || booking.status === 'Tour Completed' || booking.status === 'Tour Started'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : booking.status === 'CANCELLED'
                            ? 'bg-rose-500/10 text-rose-600'
                            : 'bg-amber-500/10 text-amber-600'
                        }`}
                      >
                        {booking.status === 'Waiting for Guide Acceptance' ? 'Awaiting Guide' : booking.status}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="text-xs grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-500 font-semibold">
                      <div>
                        <p className="font-bold text-slate-900 text-sm leading-snug font-sans">{booking.package.name}</p>
                        <p className="flex items-center space-x-1.5 mt-2 text-slate-400 font-bold">
                          <Calendar className="h-3.5 w-3.5 text-amber-500" />
                          <span>Date: {new Date(booking.travelDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </p>
                      </div>
                      <div className="text-left sm:text-right space-y-1">
                        <p>Travelers: <strong className="text-slate-900">{booking.travelersCount} Travelers</strong></p>
                        <p>Lodging: <strong className="text-slate-900">{booking.roomType} Room</strong></p>
                      </div>
                    </div>

                     {/* Progress Timeline */}
                    {booking.status !== 'CANCELLED' && (
                      <div className="mt-2 p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block font-sans">
                          Tour Timeline Status
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
                                  <div className="hidden md:block absolute left-[55%] right-[-45%] top-3.5 h-[2px] bg-slate-200 z-0">
                                    <div 
                                      className="h-full bg-amber-500 transition-all duration-300" 
                                      style={{ width: currentStep > stepNum ? '100%' : '0%' }}
                                    />
                                  </div>
                                )}
                                
                                <div className="flex items-center md:flex-col z-10 w-full">
                                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                                    isCompleted 
                                      ? 'bg-slate-900 text-amber-400 font-bold shadow-sm' 
                                      : 'bg-white text-slate-300 border border-slate-200'
                                  } ${isCurrent ? 'ring-4 ring-amber-500/20' : ''}`}>
                                    {isCompleted ? '✓' : stepNum}
                                  </div>
                                  <div className="ml-3 md:ml-0 md:mt-2 text-left md:text-center">
                                    <p className={`text-[10px] font-bold leading-tight ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                                      {step.label}
                                    </p>
                                    <p className="text-[9px] font-bold text-slate-400 hidden md:block mt-0.5">
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
                          <div className="mt-2 pt-4 border-t border-slate-200/60 grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-semibold text-slate-600">
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block font-sans">Tour Guide</span>
                              <span className="font-bold text-slate-900">{booking.guideAssignment.guide.user.name}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block font-sans">Phone Number</span>
                              <span className="font-bold text-amber-600 font-mono">{booking.guideAssignment.guide.phone || '+91 98765 43210'}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block font-sans">Guide Rating</span>
                              <span className="font-bold text-slate-900 flex items-center gap-0.5">
                                <span className="text-amber-500">★</span>
                                <span>{booking.guideAssignment.guide.averageRating || '5.0'} / 5</span>
                              </span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block font-sans">Pickup Point</span>
                              <span className="font-bold text-slate-900 truncate block max-w-[120px]">{booking.pickupLocation || 'Hotel Lobby'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Pricing & Invoices */}
                    <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <span className="text-base font-black text-slate-950">₹{booking.totalPrice.toLocaleString('en-IN')}</span>
                      <div className="flex flex-wrap items-center gap-2">
                        {booking.guideAssignment && ['ACCEPTED', 'STARTED'].includes(booking.guideAssignment.status) && (
                          <button
                            onClick={() => handleOpenChat(booking)}
                            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-2xs font-bold text-slate-700 flex items-center space-x-1.5 shadow-2xs"
                          >
                            <MessageSquare className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                            <span>Chat with Guide</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedInvoice(booking)}
                          className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-2xs font-bold text-slate-700 flex items-center space-x-1.5 shadow-2xs"
                        >
                          <Receipt className="h-3.5 w-3.5 text-amber-500" />
                          <span>Invoice Summary</span>
                        </button>
                        {booking.guideAssignment && booking.guideAssignment.status === 'COMPLETED' && !booking.guideAssignment.rating && (
                          <button
                            onClick={() => setRatingBooking(booking)}
                            className="rounded-xl bg-slate-950 hover:bg-slate-900 px-4 py-2 text-2xs font-bold text-white flex items-center space-x-1.5 transition-all shadow-sm"
                          >
                            <span>★</span>
                            <span>Rate Guide</span>
                          </button>
                        )}
                        {booking.guideAssignment && booking.guideAssignment.rating && (
                          <div className="text-[10px] text-amber-600 font-bold flex items-center space-x-1 bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/20">
                            <span>Rated: {booking.guideAssignment.rating}/5 ★</span>
                          </div>
                        )}
                        {booking.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 text-2xs font-bold text-rose-600 transition-all"
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
              <h2 className="text-base font-bold text-slate-955 flex items-center space-x-2 font-sans">
                <Heart className="h-5 w-5 text-rose-500 fill-rose-500/20" />
                <span>My Wishlist Destinations</span>
              </h2>
              
              <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm space-y-4">
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
                  <div key={idx} className="flex items-center space-x-3 pb-3.5 border-b border-slate-100 last:pb-0 last:border-b-0">
                    <img
                      src={wish.image}
                      alt={wish.name}
                      className="h-12 w-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-800 block truncate font-sans">{wish.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-amber-500 block">{wish.price}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[18px] bg-amber-500/5 border border-amber-500/10 p-5 space-y-2 text-xs font-semibold text-slate-600">
                <h4 className="font-bold text-amber-600 flex items-center space-x-1.5 font-sans">
                  <Info className="h-4 w-4 shrink-0" />
                  <span>Baggage Policy Info</span>
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                  Escorted vehicle transfers accommodate 1 medium bag (23kg) per traveler. Excess luggage requests must be submitted to planners in advance.
                </p>
              </div>
            </div>

          </div>
        </>
      )}

      {/* Bottom Navigation Bar (Glassmorphic) */}
      <div className="sticky bottom-4 z-35 bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg rounded-2xl py-3 px-6 max-w-sm w-full mx-auto mt-12 flex justify-around items-center">
        <Link href="/" className="flex flex-col items-center space-y-1 text-slate-400 hover:text-slate-900 transition-colors">
          <Home className="h-5 w-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider font-sans">Home</span>
        </Link>
        <Link href="/packages" className="flex flex-col items-center space-y-1 text-slate-400 hover:text-slate-900 transition-colors">
          <Palmtree className="h-5 w-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider font-sans">Packages</span>
        </Link>
        <Link href="/dashboard" className="flex flex-col items-center space-y-1 text-amber-500 transition-colors">
          <Ticket className="h-5 w-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider font-extrabold font-sans">Bookings</span>
        </Link>
      </div>

      {/* DETAILED INVOICE MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white border border-slate-250 p-6 shadow-xl animate-fade-in space-y-5 text-slate-800">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center border-b border-slate-100 pb-4">
              <FileText className="h-10 w-10 text-amber-500 mx-auto mb-1.5" />
              <h3 className="text-base font-bold text-slate-950 font-sans">Holiday Reservation Invoice</h3>
              <p className="text-[10px] text-slate-400 font-bold font-mono uppercase mt-0.5">REF: {selectedInvoice.invoiceId}</p>
            </div>

            <div className="space-y-3.5 text-xs font-semibold text-slate-600">
              <div className="flex justify-between items-start">
                <span className="text-slate-400">Package</span>
                <span className="font-bold text-slate-900 text-right max-w-[200px]">{selectedInvoice.package.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Travel Date</span>
                <span className="font-bold text-slate-900">{new Date(selectedInvoice.travelDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Travelers</span>
                <span className="font-bold text-slate-900">{selectedInvoice.travelersCount} Persons</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Room Type</span>
                <span className="font-bold text-slate-900">{selectedInvoice.roomType} Room</span>
              </div>
              <div className="border-t border-dashed border-slate-200 my-3" />
              <div className="flex justify-between font-bold text-sm">
                <span className="text-slate-900">Total Amount Billed</span>
                <span className="text-amber-500 text-base font-black">₹{selectedInvoice.totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => {
                alert('Invoice downloaded successfully as PDF!');
                setSelectedInvoice(null);
              }}
              className="w-full rounded-xl bg-slate-950 hover:bg-slate-900 py-3 text-xs font-bold text-white flex items-center justify-center space-x-1.5 shadow-sm transition-all"
            >
              <ArrowDownToLine className="h-4.5 w-4.5 text-amber-400" />
              <span>Download PDF Copy</span>
            </button>
          </div>
        </div>
      )}

      {/* RATE TOUR GUIDE MODAL */}
      {ratingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <form onSubmit={handleRateGuide} className="relative w-full max-w-md rounded-2xl bg-white border border-slate-250 p-6 shadow-xl animate-fade-in space-y-6 text-slate-800">
            <button
              type="button"
              onClick={() => setRatingBooking(null)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-950 font-sans">Rate Your Tour Guide</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Share your feedback on escort **{ratingBooking.guideAssignment?.guide.user.name}**
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">Score Stars</label>
                <div className="flex justify-center space-x-2.5 text-2xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setGuideRating(star)}
                      className={`transition-colors duration-150 ${
                        star <= guideRating ? 'text-amber-400' : 'text-slate-350'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Share Comments</label>
                <textarea
                  required
                  placeholder="How was the coordination, tour knowledge, and safety management?"
                  value={guideFeedback}
                  onChange={(e) => setGuideFeedback(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500/50 h-24 resize-none font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={ratingLoading}
              className="w-full rounded-xl bg-slate-950 hover:bg-slate-900 py-3 text-xs font-bold text-white flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
            >
              <span>{ratingLoading ? 'Submitting Review...' : 'Submit Rating'}</span>
            </button>
          </form>
        </div>
      )}

      {/* CHAT DIALOG */}
      {activeChat && activeChat.guideAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-white border border-slate-250 p-5 shadow-xl flex flex-col h-[500px] text-xs text-slate-800">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3 shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="rounded-full bg-slate-100 p-2 text-slate-700">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-950 font-sans text-xs sm:text-sm">Guide: {activeChat.guideAssignment.guide.user.name}</h3>
                  <span className="text-[10px] text-slate-400 font-bold font-mono">Mobile: {activeChat.guideAssignment.guide.phone || '+91 98765 43210'}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveChat(null)}
                className="text-slate-400 hover:text-slate-950 rounded-full p-1 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Message List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 font-semibold">
              {(chatMessages[activeChat.id] || []).map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col max-w-[80%] ${
                    msg.sender === 'customer' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 leading-relaxed text-xs ${
                      msg.sender === 'customer'
                        ? 'bg-amber-400 text-slate-950 rounded-tr-none'
                        : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 font-bold">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChat} className="flex items-center space-x-2 shrink-0">
              <input
                type="text"
                placeholder="Type a message to your guide..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-slate-800 placeholder-slate-450 focus:outline-none focus:border-amber-500/50 font-semibold"
              />
              <button
                type="submit"
                className="rounded-xl bg-slate-950 p-2.5 text-white hover:bg-slate-900 shadow-sm transition-all"
              >
                <Send className="h-4 w-4 text-amber-400" />
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
