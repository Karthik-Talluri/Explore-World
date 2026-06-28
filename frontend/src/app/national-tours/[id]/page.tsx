'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Palmtree, MapPin, Calendar, Clock, Star, Landmark, Send, CheckCircle2, XCircle, ShieldCheck, Mail, Compass, Car } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import CheckoutModal from '@/components/CheckoutModal';
import Link from 'next/link';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string };
}

interface ItineraryDay {
  day: number;
  title: string;
  description: string;
}

interface TourPackage {
  id: string;
  name: string;
  category: string;
  destination: string;
  price: number;
  durationDays: number;
  bestSeason: string;
  attractions: string;
  hotelDetails: string;
  mealPlan: string;
  transportation: string;
  itinerary: ItineraryDay[];
  visaRequirement: string;
  currency: string;
  weather: string;
  inclusions: string;
  exclusions: string;
  rating: number;
  availableDates: string[];
  images: string[];
  type: string;
  reviews: Review[];
}

export default function NationalTourDetailPage() {
  const { id } = useParams();
  const { apiUrl, token, setActiveBooking } = useApp();

  const [pkg, setPkg] = useState<TourPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs & Accordions
  const [activeTab, setActiveTab] = useState<'itinerary' | 'hotel' | 'reviews'>('itinerary');
  const [openItineraryDay, setOpenItineraryDay] = useState<number | null>(1);

  // Inquiry Form
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Review Form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/api/packages/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load details');
      setPkg(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryEmail || !inquiryMsg) return;

    setInquiryLoading(true);
    setInquirySuccess(false);
    try {
      const res = await fetch(`${apiUrl}/api/packages/${id}/inquire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: inquiryName, email: inquiryEmail, message: inquiryMsg }),
      });
      if (!res.ok) throw new Error('Inquiry submission failed');
      setInquirySuccess(true);
      setInquiryName('');
      setInquiryEmail('');
      setInquiryMsg('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setInquiryLoading(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setIsAuthOpen(true);
      return;
    }
    if (!reviewComment.trim() || !pkg) return;

    setReviewLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/packages/${pkg.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Review post failed');

      const updatedReviews = [data, ...(pkg.reviews || [])];
      setPkg({
        ...pkg,
        reviews: updatedReviews,
        rating: Number(
          (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1)
        ),
      });
      setReviewComment('');
      alert('Review posted successfully!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!token) {
      setIsAuthOpen(true);
      return;
    }
    if (!pkg) return;
    setActiveBooking({
      packageId: pkg.id,
      name: pkg.name,
      price: pkg.price,
      availableDates: pkg.availableDates,
    });
    setIsCheckoutOpen(true);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 text-center space-y-4 bg-slate-950 text-slate-100 min-h-screen">
        <Compass className="h-10 w-10 text-secondary animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading tour itinerary...</p>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="mx-auto max-w-md px-4 py-32 text-center bg-slate-950 text-slate-100 min-h-screen">
        <div className="rounded-2xl bg-rose-950/20 border border-rose-500/30 p-6">
          <h4 className="font-bold text-white">Tour Detail Error</h4>
          <p className="text-xs text-slate-400">{error || 'Unable to load tour details'}</p>
          <Link href="/national-tours" className="text-xs text-secondary font-bold hover:underline block mt-3">
            Back to National Packages
          </Link>
        </div>
      </div>
    );
  }

  const heroImg = pkg.images[0] || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200';

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      
      {/* Hero Banner */}
      <section className="relative h-80 sm:h-[480px] w-full bg-slate-900 overflow-hidden pt-20">
        <img
          src={heroImg}
          alt={pkg.name}
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/80" />
        
        {/* Banner Details */}
        <div className="absolute bottom-6 left-4 right-4 max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="space-y-2">
            <span className="rounded bg-secondary px-3 py-1 text-4xs font-bold text-slate-950 uppercase tracking-widest">
              🇮🇳 Indian State Tour • {pkg.type}
            </span>
            <h1 className="text-xl sm:text-4xl font-black text-white">{pkg.name}</h1>
            <p className="text-xs text-slate-300 flex items-center space-x-1">
              <MapPin className="h-3.5 w-3.5 text-secondary" />
              <span>State Location: {pkg.destination}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-white/10">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>{pkg.rating.toFixed(1)} Rating</span>
          </div>
        </div>
      </section>

      {/* QUICK FACTS BAR */}
      <section className="bg-slate-900/40 border-b border-secondary/10 py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <Clock className="h-5 w-5 text-secondary mx-auto mb-1" />
            <span className="text-4xs text-slate-400 uppercase font-bold">Duration</span>
            <span className="text-xs font-bold block">{pkg.durationDays} Days / {pkg.durationDays - 1} Nights</span>
          </div>
          <div>
            <Calendar className="h-5 w-5 text-secondary mx-auto mb-1" />
            <span className="text-4xs text-slate-400 uppercase font-bold">Best Season</span>
            <span className="text-xs font-bold block">{pkg.bestSeason}</span>
          </div>
          <div>
            <ShieldCheck className="h-5 w-5 text-secondary mx-auto mb-1" />
            <span className="text-4xs text-slate-400 uppercase font-bold">State Permits</span>
            <span className="text-xs font-bold block">{pkg.visaRequirement === 'None' ? 'Not Required' : pkg.visaRequirement}</span>
          </div>
          <div>
            <Landmark className="h-5 w-5 text-secondary mx-auto mb-1" />
            <span className="text-4xs text-slate-400 uppercase font-bold">Currency accepted</span>
            <span className="text-xs font-bold block">{pkg.currency} (INR)</span>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="mx-auto max-w-7xl w-full px-4 py-12 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        <div className="lg:col-span-2 space-y-8">
          {/* Tab Navigation */}
          <div className="flex space-x-6 border-b border-secondary/10 pb-3">
            {[
              { label: 'Itinerary Plan', value: 'itinerary' },
              { label: 'Hotel & Stays', value: 'hotel' },
              { label: 'Reviews', value: 'reviews' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value as any)}
                className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-colors ${
                  activeTab === tab.value ? 'border-secondary text-secondary' : 'border-transparent text-slate-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB CONTENTS */}
          {activeTab === 'itinerary' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-secondary">Day-to-Day Travel Itinerary</h3>
              <div className="space-y-3">
                {pkg.itinerary.map((dayPlan) => (
                  <div key={dayPlan.day} className="rounded-2xl border border-secondary/15 bg-slate-900/30">
                    <button
                      onClick={() => setOpenItineraryDay(openItineraryDay === dayPlan.day ? null : dayPlan.day)}
                      className="w-full flex items-center justify-between p-4 font-bold text-xs sm:text-sm text-white text-left"
                    >
                      <span>Day {dayPlan.day}: {dayPlan.title}</span>
                      <span>{openItineraryDay === dayPlan.day ? '▼' : '▶'}</span>
                    </button>
                    {openItineraryDay === dayPlan.day && (
                      <div className="p-4 border-t border-secondary/10 text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {dayPlan.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'hotel' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-secondary/15 bg-slate-900/30 p-5 space-y-3">
                <h4 className="text-xs font-bold text-secondary uppercase tracking-wider">Hotel & Accommodations</h4>
                <p className="text-xs text-slate-300">{pkg.hotelDetails}</p>
                <div className="border-t border-secondary/10 pt-3 text-xs">
                  <span className="text-slate-400">Meal Plan:</span> <strong className="text-white">{pkg.mealPlan}</strong>
                </div>
              </div>

              <div className="rounded-2xl border border-secondary/15 bg-slate-900/30 p-5 space-y-3">
                <h4 className="text-xs font-bold text-secondary uppercase tracking-wider">Transfers & Escorted transit</h4>
                <div className="flex items-center space-x-3 text-xs text-slate-300">
                  <Car className="h-5 w-5 text-secondary shrink-0" />
                  <div>
                    <p>{pkg.transportation}</p>
                    <p className="text-3xs text-slate-400 mt-1">Includes pickup from nearest railway port/airport and drop-off on departure.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Submission Form */}
              <form onSubmit={handleAddReview} className="glass rounded-xl p-4 border border-secondary/20 space-y-3">
                <h4 className="text-xs font-bold uppercase text-white">Submit Travel Review</h4>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="text-slate-300">Rating:</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="focus:outline-none"
                      >
                        <Star className={`h-4.5 w-4.5 ${reviewRating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="E.g., Beautiful stays and private car was punctual..."
                    className="flex-grow rounded-lg border border-border/40 bg-background/50 px-3 py-1.5 text-xs text-foreground focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="rounded-lg bg-secondary px-4 py-1.5 text-xs font-bold text-slate-950 hover:brightness-110 flex items-center space-x-1"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </form>

              {/* Reviews List */}
              <div className="space-y-4">
                {pkg.reviews?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">No reviews logged yet.</p>
                ) : (
                  pkg.reviews?.map((rev, idx) => (
                    <div key={idx} className="rounded-xl border border-secondary/15 bg-slate-900/30 p-4 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white">{rev.user.name}</span>
                        <div className="flex items-center space-x-0.5 text-amber-400">
                          <span>★</span>
                          <span>{rev.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* INCLUSIONS & EXCLUSIONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-secondary/10">
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Inclusions</h3>
              <ul className="space-y-1.5 text-xs">
                {pkg.inclusions.split(',').map((inc, i) => (
                  <li key={i} className="flex items-center space-x-2 text-slate-300">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">Exclusions</h3>
              <ul className="space-y-1.5 text-xs">
                {pkg.exclusions.split(',').map((exc, i) => (
                  <li key={i} className="flex items-center space-x-2 text-slate-300">
                    <XCircle className="h-4.5 w-4.5 text-rose-400 shrink-0" />
                    <span>{exc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interactive Google Map Simulation */}
          <div className="space-y-3 pt-6 border-t border-secondary/10">
            <h3 className="text-xs font-bold uppercase text-secondary">Route Travel Locator</h3>
            <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-secondary/15 bg-slate-900 flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] bg-[size:16px_16px]" />
              <div className="z-10 flex flex-col items-center">
                <MapPin className="h-8 w-8 text-rose-500 fill-rose-500/20" />
                <span className="rounded bg-black border border-border/80 px-2.5 py-1 text-3xs font-bold text-white shadow-md mt-1">
                  GPS Stop: {pkg.destination} route mapping
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar Enquiry & Bookings */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-secondary/20 bg-slate-900/30 p-6 shadow-md space-y-6">
            <div>
              <span className="text-4xs text-slate-400 block uppercase font-bold tracking-wider">Starts From</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-extrabold text-white">${pkg.price}</span>
                <span className="text-xs text-slate-400">/ traveler</span>
              </div>
            </div>

            <button
              onClick={handleBookNow}
              className="w-full rounded-xl bg-gradient-to-r from-secondary to-amber-600 py-3 text-sm font-bold text-slate-950 shadow-md hover:brightness-110 active:scale-98 transition-all"
            >
              Book Now
            </button>
          </div>

          {/* Enquiry lead form */}
          <div className="rounded-2xl border border-secondary/20 bg-slate-900/30 p-5 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center space-x-1">
              <Mail className="h-4 w-4 text-secondary" />
              <span>Inquire About Package</span>
            </h4>
            {inquirySuccess ? (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-center text-xs text-emerald-400">
                Inquiry submitted successfully!
              </div>
            ) : (
              <form onSubmit={handleInquiry} className="space-y-3 text-xs">
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={inquiryName}
                  onChange={(e) => setInquiryName(e.target.value)}
                  className="w-full rounded-lg border border-border/40 bg-background/50 px-3 py-2 text-foreground focus:outline-none"
                />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={inquiryEmail}
                  onChange={(e) => setInquiryEmail(e.target.value)}
                  className="w-full rounded-lg border border-border/40 bg-background/50 px-3 py-2 text-foreground focus:outline-none"
                />
                <textarea
                  required
                  placeholder="Your message details..."
                  value={inquiryMsg}
                  onChange={(e) => setInquiryMsg(e.target.value)}
                  className="w-full rounded-lg border border-border/40 bg-background/50 px-3 py-2 text-foreground focus:outline-none h-20 resize-none"
                />
                <button
                  type="submit"
                  disabled={inquiryLoading}
                  className="w-full rounded-lg bg-secondary py-2 font-semibold text-slate-950 hover:brightness-115 disabled:opacity-50 transition-all"
                >
                  {inquiryLoading ? 'Submitting...' : 'Send Inquiry Message'}
                </button>
              </form>
            )}
          </div>
        </div>

      </section>

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} onSuccess={() => {}} />

    </div>
  );
}
