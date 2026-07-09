'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ShieldCheck, PlusCircle, AlertCircle, ShoppingBag, Eye, Trash2, Mail, LayoutGrid, CheckSquare, MessageSquare, Compass, BarChart } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Booking {
  id: string;
  travelDate: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  invoiceId: string;
  user: { name: string; email: string };
  package: { name: string };
  pickupLocation?: string;
  guideAssignment?: any;
}

interface Stats {
  summary: {
    totalBookings: number;
    totalUsers: number;
    totalPackages: number;
    totalRevenue: number;
    breakdown: { national: number; international: number };
  };
  recentBookings: Booking[];
}

interface TourPackage {
  id: string;
  name: string;
  category: string;
  destination: string;
  price: number;
  durationDays: number;
  active: boolean;
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  package: { name: string };
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string; email: string };
  package: { name: string };
}

interface TourGuide {
  id: string;
  userId: string;
  name: string;
  email: string;
  specialization: string;
  availability: boolean;
  status: string;
  phone?: string;
  stats: {
    activeBookings: number;
    completedTours: number;
    totalAssignments: number;
    totalEarnings: number;
    rating: number;
  };
}

export default function AdminPage() {
  const { apiUrl, token, user } = useApp();
  const router = useRouter();

  // Data states
  const [stats, setStats] = useState<Stats | null>(null);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Tour guide management states
  const [guides, setGuides] = useState<TourGuide[]>([]);
  const [travellers, setTravellers] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [guideSubTab, setGuideSubTab] = useState<'list' | 'create' | 'pending'>('list');
  const [guideName, setGuideName] = useState('');
  const [guideEmail, setGuideEmail] = useState('');
  const [guidePassword, setGuidePassword] = useState('');
  const [guideSpecialization, setGuideSpecialization] = useState('');
  const [guideAvailability, setGuideAvailability] = useState(true);
  const [editingGuide, setEditingGuide] = useState<TourGuide | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking filters state
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDestination, setFilterDestination] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterGuide, setFilterGuide] = useState('');

  // Forms control tabs
  const [adminTab, setAdminTab] = useState<'stats' | 'catalog' | 'reviews' | 'inquiries' | 'guides' | 'bookings' | 'travellers'>('stats');
  const [activeForm, setActiveForm] = useState<'create' | 'list'>('list');

  // New package Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('NATIONAL');
  const [destination, setDestination] = useState('');
  const [price, setPrice] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [bestSeason, setBestSeason] = useState('');
  const [attractions, setAttractions] = useState('');
  const [hotelDetails, setHotelDetails] = useState('');
  const [mealPlan, setMealPlan] = useState('');
  const [transportation, setTransportation] = useState('');
  const [tags, setTags] = useState('Luxury');

  const fetchAdminStats = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (err) {}
  };

  const fetchPackages = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/packages/search`);
      const data = await res.json();
      if (res.ok) setPackages(data);
    } catch (err) {}
  };

  const fetchReviewsAndInquiries = async () => {
    try {
      const revRes = await fetch(`${apiUrl}/api/admin/reviews`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const revData = await revRes.json();
      if (revRes.ok) setReviews(revData);

      const bookingsRes = await fetch(`${apiUrl}/api/admin/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const bookingsData = await bookingsRes.json();
      
      const simulatedInquiries = bookingsData.map((b: any, idx: number) => ({
        id: `inq-${idx}`,
        name: b.user.name,
        email: b.user.email,
        message: b.specialRequests || `Interested in reserving room upgrades for ${b.package.name}.`,
        createdAt: b.createdAt,
        package: { name: b.package.name }
      }));
      setInquiries(simulatedInquiries);
    } catch (err) {}
  };

  const fetchGuides = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/guides`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setGuides(data);
    } catch (err) {}
  };

  const fetchTravellers = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/travellers`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setTravellers(data);
    } catch (err) {}
  };

  const fetchAllBookings = async () => {
    try {
      const query = new URLSearchParams();
      if (filterStatus) query.append('status', filterStatus);
      if (filterDestination) query.append('destination', filterDestination);
      if (filterDate) query.append('date', filterDate);
      if (filterGuide) query.append('guideId', filterGuide);

      const res = await fetch(`${apiUrl}/api/admin/bookings?${query.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setAllBookings(data);
    } catch (err) {}
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchAdminStats(),
        fetchPackages(),
        fetchReviewsAndInquiries(),
        fetchGuides(),
        fetchTravellers(),
        fetchAllBookings()
      ]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      if (user?.role !== 'ADMIN') {
        router.push('/');
      } else {
        fetchAllData();
      }
    }
  }, [token, user]);

  useEffect(() => {
    if (token && user?.role === 'ADMIN') {
      fetchAllBookings();
    }
  }, [filterStatus, filterDestination, filterDate, filterGuide]);

  const handleCancelBookingAdmin = async (bookingId: string) => {
    const reason = prompt("Please enter the reason for cancelling this booking:");
    if (!reason) return;
    try {
      const res = await fetch(`${apiUrl}/api/admin/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        alert('Booking cancelled successfully.');
        fetchAllBookings();
        fetchAdminStats();
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Failed to cancel booking');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateGuideStatus = async (guideId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/guides/${guideId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        alert(`Guide registration status updated to ${status.toLowerCase()} successfully.`);
        fetchGuides();
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update guide status');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteTraveller = async (travellerId: string) => {
    if (!confirm('Are you sure you want to delete this traveller user account? This will remove all their records.')) return;
    try {
      const res = await fetch(`${apiUrl}/api/admin/travellers/${travellerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Traveller deleted successfully.');
        fetchTravellers();
        fetchAdminStats();
      } else {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete traveller');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !destination || !price || !durationDays) return;

    try {
      const mockItinerary = Array.from({ length: Number(durationDays) }).map((_, i) => ({
        day: i + 1,
        title: `Day ${i + 1}: Sightseeing in ${destination}`,
        description: `Full day guided tour in ${destination} visiting primary attractions.`
      }));

      const res = await fetch(`${apiUrl}/api/admin/packages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name, category, destination, price, durationDays, bestSeason, attractions,
          hotelDetails, mealPlan, transportation, itinerary: mockItinerary,
          images: ['https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600'],
          type: tags
        }),
      });

      if (!res.ok) throw new Error('Package creation failed');
      alert(`Tour package ${name} created successfully!`);
      
      setName('');
      setDestination('');
      setPrice('');
      setDurationDays('');
      setBestSeason('');
      setAttractions('');
      setHotelDetails('');
      setMealPlan('');
      setTransportation('');
      
      setActiveForm('list');
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleActive = async (pkgId: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/packages/${pkgId}/toggle`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPackages(prev =>
          prev.map(p => (p.id === pkgId ? { ...p, active: !p.active } : p))
        );
      }
    } catch (err) {}
  };

  const handleDeletePackage = async (pkgId: string) => {
    if (!confirm('Are you sure you want to permanently delete this package?')) return;
    try {
      const res = await fetch(`${apiUrl}/api/admin/packages/${pkgId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPackages(prev => prev.filter(p => p.id !== pkgId));
        fetchAdminStats();
      }
    } catch (err) {}
  };

  const handleCreateGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guideName || !guideEmail || !guidePassword || !guideSpecialization) return;

    try {
      const res = await fetch(`${apiUrl}/api/admin/guides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: guideName,
          email: guideEmail,
          password: guidePassword,
          specialization: guideSpecialization,
          availability: guideAvailability,
        }),
      });

      if (!res.ok) throw new Error('Guide creation failed');
      alert(`Tour Guide ${guideName} registered successfully!`);
      
      setGuideName('');
      setGuideEmail('');
      setGuidePassword('');
      setGuideSpecialization('');
      setGuideAvailability(true);
      setGuideSubTab('list');
      fetchGuides();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateGuide = async (guideId: string, payload: any) => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/guides/${guideId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Guide update failed');
      fetchGuides();
      setEditingGuide(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteGuide = async (guideId: string) => {
    if (!confirm('Are you sure you want to permanently delete this tour guide? The associated user account will also be deleted.')) return;
    try {
      const res = await fetch(`${apiUrl}/api/admin/guides/${guideId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Guide deletion failed');
      fetchGuides();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReassignBooking = async (bookingId: string, guideId: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/assignments/reassign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId, guideId }),
      });

      if (!res.ok) throw new Error('Manual reassignment failed');
      alert('Guide assignment updated successfully.');
      fetchAllBookings();
      fetchGuides();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteReview = async (revId: string) => {
    if (!confirm('Delete this user review?')) return;
    try {
      const res = await fetch(`${apiUrl}/api/admin/reviews/${revId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== revId));
      }
    } catch (err) {}
  };

  if (!token || user?.role !== 'ADMIN') {
    return (
      <div className="dark bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4 font-sans">
        <div className="rounded-[18px] border border-rose-500/20 bg-slate-900 p-8 max-w-sm text-center shadow-xl space-y-4">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-white font-sans">Access Forbidden</h2>
          <p className="text-xs text-slate-450 font-semibold leading-relaxed">
            You do not have administrative privileges to access this area.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark bg-slate-950 text-slate-100 min-h-screen w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in font-sans">
      
      {/* Title Header */}
      <div className="flex items-center space-x-3 border-b border-white/5 pb-4">
        <ShieldCheck className="h-7 w-7 text-amber-500 animate-pulse" />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">Admin Console Workspace</h1>
          <p className="text-2xs text-slate-400 font-semibold">Modify tour packages, moderate customer reviews, and monitor active bookings.</p>
        </div>
      </div>

      {/* Tab controls */}
      <div className="flex space-x-4 border-b border-white/5 pb-3 overflow-x-auto font-semibold">
        {[
          { label: 'Stats overview', value: 'stats' },
          { label: 'Bookings Manager', value: 'bookings' },
          { label: 'Packages inventory', value: 'catalog' },
          { label: 'Manage Travellers', value: 'travellers' },
          { label: 'Reviews moderation', value: 'reviews' },
          { label: 'Customer Inquiries', value: 'inquiries' },
          { label: 'Tour Guides', value: 'guides' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setAdminTab(tab.value as any)}
            className={`text-2xs sm:text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-all shrink-0 ${
              adminTab === tab.value ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 w-full bg-slate-900 animate-pulse rounded-[18px] border border-white/5" />
          ))}
        </div>
      ) : error || !stats ? (
        <div className="rounded-[18px] bg-rose-500/10 border border-rose-500/20 p-5 text-xs text-rose-450 text-center font-bold">
          Failed to fetch stats: {error}
        </div>
      ) : (
        <>
          {/* STATS OVERVIEW TAB */}
          {adminTab === 'stats' && (
            <div className="space-y-8 animate-fade-in">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="rounded-[18px] border border-white/5 bg-slate-900 p-5 space-y-2 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Total Revenue</span>
                  <span className="text-xl font-extrabold text-white">₹{(stats.summary.totalRevenue * 85).toLocaleString('en-IN')}</span>
                </div>
                <div className="rounded-[18px] border border-white/5 bg-slate-900 p-5 space-y-2 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Tour Packages</span>
                  <span className="text-xl font-extrabold text-white">{stats.summary.totalPackages}</span>
                </div>
                <div className="rounded-[18px] border border-white/5 bg-slate-900 p-5 space-y-2 shadow-sm">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Total Bookings</span>
                  <span className="text-xl font-extrabold text-white">{stats.summary.totalBookings}</span>
                </div>
                <div className="rounded-[18px] border border-white/5 bg-slate-900 p-5 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Portfolios</span>
                    <span className="text-[11px] text-slate-500 font-bold block mt-1">Nat: {stats.summary.breakdown.national} • Int: {stats.summary.breakdown.international}</span>
                  </div>
                  
                  {/* Bar chart SVG */}
                  <svg className="w-12 h-8 shrink-0" viewBox="0 0 50 30">
                    <rect x="5" y={30 - Math.max(stats.summary.breakdown.national * 6, 4)} width="10" height={Math.max(stats.summary.breakdown.national * 6, 4)} fill="#1E293B" rx="1" />
                    <rect x="25" y={30 - Math.max(stats.summary.breakdown.international * 6, 4)} width="10" height={Math.max(stats.summary.breakdown.international * 6, 4)} fill="#F59E0B" rx="1" />
                  </svg>
                </div>
              </div>

              {/* Payments Monitoring & Analytics Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Analytics card 1: Destination Distribution */}
                <div className="rounded-[18px] border border-white/5 bg-slate-900 p-6 shadow-sm space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-450 font-mono">Reservations by Destination</h4>
                  {allBookings.length === 0 ? (
                    <p className="text-xs text-slate-550 italic font-semibold">No bookings recorded yet.</p>
                  ) : (
                    <div className="space-y-4 pt-2 font-semibold">
                      {Object.entries(
                        allBookings.reduce((acc: any, b: any) => {
                          const dest = b.package.destination;
                          acc[dest] = (acc[dest] || 0) + 1;
                          return acc;
                        }, {})
                      )
                        .sort((a: any, b: any) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([dest, count]: any) => {
                          const percent = Math.min((count / allBookings.length) * 100, 100);
                          return (
                            <div key={dest} className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-300 font-bold">{dest}</span>
                                <span className="text-amber-500 font-mono font-bold">{count} bookings</span>
                              </div>
                              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-white/5">
                                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Analytics card 2: Payments Audit Monitor */}
                <div className="rounded-[18px] border border-white/5 bg-slate-900 p-6 shadow-sm space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-455 font-mono">Payments & Transaction Monitor</h4>
                  <div className="space-y-3.5 pt-2 text-xs font-semibold">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Total Funds Collected</span>
                      <span className="font-bold text-emerald-400">
                        ₹{(allBookings.filter(b => b.paymentStatus === 'PAID').reduce((sum, b) => sum + b.totalPrice, 0)).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Pending Payments Value</span>
                      <span className="font-bold text-amber-500">
                        ₹{(allBookings.filter(b => b.paymentStatus === 'PENDING').reduce((sum, b) => sum + b.totalPrice, 0)).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Refunded / Cancelled Value</span>
                      <span className="font-bold text-rose-455">
                        ₹{(allBookings.filter(b => b.status === 'CANCELLED').reduce((sum, b) => sum + b.totalPrice, 0)).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 font-bold">
                      <span className="text-white">Active Payment Ratio</span>
                      <span className="text-amber-500">
                        {allBookings.length > 0
                          ? `${((allBookings.filter(b => b.paymentStatus === 'PAID').length / allBookings.length) * 100).toFixed(0)}% Successful`
                          : '100%'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Analytics card 3: Platform Staffing Overview */}
                <div className="rounded-[18px] border border-white/5 bg-slate-900 p-6 shadow-sm space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-455 font-mono">Platform Directory Overview</h4>
                  <div className="space-y-3.5 pt-2 text-xs font-semibold">
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Total Registered Travelers</span>
                      <span className="font-bold text-white">{travellers.length} accounts</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Active Approved Guides</span>
                      <span className="font-bold text-white">
                        {guides.filter(g => g.status === 'APPROVED').length} guides
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Online Available Guides</span>
                      <span className="font-bold text-emerald-400">
                        {guides.filter(g => g.status === 'APPROVED' && g.availability).length} online
                      </span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-400 font-semibold">Pending Applications</span>
                      <span className={`font-bold ${guides.filter(g => g.status === 'PENDING').length > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`}>
                        {guides.filter(g => g.status === 'PENDING').length} applications
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Bookings log table */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white font-sans">Recent Billed Reservations</h3>
                <div className="rounded-[18px] border border-white/5 bg-slate-900 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10 text-slate-400 font-semibold font-mono">
                        <th className="p-3">Invoice ID</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Package</th>
                        <th className="p-3">Travel Date</th>
                        <th className="p-3">Billed Price</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {stats.recentBookings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-slate-550 italic font-semibold">
                            No package bookings made on platform yet.
                          </td>
                        </tr>
                      ) : (
                        stats.recentBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-white/5">
                            <td className="p-3 font-mono font-bold text-amber-500">INV-{b.invoiceId}</td>
                            <td className="p-3">
                              <span className="font-semibold block">{b.user.name}</span>
                              <span className="text-[10px] text-slate-500 block font-mono">{b.user.email}</span>
                            </td>
                            <td className="p-3 font-semibold text-slate-350 truncate max-w-44">{b.package.name}</td>
                            <td className="p-3 text-slate-400">{new Date(b.travelDate).toLocaleDateString()}</td>
                            <td className="p-3 font-bold text-white">₹{b.totalPrice.toLocaleString('en-IN')}</td>
                            <td className="p-3">
                              <span className={`rounded px-2.5 py-0.5 text-[9px] font-bold ${
                                b.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                              }`}>
                                {b.status}
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
          )}

          {/* TRAVELLERS MANAGER TAB */}
          {adminTab === 'travellers' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-white font-sans">Manage Registered Travellers</h3>
                <p className="text-2xs text-slate-400 font-semibold">List user profile data and billing totals for active customer accounts.</p>
              </div>

              <div className="rounded-[18px] border border-white/5 bg-slate-900 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-slate-400 font-semibold font-mono">
                      <th className="p-4">Traveller Name</th>
                      <th className="p-4">Email Address</th>
                      <th className="p-4">Signed Up Date</th>
                      <th className="p-4 text-center">Total Bookings</th>
                      <th className="p-4 text-center">Total Spent</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {travellers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-5 text-center text-slate-500 italic font-semibold">
                          No travellers registered on the platform yet.
                        </td>
                      </tr>
                    ) : (
                      travellers.map((t) => (
                        <tr key={t.id} className="hover:bg-white/5">
                          <td className="p-4 font-bold text-white font-sans">{t.name}</td>
                          <td className="p-4 text-slate-350">{t.email}</td>
                          <td className="p-4 text-slate-450">{new Date(t.createdAt).toLocaleDateString()}</td>
                          <td className="p-4 text-center font-bold text-white">{t.bookingsCount}</td>
                          <td className="p-4 text-center font-bold text-amber-500">₹{(t.totalSpent * 85).toLocaleString('en-IN')}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteTraveller(t.id)}
                              className="rounded-xl bg-rose-500/10 hover:bg-rose-500/20 px-3.5 py-1.5 text-2xs font-bold text-rose-400 transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5 inline mr-1" />
                              Delete Account
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BOOKINGS MANAGER TAB */}
          {adminTab === 'bookings' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-sm font-bold text-white font-sans">Filter & Manage Booking Reservations</h3>
                <button
                  onClick={() => {
                    setFilterStatus('');
                    setFilterDestination('');
                    setFilterDate('');
                    setFilterGuide('');
                  }}
                  className="text-2xs text-amber-500 font-bold hover:underline"
                >
                  Clear All Filters
                </button>
              </div>

              {/* Filters Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-900 p-5 rounded-[18px] border border-white/5 text-xs font-semibold text-slate-400">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Destination</label>
                  <input
                    type="text"
                    placeholder="Search destination..."
                    value={filterDestination}
                    onChange={(e) => setFilterDestination(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Travel Date</label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-white focus:outline-none focus:border-amber-500/50 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Assigned Guide</label>
                  <select
                    value={filterGuide}
                    onChange={(e) => setFilterGuide(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/50 font-semibold"
                  >
                    <option value="">All Guides</option>
                    {guides.filter(g => g.status === 'APPROVED').map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1">Booking Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/50 font-semibold"
                  >
                    <option value="">All Statuses</option>
                    <option value="Waiting for Guide Acceptance">Awaiting Guide</option>
                    <option value="Guide Accepted">Guide Accepted</option>
                    <option value="Tour Started">Tour Started</option>
                    <option value="Tour Completed">Tour Completed</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              {/* Bookings Table */}
              <div className="rounded-[18px] border border-white/5 bg-slate-900 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-slate-400 font-semibold font-mono">
                      <th className="p-3">Invoice ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Package Destination</th>
                      <th className="p-3">Travel Date</th>
                      <th className="p-3">Assigned Guide</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-5 text-center text-slate-500 italic font-semibold">
                          No bookings found matching selected filters.
                        </td>
                      </tr>
                    ) : (
                      allBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-white/5">
                          <td className="p-3 font-mono font-bold text-amber-500">INV-{b.invoiceId}</td>
                          <td className="p-3">
                            <span className="font-bold text-white block font-sans">{b.user.name}</span>
                            <span className="text-[10px] text-slate-550 block font-mono">{b.user.email}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-slate-300 block">{b.package.name}</span>
                            <span className="text-[10px] text-slate-550 block">{b.package.destination}</span>
                          </td>
                          <td className="p-3 text-slate-400">{new Date(b.travelDate).toLocaleDateString()}</td>
                          <td className="p-3">
                            <select
                              disabled={b.status === 'CANCELLED' || b.status === 'Tour Completed'}
                              value={b.guideAssignment?.guideId || ''}
                              onChange={(e) => handleReassignBooking(b.id, e.target.value)}
                              className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-[10px] text-white focus:outline-none disabled:opacity-50 font-sans font-semibold"
                            >
                              <option value="">-- Unassigned --</option>
                              {guides.filter(g => g.status === 'APPROVED').map((g) => (
                                <option key={g.id} value={g.id}>
                                  {g.name} ({g.specialization})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3">
                            <span className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase ${
                              b.status === 'Tour Completed'
                                ? 'bg-slate-500/10 text-slate-450 border border-slate-500/10'
                                : b.status === 'Tour Started'
                                ? 'bg-indigo-500/10 text-indigo-400'
                                : b.status === 'Guide Accepted'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : b.status === 'CANCELLED'
                                ? 'bg-rose-500/10 text-rose-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              {b.status === 'Waiting for Guide Acceptance' ? 'Awaiting Guide' : b.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {b.status !== 'CANCELLED' && b.status !== 'Tour Completed' && (
                              <button
                                onClick={() => handleCancelBookingAdmin(b.id)}
                                className="rounded-xl bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 text-2xs font-bold text-rose-450"
                              >
                                Cancel Tour
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PACKAGES INVENTORY TAB */}
          {adminTab === 'catalog' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex space-x-3 border-b border-white/5 pb-3 font-semibold">
                <button
                  onClick={() => setActiveForm('list')}
                  className={`text-2xs font-bold uppercase tracking-wider pb-1 border-b-2 ${
                    activeForm === 'list' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:text-white'
                  }`}
                >
                  List Packages
                </button>
                <button
                  onClick={() => setActiveForm('create')}
                  className={`text-2xs font-bold uppercase tracking-wider pb-1 border-b-2 flex items-center space-x-1.5 ${
                    activeForm === 'create' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:text-white'
                  }`}
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Create Package</span>
                </button>
              </div>

              {activeForm === 'create' ? (
                /* CREATE FORM */
                <form onSubmit={handleCreatePackage} className="bg-slate-900 rounded-[18px] p-6 border border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs max-w-3xl font-semibold text-slate-400">
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1">Package Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Royal Kashmir Escorted Getaway"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1">Destination Location</label>
                    <input
                      type="text"
                      required
                      placeholder="Kashmir"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1">Category Portfolio</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-white focus:outline-none font-semibold"
                    >
                      <option value="NATIONAL">🇮🇳 National (India)</option>
                      <option value="INTERNATIONAL">🌍 International</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1">Tour Style Tag</label>
                    <select
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-white focus:outline-none font-semibold"
                    >
                      <option value="Luxury">Luxury</option>
                      <option value="Honeymoon">Honeymoon</option>
                      <option value="Adventure">Adventure</option>
                      <option value="Family">Family</option>
                      <option value="Solo">Solo</option>
                      <option value="Group">Group</option>
                      <option value="Budget">Budget</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase mb-1">Base Price ($)</label>
                      <input
                        type="number"
                        required
                        placeholder="590"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase mb-1">Duration (Days)</label>
                      <input
                        type="number"
                        required
                        placeholder="6"
                        value={durationDays}
                        onChange={(e) => setDurationDays(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none font-semibold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1">Best Travel Season</label>
                    <input
                      type="text"
                      placeholder="October to March"
                      value={bestSeason}
                      onChange={(e) => setBestSeason(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-955 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none font-semibold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase mb-1">Attractions Attractions</label>
                    <input
                      type="text"
                      placeholder="Gulmarg Valley, Shalimar Bagh, Dal Lake"
                      value={attractions}
                      onChange={(e) => setAttractions(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-955 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1">Hotel Accommodations</label>
                    <input
                      type="text"
                      placeholder="4 Star luxury lakeview cottages"
                      value={hotelDetails}
                      onChange={(e) => setHotelDetails(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-955 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1">Meal Plans Details</label>
                    <input
                      type="text"
                      placeholder="Daily Buffet Breakfast & Dinner"
                      value={mealPlan}
                      onChange={(e) => setMealPlan(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-955 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none font-semibold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase mb-1">Escort Transportation</label>
                    <input
                      type="text"
                      placeholder="Private Innova transfers for sightseeing"
                      value={transportation}
                      onChange={(e) => setTransportation(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-955 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none font-semibold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="sm:col-span-2 rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-955 flex items-center justify-center space-x-1.5 shadow hover:brightness-110 mt-2 font-sans"
                  >
                    <PlusCircle className="h-4.5 w-4.5" />
                    <span>Publish Package Listing</span>
                  </button>
                </form>
              ) : (
                /* INVENTORY LIST */
                <div className="rounded-[18px] border border-white/5 bg-slate-900 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10 text-slate-400 font-semibold font-mono">
                        <th className="p-3">Tour Package Name</th>
                        <th className="p-3">Destination</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Duration</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {packages.map((p) => (
                        <tr key={p.id} className="hover:bg-white/5">
                          <td className="p-3 font-bold text-white truncate max-w-56 font-sans">{p.name}</td>
                          <td className="p-3 font-semibold text-slate-350">{p.destination} ({p.category})</td>
                          <td className="p-3 font-bold text-amber-500">₹{(p.price * 85).toLocaleString('en-IN')}</td>
                          <td className="p-3 font-bold text-slate-400">{p.durationDays} Days</td>
                          <td className="p-3">
                            <span className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase ${
                              p.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-950 text-slate-500'
                            }`}>
                              {p.active ? 'ACTIVE' : 'DISABLED'}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => handleToggleActive(p.id)}
                              className="rounded-xl border border-white/10 bg-slate-950 hover:bg-slate-900 px-3 py-1.5 text-2xs font-bold"
                            >
                              Toggle
                            </button>
                            <button
                              onClick={() => handleDeletePackage(p.id)}
                              className="rounded-xl bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 text-2xs font-bold text-rose-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* REVIEWS MODERATION TAB */}
          {adminTab === 'reviews' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-white font-sans">Escorted Review Moderation Logs</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center col-span-2 py-8 font-semibold">
                    No customer reviews logged on any tour package.
                  </p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="rounded-[18px] border border-white/5 bg-slate-900 p-5 space-y-3.5 flex flex-col justify-between shadow-sm">
                      <div className="space-y-1.5 text-xs font-semibold">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white font-sans">{rev.user.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Tour: {rev.package.name}</p>
                        <p className="text-slate-400 italic leading-relaxed">"{rev.comment}"</p>
                      </div>
                      <div className="border-t border-white/5 pt-3.5 flex justify-between items-center">
                        <div className="flex space-x-0.5 text-amber-400 font-bold text-xs">
                          <span>★</span>
                          <span>{rev.rating}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="text-rose-400 font-bold text-2xs hover:underline flex items-center space-x-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete Review</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* INQUIRIES TAB */}
          {adminTab === 'inquiries' && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold text-white font-sans">Escorted Package Lead Inquiries</h3>
              <div className="rounded-[18px] border border-white/5 bg-slate-900 overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10 text-slate-400 font-semibold font-mono">
                      <th className="p-4">Customer</th>
                      <th className="p-4">Tour Package Interest</th>
                      <th className="p-4">Inquiry Message</th>
                      <th className="p-4">Received Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {inquiries.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-5 text-center text-slate-500 italic font-semibold">
                          No package inquiries sent by leads.
                        </td>
                      </tr>
                    ) : (
                      inquiries.map((inq) => (
                        <tr key={inq.id} className="hover:bg-white/5">
                          <td className="p-4">
                            <span className="font-bold text-white block font-sans">{inq.name}</span>
                            <span className="text-[10px] text-slate-500 block font-mono">{inq.email}</span>
                          </td>
                          <td className="p-4 font-bold text-amber-500 truncate max-w-44">{inq.package.name}</td>
                          <td className="p-4 text-slate-400 font-semibold max-w-xs">{inq.message}</td>
                          <td className="p-4 text-slate-450">{new Date(inq.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TOUR GUIDES TAB */}
          {adminTab === 'guides' && (
            <div className="space-y-6 animate-fade-in">
              {/* Inner tab selectors */}
              <div className="flex space-x-3 border-b border-white/5 pb-3 font-semibold">
                <button
                  onClick={() => setGuideSubTab('list')}
                  className={`text-2xs font-bold uppercase tracking-wider pb-1 border-b-2 ${
                    guideSubTab === 'list' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:text-white'
                  }`}
                >
                  List & Manage Guides
                </button>
                <button
                  onClick={() => setGuideSubTab('create')}
                  className={`text-2xs font-bold uppercase tracking-wider pb-1 border-b-2 flex items-center space-x-1.5 ${
                    guideSubTab === 'create' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:text-white'
                  }`}
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Register Tour Guide</span>
                </button>
                <button
                  onClick={() => setGuideSubTab('pending')}
                  className={`text-2xs font-bold uppercase tracking-wider pb-1 border-b-2 flex items-center space-x-1.5 ${
                    guideSubTab === 'pending' ? 'border-amber-500 text-amber-500' : 'border-transparent text-slate-500 hover:text-white'
                  }`}
                >
                  <span>Pending Registrations</span>
                  {guides.filter(g => g.status === 'PENDING').length > 0 && (
                    <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-slate-950 font-mono">
                      {guides.filter(g => g.status === 'PENDING').length}
                    </span>
                  )}
                </button>
              </div>

              {guideSubTab === 'create' ? (
                /* CREATE GUIDE FORM */
                <form onSubmit={handleCreateGuide} className="bg-slate-900 rounded-[18px] p-6 border border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs max-w-xl font-semibold text-slate-450">
                  <div className="sm:col-span-2 space-y-1">
                    <h3 className="font-bold text-sm text-white font-sans">Register New Tour Guide</h3>
                    <p className="text-[10px] text-slate-500">Creates a user account with role GUIDE and links credentials.</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Alexander Guide"
                      value={guideName}
                      onChange={(e) => setGuideName(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="alexander@exploreworld.com"
                      value={guideEmail}
                      onChange={(e) => setGuideEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1">Security Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={guidePassword}
                      onChange={(e) => setGuidePassword(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-955 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-1">Specialization (Destinations)</label>
                    <input
                      type="text"
                      required
                      placeholder="Kashmir, Rajasthan, Dubai"
                      value={guideSpecialization}
                      onChange={(e) => setGuideSpecialization(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-955 px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-4 sm:col-span-2">
                    <input
                      type="checkbox"
                      id="guideAvailability"
                      checked={guideAvailability}
                      onChange={(e) => setGuideAvailability(e.target.checked)}
                      className="h-4 w-4 rounded border-white/10 text-amber-500 bg-slate-955 focus:ring-amber-500/50"
                    />
                    <label htmlFor="guideAvailability" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Mark as Active & Available Immediately
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="sm:col-span-2 rounded-xl bg-amber-500 py-3 text-xs font-bold text-slate-955 flex items-center justify-center space-x-1.5 shadow hover:brightness-110 mt-2 font-sans"
                  >
                    <PlusCircle className="h-4.5 w-4.5" />
                    <span>Create Tour Guide Account</span>
                  </button>
                </form>
              ) : guideSubTab === 'pending' ? (
                /* PENDING REGISTRATIONS LIST */
                <div className="space-y-4 animate-fade-in">
                  <div className="rounded-[18px] border border-white/5 bg-slate-900 overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/10 text-slate-400 font-semibold font-mono">
                          <th className="p-3">Tour Guide Name</th>
                          <th className="p-3">Email Address</th>
                          <th className="p-3">Specializations</th>
                          <th className="p-3">Contact Phone</th>
                          <th className="p-3 text-center">Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {guides.filter(g => g.status === 'PENDING').length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-5 text-center text-slate-500 italic font-semibold">
                              No pending guide registrations to moderate.
                            </td>
                          </tr>
                        ) : (
                          guides.filter(g => g.status === 'PENDING').map((g) => (
                            <tr key={g.id} className="hover:bg-white/5">
                              <td className="p-3 font-bold text-white font-sans">{g.name}</td>
                              <td className="p-3 text-slate-350">{g.email}</td>
                              <td className="p-3 font-mono font-bold text-amber-500">{g.specialization}</td>
                              <td className="p-3 font-mono text-slate-400">{g.phone || '+91 98765 43210'}</td>
                              <td className="p-3 text-center">
                                <span className="rounded bg-amber-500/10 text-amber-400 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                                  PENDING REVIEW
                                </span>
                              </td>
                              <td className="p-3 text-right space-x-2">
                                <button
                                  onClick={() => handleUpdateGuideStatus(g.id, 'APPROVED')}
                                  className="rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 px-3.5 py-1.5 text-2xs font-bold transition-all"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleUpdateGuideStatus(g.id, 'REJECTED')}
                                  className="rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 px-3.5 py-1.5 text-2xs font-bold transition-all"
                                >
                                  Reject
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* GUIDE MANAGEMENT LIST */
                <div className="space-y-8 animate-fade-in font-semibold text-slate-350">
                  {/* Guides Table */}
                  <div className="rounded-[18px] border border-white/5 bg-slate-900 overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/10 text-slate-400 font-semibold font-mono">
                          <th className="p-3">Tour Guide Name</th>
                          <th className="p-3">Email Address</th>
                          <th className="p-3">Specializations</th>
                          <th className="p-3 text-center">Active Bookings</th>
                          <th className="p-3 text-center">Avg Rating</th>
                          <th className="p-3 text-center">Earnings</th>
                          <th className="p-3 text-center">Availability</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {guides.filter(g => g.status === 'APPROVED').length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-5 text-center text-slate-500 italic font-semibold">
                              No approved tour guides registered on the platform yet.
                            </td>
                          </tr>
                        ) : (
                          guides.filter(g => g.status === 'APPROVED').map((g) => (
                            <tr key={g.id} className="hover:bg-white/5">
                              <td className="p-3 font-bold text-white font-sans">
                                {editingGuide?.id === g.id ? (
                                  <input
                                    type="text"
                                    defaultValue={g.name}
                                    onBlur={(e) => handleUpdateGuide(g.id, { name: e.target.value })}
                                    className="border border-white/10 bg-slate-950 rounded px-2.5 py-1 max-w-28 text-white focus:outline-none"
                                  />
                                ) : (
                                  g.name
                                )}
                              </td>
                              <td className="p-3 text-slate-350">
                                {editingGuide?.id === g.id ? (
                                  <input
                                    type="email"
                                    defaultValue={g.email}
                                    onBlur={(e) => handleUpdateGuide(g.id, { email: e.target.value })}
                                    className="border border-white/10 bg-slate-955 rounded px-2.5 py-1 max-w-36 text-white focus:outline-none"
                                  />
                                ) : (
                                  g.email
                                )}
                              </td>
                              <td className="p-3 font-mono font-bold text-amber-500">
                                {editingGuide?.id === g.id ? (
                                  <input
                                    type="text"
                                    defaultValue={g.specialization}
                                    onBlur={(e) => handleUpdateGuide(g.id, { specialization: e.target.value })}
                                    className="border border-white/10 bg-slate-955 rounded px-2.5 py-1 max-w-36 text-white focus:outline-none"
                                  />
                                ) : (
                                  g.specialization
                                )}
                              </td>
                              <td className="p-3 text-center font-bold text-white">{g.stats.activeBookings}</td>
                              <td className="p-3 text-center font-bold text-amber-500">★ {g.stats.rating}</td>
                              <td className="p-3 text-center font-bold text-emerald-450">${g.stats.totalEarnings}</td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => handleUpdateGuide(g.id, { availability: !g.availability })}
                                  className={`rounded-xl px-2.5 py-1 text-[9px] font-bold uppercase transition-all ${
                                    g.availability ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-slate-950 text-slate-500'
                                  }`}
                                >
                                  {g.availability ? 'Available' : 'Unavailable'}
                                </button>
                              </td>
                              <td className="p-3 text-right space-x-2">
                                <button
                                  onClick={() => setEditingGuide(editingGuide?.id === g.id ? null : g)}
                                  className="rounded-xl border border-white/10 bg-slate-950 hover:bg-slate-900 px-3.5 py-1.5 text-2xs font-bold text-slate-300"
                                >
                                  {editingGuide?.id === g.id ? 'Done' : 'Edit'}
                                </button>
                                <button
                                  onClick={() => handleDeleteGuide(g.id)}
                                  className="rounded-xl bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 text-2xs font-bold text-rose-400"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Manual Assignment Management Panel */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white font-sans">Manual Tour Guide Assignment Controller</h3>
                    <p className="text-2xs text-slate-400">Assign or reassign guides manually for all active platform bookings.</p>
                    <div className="rounded-[18px] border border-white/5 bg-slate-900 overflow-hidden shadow-sm">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-white/5 border-b border-white/10 text-slate-400 font-semibold font-mono">
                            <th className="p-3">Invoice ID</th>
                            <th className="p-3">Traveler Details</th>
                            <th className="p-3">Tour Package Destination</th>
                            <th className="p-3">Travel Date</th>
                            <th className="p-3">Pickup Location</th>
                            <th className="p-3">Assigned Escort Guide</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {allBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'Waiting for Guide Acceptance').length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-5 text-center text-slate-500 italic font-semibold">
                                No active package bookings available for assignment.
                              </td>
                            </tr>
                          ) : (
                            allBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'Waiting for Guide Acceptance').map((b) => (
                              <tr key={b.id} className="hover:bg-white/5">
                                <td className="p-3 font-mono font-bold text-amber-500">INV-{b.invoiceId}</td>
                                <td className="p-3">
                                  <span className="font-bold text-white block font-sans">{b.user.name}</span>
                                  <span className="text-[10px] text-slate-550 block font-mono">{b.user.email}</span>
                                </td>
                                <td className="p-3 font-bold text-slate-300">{b.package.name}</td>
                                <td className="p-3 text-slate-400">{new Date(b.travelDate).toLocaleDateString()}</td>
                                <td className="p-3 text-slate-400 font-bold">{b.pickupLocation}</td>
                                <td className="p-3">
                                  <select
                                    value={b.guideAssignment?.guideId || ''}
                                    onChange={(e) => handleReassignBooking(b.id, e.target.value)}
                                    className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-[10px] text-white focus:outline-none font-sans font-bold"
                                  >
                                    <option value="">-- Unassigned / None --</option>
                                    {guides.filter(g => g.status === 'APPROVED').map((g) => (
                                      <option key={g.id} value={g.id}>
                                        {g.name} ({g.specialization})
                                      </option>
                                    ))}
                                  </select>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

        </>
      )}

    </div>
  );
}
