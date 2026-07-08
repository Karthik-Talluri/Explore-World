'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ShieldCheck, PlusCircle, AlertCircle, ShoppingBag, Eye, Trash2, Mail, LayoutGrid, CheckSquare, MessageSquare } from 'lucide-react';
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
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [guideSubTab, setGuideSubTab] = useState<'list' | 'create'>('list');
  const [guideName, setGuideName] = useState('');
  const [guideEmail, setGuideEmail] = useState('');
  const [guidePassword, setGuidePassword] = useState('');
  const [guideSpecialization, setGuideSpecialization] = useState('');
  const [guideAvailability, setGuideAvailability] = useState(true);
  const [editingGuide, setEditingGuide] = useState<TourGuide | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Forms control tabs
  const [adminTab, setAdminTab] = useState<'stats' | 'catalog' | 'reviews' | 'inquiries' | 'guides'>('stats');
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
      // Fetch packages using package search endpoint
      const res = await fetch(`${apiUrl}/api/packages/search`);
      const data = await res.json();
      if (res.ok) setPackages(data);
    } catch (err) {}
  };

  const fetchReviewsAndInquiries = async () => {
    try {
      // Fetch reviews
      const revRes = await fetch(`${apiUrl}/api/admin/reviews`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const revData = await revRes.json();
      if (revRes.ok) setReviews(revData);

      // Fetch bookings list which contains inquiries simulator or list from backend
      // We can fetch inquiries from admin reviews/bookings and mock inquiries list
      const bookingsRes = await fetch(`${apiUrl}/api/admin/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const bookingsData = await bookingsRes.json();
      
      // Simulate inquiry logs from bookings details
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

  const fetchAllBookings = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/admin/bookings`, {
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

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !destination || !price || !durationDays) return;

    try {
      // Mock itinerary JSON
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
      
      // Reset form
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
      
      // Reset form
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
      <div className="mx-auto max-w-md w-full px-4 py-32 text-center space-y-4">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 shadow-sm animate-pulse">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-2" />
          <h2 className="text-lg font-bold text-foreground">Access Forbidden</h2>
          <p className="text-xs text-slate-400">
            You do not have administrative privileges to access this area.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      
      {/* Title Header */}
      <div className="flex items-center space-x-2 border-b border-border/20 pb-4">
        <ShieldCheck className="h-7 w-7 text-secondary animate-pulse" />
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Explore World Escorted Admin Console</h1>
          <p className="text-xs text-muted-foreground">Modify tour packages, moderate customer reviews, and view inquiries.</p>
        </div>
      </div>

      {/* Tab controls */}
      <div className="flex space-x-4 border-b border-border/20 pb-3">
        {[
          { label: 'Stats overview', value: 'stats' },
          { label: 'Packages inventory', value: 'catalog' },
          { label: 'Reviews moderation', value: 'reviews' },
          { label: 'Customer Inquiries', value: 'inquiries' },
          { label: 'Tour Guides', value: 'guides' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setAdminTab(tab.value as any)}
            className={`text-2xs sm:text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-colors ${
              adminTab === tab.value ? 'border-secondary text-secondary' : 'border-transparent text-muted-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 w-full bg-muted/60 animate-pulse rounded-2xl border border-border/30" />
          ))}
        </div>
      ) : error || !stats ? (
        <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-5 text-xs text-destructive text-center">
          Failed to fetch admin stats: {error}
        </div>
      ) : (
        <>
          {/* STATS OVERVIEW TAB */}
          {adminTab === 'stats' && (
            <div className="space-y-8">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-2">
                  <span className="text-4xs font-bold uppercase tracking-wider text-muted-foreground block">Total Revenue</span>
                  <span className="text-xl font-extrabold text-foreground">${stats.summary.totalRevenue}</span>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-2">
                  <span className="text-4xs font-bold uppercase tracking-wider text-muted-foreground block">Tour Packages</span>
                  <span className="text-xl font-extrabold text-foreground">{stats.summary.totalPackages}</span>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-2">
                  <span className="text-4xs font-bold uppercase tracking-wider text-muted-foreground block">Total Bookings</span>
                  <span className="text-xl font-extrabold text-foreground">{stats.summary.totalBookings}</span>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-4xs font-bold uppercase tracking-wider text-muted-foreground block">Portfolios</span>
                    <span className="text-xs text-muted-foreground">National: {stats.summary.breakdown.national} • Int: {stats.summary.breakdown.international}</span>
                  </div>
                  
                  {/* Bar chart SVG */}
                  <svg className="w-12 h-8" viewBox="0 0 50 30">
                    <rect x="5" y={30 - Math.max(stats.summary.breakdown.national * 6, 4)} width="10" height={Math.max(stats.summary.breakdown.national * 6, 4)} fill="#0f2d59" rx="1" />
                    <rect x="25" y={30 - Math.max(stats.summary.breakdown.international * 6, 4)} width="10" height={Math.max(stats.summary.breakdown.international * 6, 4)} fill="#c5a059" rx="1" />
                  </svg>
                </div>
              </div>

              {/* Bookings log table */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground">Recent Billed Reservations</h3>
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border/80 text-muted-foreground font-semibold">
                        <th className="p-3">Invoice ID</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Package</th>
                        <th className="p-3">Travel Date</th>
                        <th className="p-3">Billed Price</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentBookings.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-muted-foreground">
                            No package bookings made on platform yet.
                          </td>
                        </tr>
                      ) : (
                        stats.recentBookings.map((b) => (
                          <tr key={b.id} className="border-b border-border/40 last:border-b-0 hover:bg-muted/20">
                            <td className="p-3 font-mono font-bold">{b.invoiceId}</td>
                            <td className="p-3">
                              <span className="font-semibold block">{b.user.name}</span>
                              <span className="text-3xs text-muted-foreground block">{b.user.email}</span>
                            </td>
                            <td className="p-3 font-semibold text-primary dark:text-secondary truncate max-w-44">{b.package.name}</td>
                            <td className="p-3">{new Date(b.travelDate).toLocaleDateString()}</td>
                            <td className="p-3 font-bold">${b.totalPrice}</td>
                            <td className="p-3">
                              <span className={`rounded px-1.5 py-0.5 text-4xs font-semibold ${
                                b.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'
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

          {/* PACKAGES INVENTORY TAB */}
          {adminTab === 'catalog' && (
            <div className="space-y-6">
              <div className="flex space-x-3 border-b border-border/20 pb-3">
                <button
                  onClick={() => setActiveForm('list')}
                  className={`text-2xs font-bold uppercase tracking-wider pb-1 border-b-2 ${
                    activeForm === 'list' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
                  }`}
                >
                  List Packages
                </button>
                <button
                  onClick={() => setActiveForm('create')}
                  className={`text-2xs font-bold uppercase tracking-wider pb-1 border-b-2 flex items-center space-x-1 ${
                    activeForm === 'create' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
                  }`}
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Create Package</span>
                </button>
              </div>

              {activeForm === 'create' ? (
                /* CREATE FORM */
                <form onSubmit={handleCreatePackage} className="glass rounded-2xl p-6 border border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs max-w-3xl">
                  <div>
                    <label className="block text-3xs font-bold uppercase text-muted-foreground mb-1">Package Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Royal Rajasthan Haveli Stay"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-foreground focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-bold uppercase text-muted-foreground mb-1">Destination Location</label>
                    <input
                      type="text"
                      required
                      placeholder="Rajasthan"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-foreground focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-bold uppercase text-muted-foreground mb-1">Category Portfolio</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-foreground focus:outline-none"
                    >
                      <option value="NATIONAL">🇮🇳 National (India)</option>
                      <option value="INTERNATIONAL">🌍 International</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-3xs font-bold uppercase text-muted-foreground mb-1">Tour Style Tag</label>
                    <select
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-foreground focus:outline-none"
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
                      <label className="block text-3xs font-bold uppercase text-muted-foreground mb-1">Price ($)</label>
                      <input
                        type="number"
                        required
                        placeholder="590"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-foreground focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-bold uppercase text-muted-foreground mb-1">Duration (Days)</label>
                      <input
                        type="number"
                        required
                        placeholder="6"
                        value={durationDays}
                        onChange={(e) => setDurationDays(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-foreground focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-3xs font-bold uppercase text-muted-foreground mb-1">Best Travel Season</label>
                    <input
                      type="text"
                      placeholder="October to March"
                      value={bestSeason}
                      onChange={(e) => setBestSeason(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-3xs font-bold uppercase text-muted-foreground mb-1">Attractions</label>
                    <input
                      type="text"
                      placeholder="Amber Fort, Hawa Mahal, City Lake"
                      value={attractions}
                      onChange={(e) => setAttractions(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-foreground focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-bold uppercase text-muted-foreground mb-1">Hotel Details</label>
                    <input
                      type="text"
                      placeholder="4 Star Heritage Resort stays"
                      value={hotelDetails}
                      onChange={(e) => setHotelDetails(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-foreground focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-bold uppercase text-muted-foreground mb-1">Meals Plan</label>
                    <input
                      type="text"
                      placeholder="Daily Buffet Breakfast & Dinner"
                      value={mealPlan}
                      onChange={(e) => setMealPlan(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-3xs font-bold uppercase text-muted-foreground mb-1">Escort Transportation</label>
                    <input
                      type="text"
                      placeholder="Private Innova transfers for sightseeing"
                      value={transportation}
                      onChange={(e) => setTransportation(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-foreground focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="sm:col-span-2 rounded-xl bg-secondary py-2.5 text-xs font-bold text-slate-950 flex items-center justify-center space-x-1 shadow hover:brightness-110"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Publish Package Listing</span>
                  </button>
                </form>
              ) : (
                /* INVENTORY LIST */
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border/80 text-muted-foreground font-semibold">
                        <th className="p-3">Tour Package Name</th>
                        <th className="p-3">Destination</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Duration</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {packages.map((p) => (
                        <tr key={p.id} className="border-b border-border/40 last:border-b-0 hover:bg-muted/20">
                          <td className="p-3 font-semibold text-foreground truncate max-w-56">{p.name}</td>
                          <td className="p-3">{p.destination} ({p.category})</td>
                          <td className="p-3 font-bold">${p.price}</td>
                          <td className="p-3 font-bold">{p.durationDays} Days</td>
                          <td className="p-3">
                            <span className={`rounded px-1.5 py-0.5 text-4xs font-bold uppercase ${
                              p.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'
                            }`}>
                              {p.active ? 'ACTIVE' : 'DISABLED'}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => handleToggleActive(p.id)}
                              className="rounded bg-accent hover:bg-muted border border-border px-2 py-1 text-3xs font-semibold"
                            >
                              Toggle Status
                            </button>
                            <button
                              onClick={() => handleDeletePackage(p.id)}
                              className="rounded bg-destructive/10 hover:bg-destructive/20 px-2 py-1 text-3xs font-bold text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5 inline" />
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
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground">Escorted Review Moderation Logs</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic text-center col-span-2 py-8">
                    No customer reviews logged on any tour package.
                  </p>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev.id} className="rounded-xl border border-border bg-card p-4 space-y-3 flex flex-col justify-between">
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-foreground">{rev.user.name}</span>
                          <span className="text-3xs text-muted-foreground">{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-3xs text-secondary font-bold truncate">Tour: {rev.package.name}</p>
                        <p className="text-muted-foreground leading-relaxed">"{rev.comment}"</p>
                      </div>
                      <div className="border-t border-border/20 pt-3 flex justify-between items-center">
                        <div className="flex space-x-0.5 text-amber-500 font-bold text-xs">
                          <span>★</span>
                          <span>{rev.rating}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="text-destructive font-semibold text-2xs hover:underline flex items-center space-x-0.5"
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
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground">Escorted Package Lead Inquiries</h3>
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border/80 text-muted-foreground font-semibold">
                      <th className="p-3">Customer</th>
                      <th className="p-3">Tour Package Interest</th>
                      <th className="p-3">Inquiry Message</th>
                      <th className="p-3">Received Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-muted-foreground">
                          No package inquiries sent by leads.
                        </td>
                      </tr>
                    ) : (
                      inquiries.map((inq) => (
                        <tr key={inq.id} className="border-b border-border/40 last:border-b-0 hover:bg-muted/20">
                          <td className="p-3">
                            <span className="font-semibold block text-foreground">{inq.name}</span>
                            <span className="text-3xs text-muted-foreground block">{inq.email}</span>
                          </td>
                          <td className="p-3 font-semibold text-primary dark:text-secondary truncate max-w-44">{inq.package.name}</td>
                          <td className="p-3 text-muted-foreground max-w-xs">{inq.message}</td>
                          <td className="p-3 text-muted-foreground">{new Date(inq.createdAt).toLocaleDateString()}</td>
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
            <div className="space-y-6">
              {/* Inner tab selectors */}
              <div className="flex space-x-3 border-b border-border/20 pb-3">
                <button
                  onClick={() => setGuideSubTab('list')}
                  className={`text-2xs font-bold uppercase tracking-wider pb-1 border-b-2 ${
                    guideSubTab === 'list' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
                  }`}
                >
                  List & Manage Guides
                </button>
                <button
                  onClick={() => setGuideSubTab('create')}
                  className={`text-2xs font-bold uppercase tracking-wider pb-1 border-b-2 flex items-center space-x-1 ${
                    guideSubTab === 'create' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
                  }`}
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Register Tour Guide</span>
                </button>
              </div>

              {guideSubTab === 'create' ? (
                /* CREATE GUIDE FORM */
                <form onSubmit={handleCreateGuide} className="glass rounded-2xl p-6 border border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs max-w-xl">
                  <div className="sm:col-span-2">
                    <h3 className="font-bold text-sm text-foreground">Register New Tour Guide</h3>
                    <p className="text-3xs text-muted-foreground">Creates a user account with role GUIDE and links their credentials.</p>
                  </div>
                  <div>
                    <label className="block text-3xs font-bold uppercase text-muted-foreground mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Alexander Guide"
                      value={guideName}
                      onChange={(e) => setGuideName(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-foreground focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-bold uppercase text-muted-foreground mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="alexander@exploreworld.com"
                      value={guideEmail}
                      onChange={(e) => setGuideEmail(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-foreground focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-bold uppercase text-muted-foreground mb-1">Security Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={guidePassword}
                      onChange={(e) => setGuidePassword(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-foreground focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-bold uppercase text-muted-foreground mb-1">Specialization (Destinations)</label>
                    <input
                      type="text"
                      required
                      placeholder="Kashmir, Rajasthan, Dubai"
                      value={guideSpecialization}
                      onChange={(e) => setGuideSpecialization(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-4 sm:col-span-2">
                    <input
                      type="checkbox"
                      id="guideAvailability"
                      checked={guideAvailability}
                      onChange={(e) => setGuideAvailability(e.target.checked)}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    />
                    <label htmlFor="guideAvailability" className="text-3xs font-bold uppercase text-muted-foreground">
                      Mark as Active & Available Immediately
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="sm:col-span-2 rounded-xl bg-secondary py-2.5 text-xs font-bold text-slate-950 flex items-center justify-center space-x-1 shadow hover:brightness-110 mt-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Create Tour Guide Account</span>
                  </button>
                </form>
              ) : (
                /* GUIDE MANAGEMENT LIST */
                <div className="space-y-8">
                  {/* Guides Table */}
                  <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-muted/40 border-b border-border/80 text-muted-foreground font-semibold">
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
                      <tbody>
                        {guides.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-4 text-center text-muted-foreground italic">
                              No tour guides registered on the platform yet.
                            </td>
                          </tr>
                        ) : (
                          guides.map((g) => (
                            <tr key={g.id} className="border-b border-border/40 last:border-b-0 hover:bg-muted/20">
                              <td className="p-3 font-semibold text-foreground">
                                {editingGuide?.id === g.id ? (
                                  <input
                                    type="text"
                                    defaultValue={g.name}
                                    onBlur={(e) => handleUpdateGuide(g.id, { name: e.target.value })}
                                    className="border border-input rounded px-2 py-0.5 max-w-28 text-foreground"
                                  />
                                ) : (
                                  g.name
                                )}
                              </td>
                              <td className="p-3">
                                {editingGuide?.id === g.id ? (
                                  <input
                                    type="email"
                                    defaultValue={g.email}
                                    onBlur={(e) => handleUpdateGuide(g.id, { email: e.target.value })}
                                    className="border border-input rounded px-2 py-0.5 max-w-36 text-foreground"
                                  />
                                ) : (
                                  g.email
                                )}
                              </td>
                              <td className="p-3 font-mono font-medium">
                                {editingGuide?.id === g.id ? (
                                  <input
                                    type="text"
                                    defaultValue={g.specialization}
                                    onBlur={(e) => handleUpdateGuide(g.id, { specialization: e.target.value })}
                                    className="border border-input rounded px-2 py-0.5 max-w-36 text-foreground"
                                  />
                                ) : (
                                  g.specialization
                                )}
                              </td>
                              <td className="p-3 text-center font-bold text-foreground">{g.stats.activeBookings}</td>
                              <td className="p-3 text-center font-bold text-amber-500">★ {g.stats.rating}</td>
                              <td className="p-3 text-center font-bold text-secondary">${g.stats.totalEarnings}</td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => handleUpdateGuide(g.id, { availability: !g.availability })}
                                  className={`rounded px-2 py-0.5 text-4xs font-bold uppercase transition-all ${
                                    g.availability ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                  }`}
                                >
                                  {g.availability ? 'Available' : 'Unavailable'}
                                </button>
                              </td>
                              <td className="p-3 text-right space-x-2">
                                <button
                                  onClick={() => setEditingGuide(editingGuide?.id === g.id ? null : g)}
                                  className="rounded bg-accent hover:bg-muted border border-border px-2.5 py-1 text-3xs font-semibold"
                                >
                                  {editingGuide?.id === g.id ? 'Done' : 'Edit'}
                                </button>
                                <button
                                  onClick={() => handleDeleteGuide(g.id)}
                                  className="rounded bg-destructive/10 hover:bg-destructive/20 px-2 py-1 text-3xs font-bold text-destructive"
                                >
                                  <Trash2 className="h-3.5 w-3.5 inline" />
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
                    <h3 className="text-sm font-bold text-foreground">Manual Tour Guide Assignment Controller</h3>
                    <p className="text-xs text-muted-foreground">Assign or reassign guides manually for all active platform bookings.</p>
                    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-muted/40 border-b border-border/80 text-muted-foreground font-semibold">
                            <th className="p-3">Invoice ID</th>
                            <th className="p-3">Traveler Details</th>
                            <th className="p-3">Tour Package Destination</th>
                            <th className="p-3">Travel Date</th>
                            <th className="p-3">Pickup Location</th>
                            <th className="p-3">Assigned Escort Guide</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allBookings.filter(b => b.status === 'CONFIRMED').length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-4 text-center text-muted-foreground italic">
                                No active package bookings available for assignment.
                              </td>
                            </tr>
                          ) : (
                            allBookings.filter(b => b.status === 'CONFIRMED').map((b) => (
                              <tr key={b.id} className="border-b border-border/40 last:border-b-0 hover:bg-muted/20">
                                <td className="p-3 font-mono font-bold">{b.invoiceId}</td>
                                <td className="p-3">
                                  <span className="font-semibold block">{b.user.name}</span>
                                  <span className="text-3xs text-muted-foreground block">{b.user.email}</span>
                                </td>
                                <td className="p-3 font-semibold text-primary dark:text-secondary">{b.package.name}</td>
                                <td className="p-3">{new Date(b.travelDate).toLocaleDateString()}</td>
                                <td className="p-3 font-semibold text-muted-foreground">{b.pickupLocation}</td>
                                <td className="p-3">
                                  <select
                                    value={b.guideAssignment?.guideId || ''}
                                    onChange={(e) => handleReassignBooking(b.id, e.target.value)}
                                    className="rounded-lg border border-input bg-background/50 px-2 py-1 text-3xs text-foreground focus:outline-none"
                                  >
                                    <option value="">-- Unassigned / None --</option>
                                    {guides.map((g) => (
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
