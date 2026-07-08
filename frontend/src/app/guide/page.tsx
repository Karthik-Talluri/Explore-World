'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { 
  Compass, ShieldAlert, Calendar, DollarSign, CheckCircle2, XCircle, 
  Clock, User, MapPin, Users, Star, Award, History, ClipboardCheck, 
  MessageSquare, ExternalLink, Send, X, Phone, Mail, Lock, ArrowRight,
  Wifi, WifiOff, LayoutDashboard, Bell, LogOut
} from 'lucide-react';

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

export default function TourGuidePortal() {
  const { apiUrl, token, user, login, logout } = useApp();
  const router = useRouter();

  // Login form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'new-requests' | 'assigned' | 'upcoming' | 'completed' | 'earnings' | 'ratings' | 'profile'>('dashboard');

  // Dashboard states
  const [data, setData] = useState<DashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toggleLoading, setToggleLoading] = useState(false);

  // Chat Panel states
  const [activeChat, setActiveChat] = useState<Assignment | null>(null);
  const [chatMessages, setChatMessages] = useState<{[key: string]: { sender: 'guide' | 'customer', text: string, time: string }[]}>({});
  const [newMessage, setNewMessage] = useState('');

  const fetchDashboardData = async () => {
    if (!token) return;
    setDashboardLoading(true);
    setDashboardError(null);
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
      setDashboardError(err.message);
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    if (token && user && (user.role === 'GUIDE' || user.role === 'TOUR_GUIDE')) {
      fetchDashboardData();
    }
  }, [token, user]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Login failed. Please verify your credentials.');
      }

      if (resData.user.role !== 'GUIDE' && resData.user.role !== 'TOUR_GUIDE') {
        throw new Error('Only Tour Guide accounts are permitted to sign in here.');
      }

      login(resData.token, resData.user);
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!data || !token) return;
    setToggleLoading(true);
    const nextVal = !data.guide.availability;
    try {
      const res = await fetch(`${apiUrl}/api/guide/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ availability: nextVal }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || 'Failed to update profile');

      setData(prev => prev ? {
        ...prev,
        guide: {
          ...prev.guide,
          availability: nextVal
        }
      } : null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setToggleLoading(false);
    }
  };

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

  // RENDER PORTAL VIEW 1: Unauthenticated Login / Forbidden
  if (!token || !user || (user.role !== 'GUIDE' && user.role !== 'TOUR_GUIDE')) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-24 sm:px-6 lg:px-8 overflow-hidden font-sans text-white">
        {/* Glow backgrounds */}
        <div className="absolute top-1/4 left-1/4 h-[300px] w-[300px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-amber-500/10 blur-[130px] pointer-events-none"></div>

        <div className="relative w-full max-w-md space-y-8 z-10">
          
          {user && user.role !== 'GUIDE' && user.role !== 'TOUR_GUIDE' ? (
            <div className="rounded-3xl border border-rose-500/20 p-8 shadow-2xl bg-slate-900/60 backdrop-blur-xl space-y-6 text-center">
              <ShieldAlert className="h-14 w-14 text-rose-500 mx-auto animate-pulse" />
              <div className="space-y-2">
                <h2 className="text-xl font-extrabold tracking-tight text-white">Guide Credentials Required</h2>
                <p className="text-xs text-slate-400">
                  Your current account is registered as a <strong className="text-amber-500 uppercase">{user.role}</strong>. Only Tour Guide accounts are permitted to access this portal.
                </p>
              </div>
              <button
                onClick={logout}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-bold text-slate-950 shadow-lg hover:brightness-110 transition-all duration-200"
              >
                Logout & Sign In as Guide
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center text-center space-y-3">
                <a className="flex items-center space-x-2 text-primary font-bold text-2xl" href="/">
                  <Compass className="h-8 w-8 text-amber-500 animate-spin-slow" />
                  <span className="bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 bg-clip-text text-transparent font-black tracking-wide">
                    Explore World
                  </span>
                </a>
                <div className="space-y-1 mt-2">
                  <h2 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">Tour Guide Portal</h2>
                  <p className="text-xs text-slate-400">Sign in with your Guide credentials to manage assigned tours</p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl bg-slate-900/60 backdrop-blur-xl">
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  
                  {loginError && (
                    <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500 flex items-center space-x-2">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Guide Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="guide@exploreworld.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl bg-slate-950/80 border border-white/10 pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Security Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl bg-slate-950/80 border border-white/10 pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="group relative flex w-full justify-center items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-xs font-bold text-slate-950 shadow-lg hover:brightness-110 disabled:opacity-50 transition-all duration-200"
                  >
                    <span>{loginLoading ? 'Signing In...' : 'Sign In as Guide'}</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </form>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 px-4">
                <a className="hover:text-white transition-colors" href="/">← Back to explorer website</a>
                <span className="flex items-center space-x-1 font-mono">
                  <ShieldAlert className="h-3 w-3 text-amber-500" />
                  <span>Authorized Guides Only</span>
                </span>
              </div>
            </>
          )}

        </div>
      </div>
    );
  }

  // RENDER PORTAL VIEW 2: Dashboard Loading
  if (dashboardLoading) {
    return (
      <div className="flex h-screen bg-slate-950 text-white font-sans">
        <div className="w-64 border-r border-white/5 bg-slate-900/60 p-6 animate-pulse" />
        <div className="flex-1 p-8 space-y-6 animate-pulse">
          <div className="h-12 w-1/4 bg-white/5 rounded-xl" />
          <div className="h-64 bg-white/5 rounded-3xl" />
        </div>
      </div>
    );
  }

  // RENDER PORTAL VIEW 3: Dashboard Error
  if (dashboardError || !data) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center text-white font-sans">
        <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-8 max-w-md text-center space-y-4">
          <ShieldAlert className="h-10 w-10 text-rose-500 mx-auto" />
          <p className="text-sm">Failed to load guide dashboard: {dashboardError}</p>
          <button
            onClick={fetchDashboardData}
            className="rounded-xl bg-amber-500 px-6 py-2.5 text-xs text-slate-950 font-bold hover:brightness-110"
          >
            Retry Request
          </button>
        </div>
      </div>
    );
  }

  const pendingAssignments = data.assignments.filter(a => a.status === 'PENDING');
  const activeAssignments = data.assignments.filter(a => ['ACCEPTED', 'STARTED'].includes(a.status));
  const upcomingAssignments = data.assignments.filter(a => a.status === 'ACCEPTED' && new Date(a.booking.travelDate) > new Date());
  const completedAssignments = data.assignments.filter(a => a.status === 'COMPLETED');
  const ratings = data.assignments.filter(a => a.rating !== null && a.rating !== undefined);

  // RENDER PORTAL VIEW 4: Authorized Guide Dashboard
  return (
    <div className="flex min-h-screen bg-slate-950 text-white font-sans overflow-hidden">
      
      {/* 1. Left Sidebar Portal Navigation */}
      <aside className="w-64 shrink-0 bg-slate-900 border-r border-white/5 flex flex-col justify-between p-6">
        <div className="space-y-8">
          {/* Compass Logo Header */}
          <div className="flex items-center space-x-2 px-2">
            <Compass className="h-6 w-6 text-amber-500 animate-spin-slow" />
            <span className="font-black text-md tracking-wide bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 bg-clip-text text-transparent">
              Guide Console
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'dashboard' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('new-requests')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'new-requests' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Bell className="h-4.5 w-4.5" />
                <span>New Requests</span>
              </div>
              {pendingAssignments.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === 'new-requests' ? 'bg-slate-950 text-amber-500' : 'bg-amber-500 text-slate-950'
                }`}>
                  {pendingAssignments.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('assigned')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'assigned' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ClipboardCheck className="h-4.5 w-4.5" />
              <span>Assigned Tours</span>
            </button>

            <button
              onClick={() => setActiveTab('upcoming')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'upcoming' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="h-4.5 w-4.5" />
              <span>Upcoming Tours</span>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'completed' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <CheckCircle2 className="h-4.5 w-4.5" />
              <span>Completed Tours</span>
            </button>

            <button
              onClick={() => setActiveTab('earnings')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'earnings' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <DollarSign className="h-4.5 w-4.5" />
              <span>Earnings</span>
            </button>

            <button
              onClick={() => setActiveTab('ratings')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'ratings' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Star className="h-4.5 w-4.5" />
              <span>Ratings & Reviews</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'profile' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="h-4.5 w-4.5" />
              <span>Profile</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer - Logout */}
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-500/10 transition-all"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Logout</span>
        </button>
      </aside>

      {/* 2. Main Scrollable Workspace Panel */}
      <main className="flex-grow p-8 overflow-y-auto max-h-screen space-y-6">
        
        {/* Welcome Banner */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h1 className="text-xl font-extrabold text-white">Welcome, {data.guide.name}</h1>
            <p className="text-2xs text-slate-400">Manage your bookings, availability, and earnings.</p>
          </div>

          {/* Quick Stats Online Switch */}
          <button
            disabled={toggleLoading}
            onClick={handleToggleAvailability}
            className={`flex items-center space-x-2 rounded-xl border px-3 py-1.5 text-2xs font-bold transition-all shadow ${
              data.guide.availability
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
            }`}
          >
            {data.guide.availability ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            <span>{data.guide.availability ? 'Online' : 'Offline'}</span>
          </button>
        </div>

        {/* Render Tab Contents */}

        {/* Tab 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* KPI grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-2">
                <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 block font-mono">Total Bookings</span>
                <span className="text-2xl font-black text-white">{data.stats.totalAssigned}</span>
              </div>
              <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-2">
                <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 block font-mono">Today's Tours</span>
                <span className="text-2xl font-black text-white">{data.stats.todayTours}</span>
              </div>
              <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-2">
                <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 block font-mono">Upcoming Tours</span>
                <span className="text-2xl font-black text-white">{data.stats.upcomingTours}</span>
              </div>
              <div className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-2">
                <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 block font-mono">Monthly Earnings</span>
                <span className="text-2xl font-black text-amber-500">${data.stats.monthlyEarnings}</span>
              </div>
            </div>

            {/* Quick Profile Summary */}
            <div className="rounded-2xl border border-white/5 bg-slate-900 p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Tour Guide Profile Summary</h3>
                  <p className="text-2xs text-slate-400">{data.guide.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="border border-white/5 p-3 rounded-xl bg-slate-950/40">
                  <span className="text-slate-500 block text-3xs font-mono uppercase">Specializations</span>
                  <strong className="text-slate-300">{data.guide.specialization}</strong>
                </div>
                <div className="border border-white/5 p-3 rounded-xl bg-slate-950/40">
                  <span className="text-slate-500 block text-3xs font-mono uppercase">Average Rating</span>
                  <strong className="text-amber-500 flex items-center space-x-1 mt-0.5">
                    <span>★</span>
                    <span>{ratings.length > 0 ? (ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length).toFixed(1) : '5.0'}</span>
                  </strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: New Booking Requests */}
        {activeTab === 'new-requests' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">New Assignment Requests</h2>
            {pendingAssignments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs text-slate-400 bg-slate-900/40">
                No new guide assignment requests pending at this time.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingAssignments.map(asg => (
                  <div key={asg.id} className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4 shadow-sm">
                    <div className="flex justify-between items-start border-b border-white/5 pb-3">
                      <div>
                        <span className="text-xs font-black text-white block">{asg.booking.package.name}</span>
                        <span className="text-4xs text-slate-500 block font-mono">INV: {asg.booking.invoiceId}</span>
                      </div>
                      <span className="text-3xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded">
                        New Request
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300">
                      <p>Customer: <strong className="text-white">{asg.booking.user.name}</strong></p>
                      <p>Travelers: <strong>{asg.booking.travelersCount} Travelers</strong></p>
                      <p>Tour Date: <strong>{new Date(asg.booking.travelDate).toLocaleDateString()}</strong></p>
                      <p className="flex items-center space-x-1 text-3xs border-t border-white/5 pt-2">
                        <MapPin className="h-3 w-3 text-amber-500 shrink-0" />
                        <span>Pickup: {asg.booking.pickupLocation}</span>
                      </p>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={() => handleUpdateStatus(asg.id, 'ACCEPTED')}
                        disabled={actionLoading === asg.id}
                        className="flex-1 rounded-xl bg-amber-500 py-2 text-2xs font-bold text-slate-950 shadow hover:brightness-110"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(asg.id, 'REJECTED')}
                        disabled={actionLoading === asg.id}
                        className="flex-1 rounded-xl border border-rose-500/20 hover:bg-rose-500/10 py-2 text-2xs font-bold text-rose-500"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Assigned Bookings */}
        {activeTab === 'assigned' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Active Assigned Bookings</h2>
            {activeAssignments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs text-slate-400 bg-slate-900/40">
                No active bookings currently assigned.
              </div>
            ) : (
              <div className="space-y-4">
                {activeAssignments.map(asg => (
                  <div key={asg.id} className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-4 shadow-sm hover:border-amber-500/20 transition-all">
                    <div className="flex justify-between items-start border-b border-white/5 pb-3">
                      <div>
                        <span className="text-xs font-black text-white block">{asg.booking.package.name}</span>
                        <span className="text-4xs text-slate-500 block font-mono">Invoice Reference: {asg.booking.invoiceId}</span>
                      </div>
                      <span className={`text-3xs font-bold border px-2 py-0.5 rounded ${
                        asg.status === 'STARTED'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }`}>
                        {asg.status === 'STARTED' ? 'Tour Running' : 'Accepted'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
                      <div className="space-y-1">
                        <span className="text-4xs font-bold uppercase tracking-wider text-slate-500 block font-mono">Customer Details</span>
                        <p className="font-semibold text-white">{asg.booking.user.name}</p>
                        <p className="text-3xs flex items-center space-x-1 mt-0.5">
                          <Phone className="h-3 w-3 text-amber-500" />
                          <span>{asg.booking.contactNumber}</span>
                        </p>
                        <p className="text-3xs flex items-center space-x-1 mt-1">
                          <Users className="h-3 w-3 text-amber-500" />
                          <span>{asg.booking.travelersCount} Travelers • {asg.booking.roomType} Room</span>
                        </p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-4xs font-bold uppercase tracking-wider text-slate-500 block font-mono">Package Specs</span>
                        <p className="text-3xs">🏨 Hotel: {asg.booking.package.hotelDetails}</p>
                        <p className="text-3xs">🚐 Transport: {asg.booking.package.transportation}</p>
                      </div>

                      <div className="col-span-1 md:col-span-2 border-t border-white/5 pt-2 grid grid-cols-2 gap-2 text-3xs">
                        <div className="flex items-start space-x-1">
                          <Calendar className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-500 block font-semibold uppercase font-mono">Tour Date</span>
                            <strong className="text-white text-2xs">{new Date(asg.booking.travelDate).toLocaleDateString()}</strong>
                          </div>
                        </div>
                        <div className="flex items-start space-x-1">
                          <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-500 block font-semibold uppercase font-mono">Pickup Location</span>
                            <strong className="text-white text-2xs">{asg.booking.pickupLocation}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5">
                      {asg.status === 'ACCEPTED' ? (
                        <button
                          onClick={() => handleUpdateStatus(asg.id, 'STARTED')}
                          disabled={actionLoading === asg.id}
                          className="col-span-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 py-2.5 text-2xs font-bold text-slate-950 flex items-center justify-center space-x-1"
                        >
                          <Compass className="h-3.5 w-3.5" />
                          <span>Start Tour</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(asg.id, 'COMPLETED')}
                          disabled={actionLoading === asg.id}
                          className="col-span-2 rounded-xl bg-emerald-500 hover:brightness-110 py-2.5 text-2xs font-bold text-white flex items-center justify-center space-x-1"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Complete Tour</span>
                        </button>
                      )}

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(asg.booking.pickupLocation)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-white/10 bg-slate-950/60 hover:bg-slate-950 py-2.5 text-2xs font-bold text-slate-300 flex items-center justify-center space-x-1"
                      >
                        <MapPin className="h-3.5 w-3.5 text-rose-500" />
                        <span>Google Maps</span>
                      </a>

                      <button
                        onClick={() => handleOpenChat(asg)}
                        className="rounded-xl border border-white/10 bg-slate-950/60 hover:bg-slate-950 py-2.5 text-2xs font-bold text-slate-300 flex items-center justify-center space-x-1"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-amber-500" />
                        <span>Customer Chat</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Upcoming Tours */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Upcoming Scheduled Tours</h2>
            {upcomingAssignments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs text-slate-400 bg-slate-900/40">
                No upcoming tours scheduled.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingAssignments.map(asg => (
                  <div key={asg.id} className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-3">
                    <span className="text-xs font-black text-white block">{asg.booking.package.name}</span>
                    <p className="text-2xs text-slate-400">Date: <strong>{new Date(asg.booking.travelDate).toLocaleDateString()}</strong></p>
                    <p className="text-2xs text-slate-400">Customer: <strong>{asg.booking.user.name}</strong></p>
                    <p className="text-2xs text-slate-400">Pickup: <strong>{asg.booking.pickupLocation}</strong></p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Completed Tours */}
        {activeTab === 'completed' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Completed Tours Log</h2>
            <div className="rounded-2xl border border-white/5 bg-slate-900 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-slate-400 font-semibold font-mono">
                    <th className="p-3">Invoice ID</th>
                    <th className="p-3">Customer Name</th>
                    <th className="p-3">Destination</th>
                    <th className="p-3">Completion Date</th>
                  </tr>
                </thead>
                <tbody>
                  {completedAssignments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-500 italic">
                        No completed tours logged yet.
                      </td>
                    </tr>
                  ) : (
                    completedAssignments.map(asg => (
                      <tr key={asg.id} className="border-b border-white/5 last:border-b-0 hover:bg-white/5">
                        <td className="p-3 font-mono font-bold text-amber-500">{asg.booking.invoiceId}</td>
                        <td className="p-3">{asg.booking.user.name}</td>
                        <td className="p-3">{asg.booking.package.name}</td>
                        <td className="p-3">{new Date(asg.booking.travelDate).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: Earnings */}
        {activeTab === 'earnings' && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-white/5 bg-slate-900 p-6 flex items-center justify-between">
              <div>
                <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 font-mono block">Estimated Earnings</span>
                <span className="text-2xl font-black text-amber-500">${data.stats.monthlyEarnings}</span>
              </div>
              <Award className="h-10 w-10 text-amber-500" />
            </div>

            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Tour Earnings Breakdown</h3>
            <div className="rounded-2xl border border-white/5 bg-slate-900 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-slate-400 font-semibold font-mono">
                    <th className="p-3">Invoice</th>
                    <th className="p-3">Tour Destination</th>
                    <th className="p-3">Tour Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {data.assignments.filter(a => a.status === 'COMPLETED').length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-slate-500 italic">
                        Earnings will start appearing here once your assignments are completed.
                      </td>
                    </tr>
                  ) : (
                    data.assignments.filter(a => a.status === 'COMPLETED').map(asg => (
                      <tr key={asg.id} className="border-b border-white/5 last:border-b-0">
                        <td className="p-3 font-mono font-bold">{asg.booking.invoiceId}</td>
                        <td className="p-3">{asg.booking.package.name}</td>
                        <td className="p-3 text-emerald-500 font-semibold">$500.00</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 7: Ratings & Reviews */}
        {activeTab === 'ratings' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Customer Reviews & Ratings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ratings.length === 0 ? (
                <div className="col-span-2 rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs text-slate-400 bg-slate-900/40">
                  No ratings submitted by travelers yet.
                </div>
              ) : (
                ratings.map(asg => (
                  <div key={asg.id} className="rounded-2xl border border-white/5 bg-slate-900 p-5 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white">{asg.booking.user.name}</span>
                      <div className="text-amber-500 font-bold text-2xs flex space-x-0.5">
                        <span>★</span>
                        <span>{asg.rating}</span>
                      </div>
                    </div>
                    <span className="text-4xs text-amber-500 font-semibold block font-mono uppercase">{asg.booking.package.name}</span>
                    {asg.feedback && (
                      <p className="text-xs text-slate-400 italic leading-relaxed">
                        "{asg.feedback}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 8: Profile */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-white/5 bg-slate-900 p-6 space-y-6">
              <h2 className="text-md font-bold text-white border-b border-white/5 pb-3">Tour Guide Profile Settings</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-950/40 p-4 rounded-xl border border-white/5">
                  <div>
                    <strong className="text-xs font-semibold block text-white">Availability Mode</strong>
                    <span className="text-3xs text-slate-400">Controls whether you show up for auto-assignment searches</span>
                  </div>
                  <button
                    disabled={toggleLoading}
                    onClick={handleToggleAvailability}
                    className={`flex items-center space-x-2 rounded-xl border px-4 py-2 text-2xs font-bold transition-all shadow ${
                      data.guide.availability
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }`}
                  >
                    {data.guide.availability ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                    <span>{data.guide.availability ? 'Online / Accepting Requests' : 'Offline / On Leave'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-3xs font-bold uppercase tracking-wider text-slate-400 block font-mono">Guide Name</label>
                    <input
                      type="text"
                      disabled
                      value={data.guide.name}
                      className="w-full rounded-xl bg-slate-950/80 border border-white/10 px-4 py-2.5 text-xs text-slate-400 focus:outline-none cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-3xs font-bold uppercase tracking-wider text-slate-400 block font-mono">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={data.guide.email}
                      className="w-full rounded-xl bg-slate-950/80 border border-white/10 px-4 py-2.5 text-xs text-slate-400 focus:outline-none cursor-not-allowed"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-1.5">
                    <label className="text-3xs font-bold uppercase tracking-wider text-slate-400 block font-mono">Specialized Regions</label>
                    <input
                      type="text"
                      disabled
                      value={data.guide.specialization}
                      className="w-full rounded-xl bg-slate-950/80 border border-white/10 px-4 py-2.5 text-xs text-slate-400 focus:outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 3. MOCK CUSTOMER CHAT DIALOG */}
      {activeChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-5 shadow-2xl flex flex-col h-[500px] text-xs">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-3.5 mb-3.5">
              <div className="flex items-center space-x-2.5">
                <div className="rounded-full bg-amber-500/10 p-2 text-amber-500">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{activeChat.booking.user.name}</h3>
                  <span className="text-3xs text-amber-500 font-semibold">Contact: {activeChat.booking.contactNumber}</span>
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
                        ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                        : 'bg-slate-800 text-white rounded-tl-none border border-slate-700/50'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendChat} className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 rounded-xl bg-slate-950 border border-white/10 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="rounded-xl bg-amber-500 p-2.5 text-slate-950 hover:brightness-110 shadow"
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
