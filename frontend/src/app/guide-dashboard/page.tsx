'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { 
  Compass, ShieldAlert, Calendar, DollarSign, CheckCircle2, XCircle, 
  Clock, User, MapPin, Users, Star, Award, History, ClipboardCheck, 
  MessageSquare, ExternalLink, Send, X, Phone
} from 'lucide-react';
import AuthModal from '@/components/AuthModal';

interface Assignment {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'STARTED' | 'REJECTED' | 'COMPLETED';
  rating?: number | null;
  feedback?: string | null;
  createdAt: string;
  booking: {
    id: string;
    travelDate: string;
    travelersCount: number;
    roomType: string;
    specialRequests: string;
    pickupLocation: string;
    contactNumber: string;
    totalPrice: number;
    status: string;
    invoiceId: string;
    user: { name: string; email: string };
    package: {
      id: string;
      name: string;
      destination: string;
      price: number;
      durationDays: number;
      hotelDetails: string;
      mealPlan: string;
      transportation: string;
      images: string[];
      itinerary: any[];
    };
  };
}

interface GuideProfile {
  id: string;
  name: string;
  email: string;
  specialization: string;
  availability: boolean;
}

interface DashboardData {
  guide: GuideProfile;
  stats: {
    totalAssigned: number;
    todayTours: number;
    upcomingTours: number;
    completedTours: number;
    pendingRequests: number;
    monthlyEarnings: number;
  };
  assignments: Assignment[];
}

export default function GuideDashboard() {
  const { apiUrl, token, user } = useApp();
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Chat Panel states
  const [activeChat, setActiveChat] = useState<Assignment | null>(null);
  const [chatMessages, setChatMessages] = useState<{[key: string]: { sender: 'guide' | 'customer', text: string, time: string }[]}>({});
  const [newMessage, setNewMessage] = useState('');

  const fetchDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/api/guide/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Failed to fetch dashboard data');
      setData(resData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user) {
      if (user.role !== 'GUIDE') {
        router.push('/');
      } else {
        fetchDashboardData();
      }
    }
  }, [token, user]);

  const handleUpdateStatus = async (assignmentId: string, newStatus: 'ACCEPTED' | 'REJECTED' | 'STARTED' | 'COMPLETED') => {
    if (!token) return;
    setActionLoading(assignmentId);
    try {
      const res = await fetch(`${apiUrl}/api/guide/assignments/${assignmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Failed to update assignment');

      alert(`Tour booking status updated to ${newStatus.toLowerCase()} successfully.`);
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Chat message helpers
  const getInitialMessages = (asg: Assignment) => [
    { sender: 'customer' as const, text: `Hello! I am ${asg.booking.user.name}. Can we confirm the pickup location?`, time: '9:02 AM' },
    { sender: 'guide' as const, text: `Hi ${asg.booking.user.name}! I will meet you at the ${asg.booking.pickupLocation} as scheduled.`, time: '9:05 AM' },
    { sender: 'customer' as const, text: `Perfect! My contact number is ${asg.booking.contactNumber} in case you need to call.`, time: '9:08 AM' },
  ];

  const handleOpenChat = (asg: Assignment) => {
    setActiveChat(asg);
    if (!chatMessages[asg.id]) {
      setChatMessages(prev => ({
        ...prev,
        [asg.id]: getInitialMessages(asg)
      }));
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const userMsg = {
      sender: 'guide' as const,
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), userMsg]
    }));
    setNewMessage('');

    // Trigger mock automatic reply
    setTimeout(() => {
      const reply = {
        sender: 'customer' as const,
        text: "Thanks for the update! Looking forward to starting the tour.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => ({
        ...prev,
        [activeChat.id]: [...(prev[activeChat.id] || []), reply]
      }));
    }, 1500);
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-md w-full py-32 text-center space-y-6 flex flex-col justify-center min-h-[75vh]">
        <div className="rounded-2xl border border-dashed border-secondary/30 p-8 bg-card shadow-sm space-y-4">
          <ShieldAlert className="h-12 w-12 text-secondary mx-auto animate-pulse" />
          <h2 className="text-xl font-bold text-foreground">Guide Access Required</h2>
          <p className="text-xs text-muted-foreground">
            Please sign in with a Tour Guide account to access your assignments and earnings.
          </p>
          <button
            onClick={() => setIsAuthOpen(true)}
            className="w-full rounded-xl bg-gradient-to-r from-secondary to-amber-600 py-2.5 text-sm font-bold text-slate-950 shadow transition-all"
          >
            Sign In
          </button>
        </div>
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl w-full px-4 py-16 space-y-8 animate-pulse">
        <div className="h-16 w-1/3 bg-muted rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-muted rounded-3xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg w-full py-32 text-center">
        <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-6 text-sm text-destructive">
          Failed to load guide dashboard: {error}
        </div>
      </div>
    );
  }

  const pendingAssignments = data.assignments.filter(a => a.status === 'PENDING');
  const activeAssignments = data.assignments.filter(a => ['ACCEPTED', 'STARTED'].includes(a.status));
  const historyAssignments = data.assignments.filter(a => ['COMPLETED', 'REJECTED'].includes(a.status));
  const ratings = data.assignments.filter(a => a.rating !== null && a.rating !== undefined);

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      
      {/* Welcome Header */}
      <div className="rounded-3xl bg-slate-950 border border-secondary/20 relative p-6 sm:p-8 overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
        <div className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 space-y-1">
          <span className="text-xs font-bold text-secondary uppercase tracking-widest block">Guide Console</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Welcome back, {data.guide.name}!</h1>
          <p className="text-xs text-slate-400">Specialization: <strong>{data.guide.specialization}</strong> • Status: <strong>{data.guide.availability ? 'Available for Tours' : 'Unavailable'}</strong></p>
        </div>
        <div className="relative z-10 flex items-center space-x-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-xs font-semibold text-secondary">
          <Compass className="h-4 w-4 animate-spin-slow" />
          <span>Tour Guide Portal Active</span>
        </div>
      </div>

      {/* KPI Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-1.5">
          <span className="text-4xs font-bold uppercase tracking-wider text-muted-foreground block">Assigned Tours</span>
          <span className="text-lg font-extrabold text-foreground">{data.stats.totalAssigned}</span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-1.5">
          <span className="text-4xs font-bold uppercase tracking-wider text-muted-foreground block">Today's Tours</span>
          <span className="text-lg font-extrabold text-foreground">{data.stats.todayTours}</span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-1.5">
          <span className="text-4xs font-bold uppercase tracking-wider text-muted-foreground block">Upcoming Tours</span>
          <span className="text-lg font-extrabold text-foreground">{data.stats.upcomingTours}</span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-1.5">
          <span className="text-4xs font-bold uppercase tracking-wider text-muted-foreground block">Completed Tours</span>
          <span className="text-lg font-extrabold text-foreground">{data.stats.completedTours}</span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-1.5">
          <span className="text-4xs font-bold uppercase tracking-wider text-muted-foreground block">Pending Requests</span>
          <span className="text-lg font-extrabold text-secondary">{data.stats.pendingRequests}</span>
        </div>
        <div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-4 shadow-sm space-y-1.5">
          <span className="text-4xs font-bold uppercase tracking-wider text-secondary block">Monthly Earnings</span>
          <span className="text-lg font-extrabold text-secondary">${data.stats.monthlyEarnings}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Work Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Pending Requests */}
          <div className="space-y-4">
            <h2 className="text-md font-bold text-foreground flex items-center space-x-1.5 uppercase tracking-wider">
              <Clock className="h-4.5 w-4.5 text-secondary" />
              <span>Pending Tour Requests</span>
            </h2>

            {pendingAssignments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                No new guide assignment requests pending.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingAssignments.map(asg => (
                  <div key={asg.id} className="rounded-2xl border border-secondary/20 bg-card p-5 space-y-4 shadow-sm">
                    <div className="flex justify-between items-center border-b border-border/20 pb-3">
                      <div>
                        <span className="text-xs font-black text-foreground block">{asg.booking.package.name}</span>
                        <span className="text-4xs text-slate-500 block font-mono">INV: {asg.booking.invoiceId}</span>
                      </div>
                      <span className="text-3xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded">
                        Pending Accept
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                      <div>
                        <p>Customer: <strong className="text-foreground">{asg.booking.user.name}</strong></p>
                        <p className="text-3xs flex items-center space-x-1 mt-0.5">
                          <Phone className="h-3 w-3 text-slate-500" />
                          <span>{asg.booking.contactNumber}</span>
                        </p>
                      </div>
                      <div>
                        <p>Travelers: <strong className="text-foreground">{asg.booking.travelersCount} Adults</strong></p>
                        <p>Date: <strong className="text-foreground">{new Date(asg.booking.travelDate).toLocaleDateString()}</strong></p>
                      </div>
                      <div className="col-span-2 flex items-start space-x-1 text-3xs border-t border-border/20 pt-2">
                        <MapPin className="h-3 w-3 text-secondary shrink-0 mt-0.5" />
                        <p>Pickup: <strong className="text-foreground">{asg.booking.pickupLocation}</strong></p>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={() => handleUpdateStatus(asg.id, 'ACCEPTED')}
                        disabled={actionLoading === asg.id}
                        className="flex-1 rounded-xl bg-secondary py-2 text-2xs font-bold text-slate-950 shadow hover:brightness-110 disabled:opacity-50"
                      >
                        Accept Booking
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(asg.id, 'REJECTED')}
                        disabled={actionLoading === asg.id}
                        className="flex-1 rounded-xl border border-destructive/20 hover:bg-destructive/10 py-2 text-2xs font-bold text-destructive disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Tours */}
          <div className="space-y-4">
            <h2 className="text-md font-bold text-foreground flex items-center space-x-1.5 uppercase tracking-wider">
              <ClipboardCheck className="h-4.5 w-4.5 text-secondary" />
              <span>Active Guided Tours</span>
            </h2>

            {activeAssignments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                No active bookings assigned.
              </div>
            ) : (
              <div className="space-y-4">
                {activeAssignments.map(asg => (
                  <div key={asg.id} className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm hover:border-secondary/20 transition-all">
                    <div className="flex justify-between items-start border-b border-border/20 pb-3">
                      <div>
                        <span className="text-xs font-black text-foreground block">{asg.booking.package.name}</span>
                        <span className="text-4xs text-muted-foreground block font-mono">Invoice Reference: {asg.booking.invoiceId}</span>
                      </div>
                      <span className={`text-3xs font-bold border px-2 py-0.5 rounded ${
                        asg.status === 'STARTED'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }`}>
                        {asg.status === 'STARTED' ? 'Tour Running' : 'Accepted'}
                      </span>
                    </div>

                    {/* Customer & Package Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                      <div className="space-y-1">
                        <span className="text-4xs font-bold uppercase tracking-wider text-muted-foreground block">Customer Details</span>
                        <p className="font-semibold text-foreground">{asg.booking.user.name}</p>
                        <p className="text-3xs flex items-center space-x-1 font-mono">
                          <Phone className="h-3 w-3 text-secondary" />
                          <span>{asg.booking.contactNumber}</span>
                        </p>
                        <p className="text-3xs flex items-center space-x-1 mt-1">
                          <Users className="h-3 w-3 text-secondary" />
                          <span>{asg.booking.travelersCount} Travelers • {asg.booking.roomType} Room</span>
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-4xs font-bold uppercase tracking-wider text-muted-foreground block">Inclusions & Logistics</span>
                        <p className="text-3xs text-foreground">🏨 Hotel: {asg.booking.package.hotelDetails}</p>
                        <p className="text-3xs text-foreground">🚐 Transport: {asg.booking.package.transportation}</p>
                      </div>

                      <div className="col-span-1 md:col-span-2 border-t border-border/20 pt-2 grid grid-cols-2 gap-2 text-3xs">
                        <div className="flex items-start space-x-1">
                          <Calendar className="h-3.5 w-3.5 text-secondary shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-500 block font-semibold uppercase tracking-wider">Tour Date</span>
                            <strong className="text-foreground text-2xs">{new Date(asg.booking.travelDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                          </div>
                        </div>
                        <div className="flex items-start space-x-1">
                          <MapPin className="h-3.5 w-3.5 text-secondary shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-500 block font-semibold uppercase tracking-wider">Pickup Location</span>
                            <strong className="text-foreground text-2xs">{asg.booking.pickupLocation}</strong>
                          </div>
                        </div>
                      </div>

                      {asg.booking.specialRequests && (
                        <div className="col-span-1 md:col-span-2 rounded-lg bg-muted/40 p-2.5 text-3xs border border-border/20">
                          <span className="font-bold text-foreground block mb-0.5">Special Requests Note:</span>
                          <span className="italic">"{asg.booking.specialRequests}"</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/20">
                      
                      {/* Start / Complete Actions */}
                      {asg.status === 'ACCEPTED' ? (
                        <button
                          onClick={() => handleUpdateStatus(asg.id, 'STARTED')}
                          disabled={actionLoading === asg.id}
                          className="col-span-2 rounded-xl bg-gradient-to-r from-secondary to-amber-500 hover:brightness-110 py-2.5 text-2xs font-bold text-slate-950 shadow flex items-center justify-center space-x-1 disabled:opacity-50"
                        >
                          <Compass className="h-3.5 w-3.5 animate-spin-slow" />
                          <span>Start Tour</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(asg.id, 'COMPLETED')}
                          disabled={actionLoading === asg.id}
                          className="col-span-2 rounded-xl bg-emerald-500 hover:brightness-110 py-2.5 text-2xs font-bold text-white shadow flex items-center justify-center space-x-1 disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Complete Tour</span>
                        </button>
                      )}

                      {/* Google Maps Button */}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(asg.booking.pickupLocation)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-white/10 bg-slate-900/60 hover:bg-slate-950 py-2.5 text-2xs font-bold text-slate-300 flex items-center justify-center space-x-1"
                      >
                        <MapPin className="h-3.5 w-3.5 text-rose-500" />
                        <span>Google Maps</span>
                      </a>

                      {/* Chat Button */}
                      <button
                        onClick={() => handleOpenChat(asg)}
                        className="rounded-xl border border-white/10 bg-slate-900/60 hover:bg-slate-950 py-2.5 text-2xs font-bold text-slate-300 flex items-center justify-center space-x-1"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-secondary animate-pulse" />
                        <span>Chat</span>
                      </button>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking History Log */}
          <div className="space-y-4">
            <h2 className="text-md font-bold text-foreground flex items-center space-x-1.5 uppercase tracking-wider">
              <History className="h-4.5 w-4.5 text-secondary" />
              <span>Assigned Tours History</span>
            </h2>

            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border/80 text-muted-foreground font-semibold">
                    <th className="p-3">Invoice</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Package Destination</th>
                    <th className="p-3">Travel Date</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historyAssignments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground italic">
                        No previous tour records logged.
                      </td>
                    </tr>
                  ) : (
                    historyAssignments.map(asg => (
                      <tr key={asg.id} className="border-b border-border/40 last:border-b-0 hover:bg-muted/20">
                        <td className="p-3 font-mono font-bold">{asg.booking.invoiceId}</td>
                        <td className="p-3">
                          <span className="font-semibold block">{asg.booking.user.name}</span>
                          <span className="text-3xs text-muted-foreground block">{asg.booking.user.email}</span>
                        </td>
                        <td className="p-3 font-semibold text-primary dark:text-secondary truncate max-w-44">
                          {asg.booking.package.name}
                        </td>
                        <td className="p-3">{new Date(asg.booking.travelDate).toLocaleDateString()}</td>
                        <td className="p-3">
                          <span className={`rounded px-1.5 py-0.5 text-4xs font-semibold ${
                            asg.status === 'COMPLETED'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-destructive/10 text-destructive'
                          }`}>
                            {asg.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Sidebar: Customer Ratings & Feedback */}
        <div className="space-y-6">
          <h2 className="text-md font-bold text-foreground flex items-center space-x-1.5 uppercase tracking-wider">
            <Star className="h-4.5 w-4.5 text-secondary" />
            <span>Customer Ratings & Reviews</span>
          </h2>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
            
            {/* Average Rating Block */}
            {ratings.length > 0 ? (
              <div className="text-center py-4 border-b border-border/20 space-y-1">
                <div className="text-3xl font-black text-foreground flex items-center justify-center space-x-1">
                  <span>{Number((ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length).toFixed(1))}</span>
                  <span className="text-secondary">★</span>
                </div>
                <p className="text-3xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Out of {ratings.length} customer review{ratings.length > 1 ? 's' : ''}
                </p>
              </div>
            ) : (
              <div className="text-center py-4 border-b border-border/20 space-y-1">
                <div className="text-3xl font-black text-foreground flex items-center justify-center space-x-1">
                  <span>5.0</span>
                  <span className="text-secondary">★</span>
                </div>
                <p className="text-3xs text-muted-foreground font-semibold uppercase tracking-wider">
                  No ratings submitted yet
                </p>
              </div>
            )}

            {/* List of Reviews */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {ratings.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-4">
                  Reviews will appear here once customers rate your completed tours.
                </p>
              ) : (
                ratings.map(asg => (
                  <div key={asg.id} className="pb-3 border-b border-border/20 last:border-b-0 last:pb-0 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground">{asg.booking.user.name}</span>
                      <div className="text-amber-500 font-bold text-3xs flex space-x-0.5">
                        <span>★</span>
                        <span>{asg.rating}</span>
                      </div>
                    </div>
                    <span className="text-4xs text-secondary font-semibold block">{asg.booking.package.name}</span>
                    {asg.feedback && (
                      <p className="text-muted-foreground italic leading-relaxed">
                        "{asg.feedback}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        </div>

      </div>

      {/* CUSTOMER CHAT DIALOG */}
      {activeChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-5 shadow-2xl flex flex-col h-[500px] text-xs">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-border/20 pb-3.5 mb-3.5">
              <div className="flex items-center space-x-2.5">
                <div className="rounded-full bg-secondary/10 p-2 text-secondary">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">{activeChat.booking.user.name}</h3>
                  <span className="text-3xs text-secondary font-semibold">Contact: {activeChat.booking.contactNumber}</span>
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
                    msg.sender === 'guide' ? 'ml-auto items-end' : 'mr-auto items-start'
                  }`}
                >
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                      msg.sender === 'guide'
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
                placeholder="Type your message to the customer..."
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

    </div>
  );
}
