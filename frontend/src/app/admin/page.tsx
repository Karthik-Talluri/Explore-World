'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ShieldCheck, BarChart3, Users, Landmark, ShoppingBag, Plus, PlusCircle, AlertCircle, Trash2, Calendar, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Booking {
  id: string;
  type: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  details: any;
}

interface Stats {
  summary: {
    totalBookings: number;
    totalUsers: number;
    totalRevenue: number;
    breakdown: { flights: number; hotels: number; packages: number };
  };
  recentBookings: Booking[];
}

export default function AdminPage() {
  const { apiUrl, token, user } = useApp();
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Forms state
  const [activeForm, setActiveForm] = useState<'hotel' | 'flight' | 'coupon'>('hotel');

  // Coupon form
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState('');
  
  // Hotel form
  const [hotelName, setHotelName] = useState('');
  const [hotelLoc, setHotelLoc] = useState('');
  const [hotelPrice, setHotelPrice] = useState('');
  const [hotelDesc, setHotelDesc] = useState('');

  // Flight form
  const [flightNum, setFlightNum] = useState('');
  const [airline, setAirline] = useState('');
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [fPrice, setFPrice] = useState('');

  const fetchAdminData = async () => {
    if (!token || user?.role !== 'ADMIN') return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch admin stats');
      setStats(data);
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
        fetchAdminData();
      }
    }
  }, [token, user]);

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode || !couponDiscount) return;
    try {
      const res = await fetch(`${apiUrl}/api/admin/coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ code: couponCode, discountPercent: couponDiscount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Coupon creation failed');
      alert(`Coupon ${data.code} added successfully!`);
      setCouponCode('');
      setCouponDiscount('');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelName || !hotelLoc || !hotelPrice) return;
    try {
      const res = await fetch(`${apiUrl}/api/admin/hotels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: hotelName,
          location: hotelLoc,
          pricePerNight: hotelPrice,
          description: hotelDesc,
          images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'],
          amenities: 'Free WiFi,Swimming Pool',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Hotel creation failed');
      alert(`Hotel ${data.name} added to catalog!`);
      setHotelName('');
      setHotelLoc('');
      setHotelPrice('');
      setHotelDesc('');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flightNum || !airline || !fromCity || !toCity || !fPrice) return;
    try {
      const depDate = new Date();
      depDate.setDate(depDate.getDate() + 10); // set to depart in 10 days
      const arrDate = new Date(depDate);
      arrDate.setHours(arrDate.getHours() + 6);

      const res = await fetch(`${apiUrl}/api/admin/flights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          flightNumber: flightNum,
          airline,
          departureCity: fromCity,
          arrivalCity: toCity,
          departureTime: depDate,
          arrivalTime: arrDate,
          price: fPrice,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Flight creation failed');
      alert(`Flight ${data.flightNumber} added to catalog!`);
      setFlightNum('');
      setAirline('');
      setFromCity('');
      setToCity('');
      setFPrice('');
      fetchAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!token || user?.role !== 'ADMIN') {
    return (
      <div className="mx-auto max-w-md w-full px-4 py-32 text-center space-y-4">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 shadow-sm">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-2" />
          <h2 className="text-lg font-bold text-foreground">Access Forbidden</h2>
          <p className="text-xs text-muted-foreground">
            You do not have administrative privileges to access this area.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      
      {/* Title */}
      <div className="flex items-center space-x-2 border-b border-border/20 pb-4">
        <ShieldCheck className="h-7 w-7 text-secondary" />
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Admin Operations Panel</h1>
          <p className="text-xs text-muted-foreground">Manage inventory catalogs, view bookings, and platform revenue metrics.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 w-full bg-muted/60 animate-pulse rounded-2xl border border-border/30" />
          ))}
        </div>
      ) : error || !stats ? (
        <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-5 text-xs text-destructive text-center">
          Failed to fetch admin operations data: {error}
        </div>
      ) : (
        <>
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-2">
              <span className="text-4xs font-bold uppercase tracking-wider text-muted-foreground block">Platform Revenue</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-xl font-extrabold text-foreground">${stats.summary.totalRevenue}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-2">
              <span className="text-4xs font-bold uppercase tracking-wider text-muted-foreground block">Total Users</span>
              <span className="text-xl font-extrabold text-foreground">{stats.summary.totalUsers}</span>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-2">
              <span className="text-4xs font-bold uppercase tracking-wider text-muted-foreground block">Total Bookings</span>
              <span className="text-xl font-extrabold text-foreground">{stats.summary.totalBookings}</span>
            </div>

            {/* SVG Charts inside KPI card for premium look */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-4xs font-bold uppercase tracking-wider text-muted-foreground block">Bookings Share</span>
                <span className="text-xs text-muted-foreground">F: {stats.summary.breakdown.flights} • H: {stats.summary.breakdown.hotels} • P: {stats.summary.breakdown.packages}</span>
              </div>
              
              {/* Premium Mini SVG Bar Chart */}
              <svg className="w-16 h-10" viewBox="0 0 60 40">
                <rect x="5" y={40 - Math.max(stats.summary.breakdown.flights * 10, 5)} width="10" height={Math.max(stats.summary.breakdown.flights * 10, 5)} fill="#4f46e5" rx="2" />
                <rect x="25" y={40 - Math.max(stats.summary.breakdown.hotels * 10, 5)} width="10" height={Math.max(stats.summary.breakdown.hotels * 10, 5)} fill="#0ea5e9" rx="2" />
                <rect x="45" y={40 - Math.max(stats.summary.breakdown.packages * 10, 5)} width="10" height={Math.max(stats.summary.breakdown.packages * 10, 5)} fill="#14b8a6" rx="2" />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Recent Bookings List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-bold text-foreground">Recent Platform Bookings</h3>
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border/80 text-muted-foreground font-semibold">
                      <th className="p-3">Reference ID</th>
                      <th className="p-3">User</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Total Price</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentBookings.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-muted-foreground">
                          No bookings made on the platform yet.
                        </td>
                      </tr>
                    ) : (
                      stats.recentBookings.map((b) => (
                        <tr key={b.id} className="border-b border-border/40 last:border-b-0 hover:bg-muted/20">
                          <td className="p-3 font-mono font-bold">{b.id.substring(0, 8)}</td>
                          <td className="p-3">
                            <span className="font-semibold block">{b.user.name}</span>
                            <span className="text-3xs text-muted-foreground block">{b.user.email}</span>
                          </td>
                          <td className="p-3 font-bold text-primary">{b.type}</td>
                          <td className="p-3 font-bold">${b.totalPrice}</td>
                          <td className="p-3">
                            <span
                              className={`rounded px-1.5 py-0.5 text-4xs font-semibold ${
                                b.status === 'CONFIRMED'
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : b.status === 'CANCELLED'
                                    ? 'bg-destructive/10 text-destructive'
                                    : 'bg-amber-500/10 text-amber-500'
                              }`}
                            >
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

            {/* Catalog Management Sidebar Form */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground">Catalog Expansion</h3>
              
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                
                {/* Form selector buttons */}
                <div className="flex space-x-2 border-b border-border/20 pb-3">
                  {['hotel', 'flight', 'coupon'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveForm(tab as any)}
                      className={`text-2xs font-bold uppercase tracking-wider pb-1 border-b-2 transition-colors ${
                        activeForm === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* HOTEL FORM */}
                {activeForm === 'hotel' && (
                  <form onSubmit={handleAddHotel} className="space-y-3">
                    <div>
                      <label className="block text-3xs font-bold uppercase text-muted-foreground mb-1">Hotel Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Luxury Ritz Spa"
                        value={hotelName}
                        onChange={(e) => setHotelName(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background/50 px-2 py-1.5 text-xs text-foreground focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-bold uppercase text-muted-foreground mb-1">City Location</label>
                      <input
                        type="text"
                        required
                        placeholder="Paris"
                        value={hotelLoc}
                        onChange={(e) => setHotelLoc(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background/50 px-2 py-1.5 text-xs text-foreground focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-bold uppercase text-muted-foreground mb-1">Price Per Night ($)</label>
                      <input
                        type="number"
                        required
                        placeholder="220"
                        value={hotelPrice}
                        onChange={(e) => setHotelPrice(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background/50 px-2 py-1.5 text-xs text-foreground focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-bold uppercase text-muted-foreground mb-1">Description</label>
                      <textarea
                        placeholder="A luxury escape..."
                        value={hotelDesc}
                        onChange={(e) => setHotelDesc(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background/50 px-2 py-1.5 text-xs text-foreground focus:outline-none h-16 resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground hover:brightness-110 flex items-center justify-center space-x-1"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Add Hotel Room</span>
                    </button>
                  </form>
                )}

                {/* FLIGHT FORM */}
                {activeForm === 'flight' && (
                  <form onSubmit={handleAddFlight} className="space-y-3">
                    <div>
                      <label className="block text-3xs font-bold uppercase text-muted-foreground mb-1">Flight Number</label>
                      <input
                        type="text"
                        required
                        placeholder="DL-450"
                        value={flightNum}
                        onChange={(e) => setFlightNum(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background/50 px-2 py-1.5 text-xs text-foreground focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-bold uppercase text-muted-foreground mb-1">Airline Company</label>
                      <input
                        type="text"
                        required
                        placeholder="Delta Air Lines"
                        value={airline}
                        onChange={(e) => setAirline(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background/50 px-2 py-1.5 text-xs text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-3xs font-bold uppercase text-muted-foreground mb-1">Departure</label>
                        <input
                          type="text"
                          required
                          placeholder="NYC"
                          value={fromCity}
                          onChange={(e) => setFromCity(e.target.value)}
                          className="w-full rounded-lg border border-input bg-background/50 px-2 py-1.5 text-xs text-foreground focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-3xs font-bold uppercase text-muted-foreground mb-1">Arrival</label>
                        <input
                          type="text"
                          required
                          placeholder="PAR"
                          value={toCity}
                          onChange={(e) => setToCity(e.target.value)}
                          className="w-full rounded-lg border border-input bg-background/50 px-2 py-1.5 text-xs text-foreground focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-3xs font-bold uppercase text-muted-foreground mb-1">Ticket Price ($)</label>
                      <input
                        type="number"
                        required
                        placeholder="450"
                        value={fPrice}
                        onChange={(e) => setFPrice(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background/50 px-2 py-1.5 text-xs text-foreground focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground hover:brightness-110 flex items-center justify-center space-x-1"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Add Airline Ticket</span>
                    </button>
                  </form>
                )}

                {/* COUPON FORM */}
                {activeForm === 'coupon' && (
                  <form onSubmit={handleAddCoupon} className="space-y-3">
                    <div>
                      <label className="block text-3xs font-bold uppercase text-muted-foreground mb-1">Coupon Code</label>
                      <input
                        type="text"
                        required
                        placeholder="SUMMER30"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background/50 px-2 py-1.5 text-xs text-foreground focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs font-bold uppercase text-muted-foreground mb-1">Discount Percent (%)</label>
                      <input
                        type="number"
                        required
                        max="100"
                        placeholder="30"
                        value={couponDiscount}
                        onChange={(e) => setCouponDiscount(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background/50 px-2 py-1.5 text-xs text-foreground focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground hover:brightness-110 flex items-center justify-center space-x-1"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Create Coupon Code</span>
                    </button>
                  </form>
                )}

              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
