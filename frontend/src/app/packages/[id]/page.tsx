'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Palmtree, MapPin, Calendar, Clock, Star, Landmark, HelpCircle, Send, CheckCircle2, XCircle, ArrowLeft, ArrowRight, ShieldCheck, Mail, Compass } from 'lucide-react';
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
  inclusions: string; // comma-separated
  exclusions: string; // comma-separated
  rating: number;
  availableDates: string[];
  images: string[];
  type: string;
  reviews: Review[];
}

export default function PackageDetailPage() {
  const { id } = useParams();
  const { apiUrl, token, setActiveBooking } = useApp();

  const [pkg, setPkg] = useState<TourPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<'itinerary' | 'accommodation' | 'map' | 'reviews'>('itinerary');

  // Accordions
  const [openItineraryDay, setOpenItineraryDay] = useState<number | null>(1);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const fetchPackageDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/api/packages/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load package details');
      setPkg(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPackageDetails();
    }
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

      // Update state in place
      const updatedReviews = [data, ...(pkg.reviews || [])];
      setPkg({
        ...pkg,
        reviews: updatedReviews,
        rating: Number(
          (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1)
        ),
      });
      setReviewComment('');
      alert('Thank you for your feedback review!');
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

  const faqsList = [
    { q: 'Is travel insurance included in the package?', a: 'No, travel insurance is not included. However, we highly recommend adding it during checkout for flight delay and baggage protection.' },
    { q: 'What is the refund policy for tour cancellations?', a: 'Cancellations made 15 days or more before the travel date qualify for a 90% refund. Cancellations afterwards are subject to hotel policy fees.' },
    { q: 'Can I customize the day-wise itinerary activities?', a: 'Yes! Once booked, you can discuss tweaks with your private escort driver. Extra visits may incur local entry fee costs.' }
  ];

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center space-y-4">
        <Compass className="h-10 w-10 text-secondary animate-spin mx-auto" />
        <p className="text-xs text-muted-foreground">Loading bespoke luxury itinerary...</p>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center space-y-4">
        <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-6">
          <h4 className="font-bold text-foreground">Package Detail Error</h4>
          <p className="text-xs text-muted-foreground">{error || 'Unable to load tour details'}</p>
          <Link href="/packages" className="text-xs text-primary font-bold hover:underline block mt-3">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  const heroImg = pkg.images[0] || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200';

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* LUXURY HERO BANNER */}
      <section className="relative h-80 sm:h-96 w-full bg-slate-900 overflow-hidden">
        <img
          src={heroImg}
          alt={pkg.name}
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-slate-950/40 to-slate-950/80" />
        
        {/* Banner Details */}
        <div className="absolute bottom-6 left-4 right-4 max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="space-y-2">
            <span className="rounded bg-secondary px-2.5 py-0.5 text-4xs font-bold text-slate-950 uppercase tracking-widest">
              {pkg.category} • {pkg.type}
            </span>
            <h1 className="text-xl sm:text-3xl font-black text-white">{pkg.name}</h1>
            <p className="text-xs text-slate-200 flex items-center space-x-1">
              <MapPin className="h-3.5 w-3.5 text-secondary" />
              <span>{pkg.destination} Getaway Package</span>
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-white/10">
            <Star className="h-4 w-4 fill-amber-400" />
            <span>{pkg.rating} Stars Rating</span>
          </div>
        </div>
      </section>

      {/* QUICK FACTS BAR */}
      <section className="bg-muted/40 border-b border-border/40 py-4 transition-colors">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="flex flex-col justify-center items-center">
            <Clock className="h-5 w-5 text-secondary mb-1" />
            <span className="text-4xs text-muted-foreground uppercase font-bold">Duration</span>
            <span className="text-xs font-bold text-foreground">{pkg.durationDays} Days</span>
          </div>
          <div className="flex flex-col justify-center items-center">
            <Calendar className="h-5 w-5 text-secondary mb-1" />
            <span className="text-4xs text-muted-foreground uppercase font-bold">Best Season</span>
            <span className="text-xs font-bold text-foreground">{pkg.bestSeason}</span>
          </div>
          <div className="flex flex-col justify-center items-center">
            <ShieldCheck className="h-5 w-5 text-secondary mb-1" />
            <span className="text-4xs text-muted-foreground uppercase font-bold">Visa Required</span>
            <span className="text-xs font-bold text-foreground">{pkg.visaRequirement}</span>
          </div>
          <div className="flex flex-col justify-center items-center">
            <Landmark className="h-5 w-5 text-secondary mb-1" />
            <span className="text-4xs text-muted-foreground uppercase font-bold">Currency</span>
            <span className="text-xs font-bold text-foreground">{pkg.currency}</span>
          </div>
        </div>
      </section>

      {/* CONTENT GRID */}
      <section className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Itinerary / Gallery area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Tab Navigation */}
          <div className="flex space-x-6 border-b border-border/20 pb-3">
            {['itinerary', 'accommodation', 'map', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`text-xs sm:text-sm font-bold uppercase tracking-wider pb-2 border-b-2 transition-colors ${
                  activeTab === tab ? 'border-secondary text-secondary' : 'border-transparent text-muted-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB CONTENTS */}
          {activeTab === 'itinerary' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Day-to-Day Travel Plan</h3>
              <div className="space-y-3">
                {pkg.itinerary.map((dayPlan) => (
                  <div
                    key={dayPlan.day}
                    className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
                  >
                    <button
                      onClick={() => setOpenItineraryDay(openItineraryDay === dayPlan.day ? null : dayPlan.day)}
                      className="w-full flex items-center justify-between p-4 font-bold text-xs sm:text-sm text-foreground bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      <span>Day {dayPlan.day}: {dayPlan.title}</span>
                      <span>{openItineraryDay === dayPlan.day ? '▼' : '▶'}</span>
                    </button>
                    {openItineraryDay === dayPlan.day && (
                      <div className="p-4 border-t border-border/40 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {dayPlan.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'accommodation' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-foreground">Lodging Details</h3>
                <p className="text-xs text-muted-foreground mt-1">{pkg.hotelDetails}</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Dining & Meals Plan</h3>
                <p className="text-xs text-muted-foreground mt-1">{pkg.mealPlan}</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Escorted Transportation</h3>
                <p className="text-xs text-muted-foreground mt-1">{pkg.transportation}</p>
              </div>

              {/* Gallery Grid */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sightseeing Gallery</h3>
                <div className="grid grid-cols-2 gap-4">
                  {pkg.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={pkg.name}
                      className="rounded-xl h-44 w-full object-cover shadow-sm"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'map' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-foreground">Escorted Route Mapping</h3>
              
              {/* Dynamic SVG Map */}
              <div className="relative h-72 w-full rounded-2xl overflow-hidden border border-border shadow bg-slate-900 flex items-center justify-center">
                <svg className="absolute inset-0 h-full w-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 50 100 Q 150 50 250 150 T 350 200" stroke="white" strokeWidth="2" fill="none" strokeDasharray="5" />
                  <circle cx="50" cy="100" r="6" fill="#c5a059" />
                  <circle cx="170" cy="90" r="6" fill="#c5a059" />
                  <circle cx="280" cy="180" r="6" fill="#c5a059" />
                  <circle cx="350" cy="200" r="6" fill="#c5a059" />
                </svg>

                <div className="absolute top-10 left-8 text-3xs font-semibold text-white/50 bg-black/40 px-2 py-0.5 rounded">
                  Day 1 Point
                </div>
                <div className="absolute bottom-10 right-8 text-3xs font-semibold text-white/50 bg-black/40 px-2 py-0.5 rounded">
                  Departure Port
                </div>

                <div className="relative z-10 flex flex-col items-center animate-bounce">
                  <MapPin className="h-10 w-10 text-rose-500 fill-rose-500/20" />
                  <span className="rounded bg-black border border-border/80 px-2.5 py-1 text-3xs font-bold text-white shadow-md mt-1">
                    {pkg.destination} Tour Route
                  </span>
                </div>

                <div className="absolute bottom-2 left-2 rounded bg-slate-950/60 px-2 py-1 text-3xs font-mono text-slate-400">
                  Itinerary Stops: {pkg.itinerary.length} destinations mapped
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              
              {/* Review submit form */}
              <form onSubmit={handleAddReview} className="glass rounded-xl p-4 border border-border/60 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Add Feedback Review</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">Rating:</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="focus:outline-none"
                      >
                        <Star className={`h-4.5 w-4.5 ${reviewRating >= star ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />
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
                    placeholder="E.g., Wonderful guide, amazing resort stays..."
                    className="flex-grow rounded-lg border border-input bg-background/50 px-3 py-1.5 text-xs text-foreground focus:outline-none"
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
                  <p className="text-xs text-muted-foreground italic text-center py-4">
                    No reviews yet. Be the first to share your thoughts!
                  </p>
                ) : (
                  pkg.reviews?.map((rev, idx) => (
                    <div key={idx} className="rounded-xl border border-border bg-card p-4 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-foreground">{rev.user.name}</span>
                        <div className="flex items-center space-x-1 text-amber-500 font-semibold">
                          <Star className="h-3 w-3 fill-amber-500" />
                          <span>{rev.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{rev.comment}</p>
                      <span className="text-3xs text-muted-foreground block">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* INCLUSIONS & EXCLUSIONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-border/20">
            {/* Inclusions */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500">What's Included</h3>
              <ul className="space-y-1.5 text-xs">
                {pkg.inclusions.split(',').map((inc, i) => (
                  <li key={i} className="flex items-center space-x-2 text-muted-foreground">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Exclusions */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500">What's Excluded</h3>
              <ul className="space-y-1.5 text-xs">
                {pkg.exclusions.split(',').map((exc, i) => (
                  <li key={i} className="flex items-center space-x-2 text-muted-foreground">
                    <XCircle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                    <span>{exc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* FAQS ACCORDION */}
          <div className="space-y-4 pt-6 border-t border-border/20">
            <h3 className="text-sm font-bold text-foreground">Frequently Asked Questions</h3>
            <div className="space-y-2">
              {faqsList.map((faq, i) => (
                <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-3.5 text-xs font-bold text-foreground bg-muted/10 hover:bg-muted/20 text-left"
                  >
                    <span>{faq.q}</span>
                    <span>{openFaq === i ? '▼' : '▶'}</span>
                  </button>
                  {openFaq === i && (
                    <div className="p-3.5 border-t border-border/40 text-xs text-muted-foreground leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Checkout sidebar / Inquiry Form */}
        <div className="space-y-6">
          
          {/* Reservation Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-md space-y-6">
            <div>
              <span className="text-4xs text-muted-foreground block uppercase font-bold tracking-wider">Starts From</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-extrabold text-foreground">${pkg.price}</span>
                <span className="text-xs text-muted-foreground">/ traveler</span>
              </div>
            </div>

            <div className="space-y-3 border-t border-border/20 pt-4 text-xs text-muted-foreground">
              <p>🏨 Accommodate: <strong>{pkg.hotelDetails}</strong></p>
              <p>🍽️ Meals: <strong>{pkg.mealPlan}</strong></p>
              <p>🚗 Transit: <strong>{pkg.transportation}</strong></p>
            </div>

            <button
              onClick={handleBookNow}
              className="w-full rounded-xl bg-gradient-to-r from-secondary to-amber-600 py-3 text-sm font-bold text-slate-950 shadow-md hover:brightness-110 active:scale-98 transition-all"
            >
              Book Now
            </button>
          </div>

          {/* INQUIRY LEAD FORM */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center space-x-1">
              <Mail className="h-4 w-4 text-secondary" />
              <span>Inquire About Package</span>
            </h4>
            
            {inquirySuccess ? (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-center text-xs text-emerald-500">
                Inquiry submitted successfully! Our expert planners will email you shortly.
              </div>
            ) : (
              <form onSubmit={handleInquiry} className="space-y-3 text-xs">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <textarea
                    required
                    placeholder="Your message details..."
                    value={inquiryMsg}
                    onChange={(e) => setInquiryMsg(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-foreground focus:outline-none h-20 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={inquiryLoading}
                  className="w-full rounded-lg bg-primary py-2 font-semibold text-primary-foreground hover:brightness-115 disabled:opacity-50 transition-all"
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
