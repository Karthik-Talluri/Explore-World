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
  status: 'PENDING' | 'ACCEPTED' | 'STARTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
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

  // 1. Silent automatic authentication using default guide credentials
  useEffect(() => {
    if (!token || !user || (user.role !== 'GUIDE' && user.role !== 'TOUR_GUIDE')) {
      const triggerAutoLogin = async () => {
        setLoginLoading(true);
        setLoginError(null);
        try {
          const response = await fetch(`${apiUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: 'guide@exploreworld.com', password: 'guide123' }),
          });

          const resData = await response.json();
          if (!response.ok) {
            throw new Error(resData.message || 'Auto-login failed.');
          }

          if (resData.user.role !== 'GUIDE' && resData.user.role !== 'TOUR_GUIDE') {
            throw new Error('Only Tour Guide accounts are permitted to sign in here.');
          }

          login(resData.token, resData.user);
        } catch (err: any) {
          setLoginError('Failed to automatically open tour guide portal: ' + err.message);
        } finally {
          setLoginLoading(false);
        }
      };
      triggerAutoLogin();
    }
  }, [token, user, apiUrl]);

  // 2. Fetch dashboard data when authenticated as guide
  useEffect(() => {
    if (token && user && (user.role === 'GUIDE' || user.role === 'TOUR_GUIDE')) {
      fetchDashboardData();
    }
  }, [token, user]);

  const handleLogout = () => {
    logout();
    sessionStorage.removeItem('explore_world_role');
    window.dispatchEvent(new Event('explore-world-role-changed'));
    router.push('/');
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

  const handleUpdateStatus = async (assignmentId: string, newStatus: 'ACCEPTED' | 'REJECTED' | 'STARTED' | 'COMPLETED' | 'CANCELLED', reason?: string) => {
    if (!token) return;
    setActionLoading(assignmentId);
    try {
      const res = await fetch(`${apiUrl}/api/guide/assignments/${assignmentId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus, reason }),
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

        <div className="relative w-full max-w-md space-y-8 z-10 text-center">
          
          {user && user.role !== 'GUIDE' && user.role !== 'TOUR_GUIDE' ? (
            <div className="rounded-[18px] border border-rose-500/20 p-8 shadow-2xl bg-slate-900/60 backdrop-blur-xl space-y-6 text-center">
              <ShieldAlert className="h-14 w-14 text-rose-500 mx-auto animate-pulse" />
              <div className="space-y-2">
                <h2 className="text-xl font-bold tracking-tight text-white font-sans">Guide Credentials Required</h2>
                <p className="text-xs text-slate-400 font-semibold">
                  Your current account is registered as a <strong className="text-amber-500 uppercase">{user.role}</strong>. Only Tour Guide accounts are permitted to access this portal.
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-950 shadow hover:brightness-110 transition-all duration-200"
              >
                Logout & Sign In as Guide
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center space-y-3">
                <Compass className="h-10 w-10 text-amber-500 animate-spin" />
                <div className="space-y-1.5 mt-2">
                  <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl font-sans">Tour Guide Portal</h2>
                  <p className="text-xs text-slate-400 font-semibold">Opening Tour Guide Dashboard...</p>
                </div>
              </div>

              {loginError ? (
                <div className="rounded-[18px] border border-white/10 p-6 sm:p-8 shadow-2xl bg-slate-900/60 backdrop-blur-xl space-y-4 animate-fade-in">
                  <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500 flex items-center justify-center space-x-2 font-semibold">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                  <button
                    onClick={() => {
                      setLoginError(null);
                      router.refresh();
                    }}
                    className="w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110"
                  >
                    Retry Portal Access
                  </button>
                </div>
              ) : (
                <p className="text-2xs text-slate-500 italic font-semibold">Please wait while we verify your guide session credentials.</p>
              )}

              <div className="flex justify-between items-center text-[10px] text-slate-500 px-4 pt-4 border-t border-white/5 font-semibold">
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
        <div className="w-64 border-r border-white/5 bg-slate-900/40 p-6 animate-pulse" />
        <div className="flex-grow p-8 space-y-6 animate-pulse">
          <div className="h-12 w-1/4 bg-white/5 rounded-xl" />
          <div className="h-64 bg-white/5 rounded-[18px]" />
        </div>
      </div>
    );
  }

  // RENDER PORTAL VIEW 3: Dashboard Error
  if (dashboardError || !data) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center text-white font-sans">
        <div className="rounded-[18px] bg-rose-500/5 border border-rose-500/10 p-8 max-w-md text-center space-y-4">
          <ShieldAlert className="h-10 w-10 text-rose-500 mx-auto" />
          <p className="text-sm font-semibold">Failed to load guide dashboard: {dashboardError}</p>
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

  // RENDER PORTAL VIEW 4: Authorized Guide Dashboard (Forced dark styling)
  return (
    <div className="dark bg-slate-950 text-slate-100 min-h-screen flex font-sans overflow-hidden">
      
      {/* 1. Left Sidebar Portal Navigation */}
      <aside className="w-64 shrink-0 bg-slate-900 border-r border-white/5 flex flex-col justify-between p-6">
        <div className="space-y-8">
          {/* Compass Logo Header */}
          <div className="flex items-center space-x-2 px-2">
            <Compass className="h-5.5 w-5.5 text-amber-500 animate-spin-slow" />
            <span className="font-bold text-sm tracking-wider text-white font-sans">
              Guide Console
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'dashboard' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('new-requests')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'new-requests' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Bell className="h-4.5 w-4.5" />
                <span>New Requests</span>
              </div>
              {pendingAssignments.length > 0 && (
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === 'new-requests' ? 'bg-slate-950 text-amber-500' : 'bg-amber-500 text-slate-950'
                }`}>
                  {pendingAssignments.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('assigned')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'assigned' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ClipboardCheck className="h-4.5 w-4.5" />
              <span>Assigned Tours</span>
            </button>

            <button
              onClick={() => setActiveTab('upcoming')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'upcoming' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="h-4.5 w-4.5" />
              <span>Upcoming Tours</span>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'completed' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <CheckCircle2 className="h-4.5 w-4.5" />
              <span>Completed Tours</span>
            </button>

            <button
              onClick={() => setActiveTab('earnings')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'earnings' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <DollarSign className="h-4.5 w-4.5" />
              <span>Earnings</span>
            </button>

            <button
              onClick={() => setActiveTab('ratings')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'ratings' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Star className="h-4.5 w-4.5" />
              <span>Ratings & Reviews</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
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
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-500/10 transition-all"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Logout</span>
        </button>
      </aside>

      {/* 2. Main Scrollable Workspace Panel */}
      <main className="flex-grow p-8 overflow-y-auto max-h-screen space-y-6 bg-slate-950">
        
        {/* Welcome Banner */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div>
            <h1 className="text-xl font-bold text-white font-sans">Welcome, {data.guide.name}</h1>
            <p className="text-2xs text-slate-400 font-semibold">Manage your bookings, availability, and earnings.</p>
          </div>

          {/* Availability online Switch */}
          <button
            disabled={toggleLoading}
            onClick={handleToggleAvailability}
            className={`flex items-center space-x-2 rounded-xl border px-4 py-2 text-2xs font-bold transition-all shadow ${
              data.guide.availability
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}
          >
            {data.guide.availability ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            <span>{data.guide.availability ? 'Online' : 'Offline'}</span>
          </button>
        </div>

        {/* Tab 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* KPI grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-[18px] border border-white/5 bg-slate-900 p-5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Total Bookings</span>
                <span className="text-2xl font-black text-white">{data.stats.totalAssigned}</span>
              </div>
              <div className="rounded-[18px] border border-white/5 bg-slate-900 p-5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Today's Tours</span>
                <span className="text-2xl font-black text-white">{data.stats.todayTours}</span>
              </div>
              <div className="rounded-[18px] border border-white/5 bg-slate-900 p-5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Upcoming Tours</span>
                <span className="text-2xl font-black text-white">{data.stats.upcomingTours}</span>
              </div>
              <div className="rounded-[18px] border border-white/5 bg-slate-900 p-5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Completed</span>
                <span className="text-2xl font-black text-amber-500">{data.stats.completedTours}</span>
              </div>
            </div>

            {/* Quick Profile Summary */}
            <div className="rounded-[18px] border border-white/5 bg-slate-900 p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm font-sans">Tour Guide Profile Summary</h3>
                  <p className="text-xs text-slate-400 font-semibold">{data.guide.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="border border-white/5 p-4 rounded-xl bg-slate-950/40 space-y-0.5">
                  <span className="text-slate-500 block text-[9px] font-bold font-mono uppercase">Specialized States / Destinations</span>
                  <strong className="text-slate-200">{data.guide.specialization}</strong>
                </div>
                <div className="border border-white/5 p-4 rounded-xl bg-slate-950/40 space-y-0.5">
                  <span className="text-slate-500 block text-[9px] font-bold font-mono uppercase">Average Rating Score</span>
                  <strong className="text-amber-400 flex items-center space-x-1 mt-0.5 font-bold">
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
              <div className="rounded-[18px] border border-dashed border-white/10 p-12 text-center text-xs text-slate-400 bg-slate-900/40 font-semibold">
                No new guide assignment requests pending at this time.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingAssignments.map(asg => (
                  <div key={asg.id} className="rounded-[18px] border border-white/5 bg-slate-900 p-5 space-y-4 shadow-sm hover:border-amber-500/25 transition-colors">
                    <div className="flex justify-between items-start border-b border-white/5 pb-3">
                      <div>
                        <span className="text-xs font-bold text-white block font-sans">{asg.booking.package.name}</span>
                        <span className="text-[10px] text-slate-500 block font-mono">INV: {asg.booking.invoiceId}</span>
                      </div>
                      <span className="text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-lg uppercase tracking-wider font-sans">
                        New request
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300 font-semibold">
                      <p>Customer: <strong className="text-white">{asg.booking.user.name}</strong></p>
                      <p>Travelers: <strong>{asg.booking.travelersCount} Persons</strong></p>
                      <p>Tour Date: <strong>{new Date(asg.booking.travelDate).toLocaleDateString()}</strong></p>
                      <p className="flex items-center space-x-1.5 text-[10px] border-t border-white/5 pt-2 font-bold text-slate-400">
                        <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span>Pickup Point: {asg.booking.pickupLocation}</span>
                      </p>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={() => handleUpdateStatus(asg.id, 'ACCEPTED')}
                        disabled={actionLoading === asg.id}
                        className="flex-1 rounded-xl bg-amber-500 py-2.5 text-2xs font-bold text-slate-950 shadow hover:brightness-110 transition-all"
                      >
                        Accept Request
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(asg.id, 'REJECTED')}
                        disabled={actionLoading === asg.id}
                        className="flex-1 rounded-xl border border-rose-500/20 hover:bg-rose-500/10 py-2.5 text-2xs font-bold text-rose-400 transition-all"
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
              <div className="rounded-[18px] border border-dashed border-white/10 p-12 text-center text-xs text-slate-400 bg-slate-900/40 font-semibold">
                No active bookings currently assigned to your portfolio.
              </div>
            ) : (
              <div className="space-y-4">
                {activeAssignments.map(asg => (
                  <div key={asg.id} className="rounded-[18px] border border-white/5 bg-slate-900 p-6 space-y-4 shadow-sm hover:border-amber-500/20 transition-all duration-300">
                    <div className="flex justify-between items-start border-b border-white/5 pb-3">
                      <div>
                        <span className="text-sm font-bold text-white block font-sans">{asg.booking.package.name}</span>
                        <span className="text-[10px] text-slate-500 block font-mono">Invoice Reference ID: INV-{asg.booking.invoiceId}</span>
                      </div>
                      <span className={`text-[10px] font-bold border px-2.5 py-0.5 rounded-lg ${
                        asg.status === 'STARTED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {asg.status === 'STARTED' ? 'Tour Running' : 'Assigned'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-350 font-semibold">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block font-mono">Customer Details</span>
                        <p className="font-bold text-white text-sm">{asg.booking.user.name}</p>
                        <p className="text-2xs flex items-center space-x-1.5 text-amber-400 font-bold">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span>{asg.booking.contactNumber}</span>
                        </p>
                        <p className="text-2xs flex items-center space-x-1.5 text-slate-400 font-bold">
                          <Users className="h-3.5 w-3.5 shrink-0" />
                          <span>{asg.booking.travelersCount} Persons • {asg.booking.roomType} Lodging Plan</span>
                        </p>
                      </div>

                      <div className="space-y-1 bg-slate-950/30 p-3.5 rounded-xl border border-white/5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block font-mono">Special Requests</span>
                        <p className="text-2xs text-slate-450 italic leading-relaxed">
                          {asg.booking.specialRequests || 'No special requirements listed by the traveler.'}
                        </p>
                      </div>

                      <div className="col-span-1 md:col-span-2 border-t border-white/5 pt-3 grid grid-cols-2 gap-4 text-[10px] font-bold">
                        <div className="flex items-start space-x-2">
                          <Calendar className="h-4.5 w-4.5 text-amber-450 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-500 block uppercase font-mono">Travel Date</span>
                            <strong className="text-white text-xs">{new Date(asg.booking.travelDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4.5 w-4.5 text-amber-455 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-slate-500 block uppercase font-mono">Pickup Point</span>
                            <strong className="text-white text-xs truncate block max-w-[200px]">{asg.booking.pickupLocation}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/5">
                      {asg.status === 'ACCEPTED' ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(asg.id, 'STARTED')}
                            disabled={actionLoading === asg.id}
                            className="rounded-xl bg-amber-500 hover:brightness-110 py-2.5 text-2xs font-bold text-slate-950 flex items-center justify-center space-x-1"
                          >
                            <Compass className="h-3.5 w-3.5" />
                            <span>Start Tour</span>
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt("Please enter the reason for cancellation:");
                              if (reason) handleUpdateStatus(asg.id, 'CANCELLED', reason);
                            }}
                            disabled={actionLoading === asg.id}
                            className="rounded-xl border border-rose-500/20 hover:bg-rose-500/10 py-2.5 text-2xs font-bold text-rose-400 flex items-center justify-center space-x-1"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Cancel</span>
                          </button>
                        </>
                      ) : asg.status === 'STARTED' ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(asg.id, 'COMPLETED')}
                            disabled={actionLoading === asg.id}
                            className="rounded-xl bg-emerald-500 hover:brightness-110 py-2.5 text-2xs font-bold text-white flex items-center justify-center space-x-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Complete Tour</span>
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt("Please enter the reason for cancellation:");
                              if (reason) handleUpdateStatus(asg.id, 'CANCELLED', reason);
                            }}
                            disabled={actionLoading === asg.id}
                            className="rounded-xl border border-rose-500/20 hover:bg-rose-500/10 py-2.5 text-2xs font-bold text-rose-400 flex items-center justify-center space-x-1"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Cancel</span>
                          </button>
                        </>
                      ) : (
                        <div className="col-span-2 text-xs font-semibold text-slate-500 py-2.5">
                          Status: {asg.status}
                        </div>
                      )}

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(asg.booking.pickupLocation)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-white/10 bg-slate-900 hover:bg-slate-850 py-2.5 text-2xs font-bold text-slate-300 flex items-center justify-center space-x-1.5"
                      >
                        <MapPin className="h-3.5 w-3.5 text-rose-500" />
                        <span>Pickup Map</span>
                      </a>

                      <button
                        onClick={() => handleOpenChat(asg)}
                        className="rounded-xl border border-white/10 bg-slate-900 hover:bg-slate-850 py-2.5 text-2xs font-bold text-slate-300 flex items-center justify-center space-x-1.5"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-amber-450" />
                        <span>Chat Client</span>
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
              <div className="rounded-[18px] border border-dashed border-white/10 p-12 text-center text-xs text-slate-400 bg-slate-900/40 font-semibold">
                No upcoming tours scheduled.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingAssignments.map(asg => (
                  <div key={asg.id} className="rounded-[18px] border border-white/5 bg-slate-900 p-5 space-y-3 shadow-sm">
                    <span className="text-sm font-bold text-white block font-sans">{asg.booking.package.name}</span>
                    <div className="text-xs text-slate-400 font-semibold space-y-1.5">
                      <p>Date: <strong className="text-white">{new Date(asg.booking.travelDate).toLocaleDateString()}</strong></p>
                      <p>Customer: <strong>{asg.booking.user.name}</strong></p>
                      <p>Pickup Point: <strong className="text-white">{asg.booking.pickupLocation}</strong></p>
                    </div>
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
            <div className="rounded-[18px] border border-white/5 bg-slate-900 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-slate-400 font-semibold font-mono">
                    <th className="p-4">Invoice ID</th>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Destination</th>
                    <th className="p-4">Completion Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {completedAssignments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-5 text-center text-slate-500 italic font-semibold">
                        No completed tours logged yet.
                      </td>
                    </tr>
                  ) : (
                    completedAssignments.map(asg => (
                      <tr key={asg.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-mono font-bold text-amber-400">INV-{asg.booking.invoiceId}</td>
                        <td className="p-4 font-semibold">{asg.booking.user.name}</td>
                        <td className="p-4 font-semibold text-slate-300">{asg.booking.package.name}</td>
                        <td className="p-4 text-slate-400 font-bold">{new Date(asg.booking.travelDate).toLocaleDateString()}</td>
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
            <div className="rounded-[18px] border border-white/5 bg-slate-900 p-6 flex items-center justify-between shadow-md">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">Estimated Earnings</span>
                <span className="text-2xl font-black text-amber-500">${data.stats.monthlyEarnings}</span>
              </div>
              <Award className="h-10 w-10 text-amber-500" />
            </div>

            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Tour Earnings Breakdown</h3>
            <div className="rounded-[18px] border border-white/5 bg-slate-900 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-slate-400 font-semibold font-mono">
                    <th className="p-4">Invoice</th>
                    <th className="p-4">Tour Destination</th>
                    <th className="p-4">Tour Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.assignments.filter(a => a.status === 'COMPLETED').length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-5 text-center text-slate-500 italic font-semibold">
                        Earnings will start appearing here once assignments are completed.
                      </td>
                    </tr>
                  ) : (
                    data.assignments.filter(a => a.status === 'COMPLETED').map(asg => (
                      <tr key={asg.id} className="hover:bg-white/5">
                        <td className="p-4 font-mono font-bold">INV-{asg.booking.invoiceId}</td>
                        <td className="p-4 font-semibold text-slate-300">{asg.booking.package.name}</td>
                        <td className="p-4 text-emerald-450 font-bold">$500.00</td>
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
                <div className="col-span-2 rounded-[18px] border border-dashed border-white/10 p-12 text-center text-xs text-slate-400 bg-slate-900/40 font-semibold">
                  No ratings submitted by travelers yet.
                </div>
              ) : (
                ratings.map(asg => (
                  <div key={asg.id} className="rounded-[18px] border border-white/5 bg-slate-900 p-5 space-y-2.5 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white font-sans text-xs sm:text-sm">{asg.booking.user.name}</span>
                      <div className="text-amber-400 font-bold text-xs flex items-center space-x-0.5">
                        <span>★</span>
                        <span>{asg.rating}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-amber-500 font-bold block font-mono uppercase tracking-wider">{asg.booking.package.name}</span>
                    {asg.feedback && (
                      <p className="text-xs text-slate-400 italic leading-relaxed border-t border-white/5 pt-2">
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
            <div className="rounded-[18px] border border-white/5 bg-slate-900 p-6 space-y-6">
              <h2 className="text-sm font-bold text-white border-b border-white/5 pb-3 font-sans">Profile Settings</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-950/40 p-4 rounded-xl border border-white/5">
                  <div className="space-y-0.5">
                    <strong className="text-xs font-bold block text-white font-sans">Availability Mode</strong>
                    <span className="text-[10px] text-slate-400 font-semibold">Controls whether you show up for auto-assignment searches</span>
                  </div>
                  <button
                    disabled={toggleLoading}
                    onClick={handleToggleAvailability}
                    className={`flex items-center space-x-2 rounded-xl border px-4 py-2 text-2xs font-bold transition-all shadow ${
                      data.guide.availability
                        ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {data.guide.availability ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                    <span>{data.guide.availability ? 'Online / Accepting Requests' : 'Offline / On Leave'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Guide Name</label>
                    <input
                      type="text"
                      disabled
                      value={data.guide.name}
                      className="w-full rounded-xl bg-slate-950/80 border border-white/10 px-4 py-2.5 text-xs text-slate-400 focus:outline-none cursor-not-allowed font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={data.guide.email}
                      className="w-full rounded-xl bg-slate-950/80 border border-white/10 px-4 py-2.5 text-xs text-slate-400 focus:outline-none cursor-not-allowed font-semibold"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Specialized Destinations</label>
                    <input
                      type="text"
                      disabled
                      value={data.guide.specialization}
                      className="w-full rounded-xl bg-slate-950/80 border border-white/10 px-4 py-2.5 text-xs text-slate-400 focus:outline-none cursor-not-allowed font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 3. CUSTOMER CHAT DIALOG (Modal Popover) */}
      {activeChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-5 shadow-2xl flex flex-col h-[500px] text-xs text-slate-100 font-sans">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-3.5 mb-3.5">
              <div className="flex items-center space-x-2.5">
                <div className="rounded-full bg-amber-500/10 p-2 text-amber-500">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white font-sans">{activeChat.booking.user.name}</h3>
                  <span className="text-[10px] text-amber-400 font-semibold font-mono">Contact: {activeChat.booking.contactNumber}</span>
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
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 mb-4 font-semibold">
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
                        ? 'bg-amber-500 text-slate-950 font-bold rounded-tr-none'
                        : 'bg-slate-800 text-white rounded-tl-none border border-slate-700/50'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 font-mono">{msg.time}</span>
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
                className="flex-1 rounded-xl bg-slate-950 border border-white/10 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-semibold"
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
