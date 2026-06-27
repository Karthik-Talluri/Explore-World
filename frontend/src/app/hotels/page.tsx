'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Building, Star, MapPin, Coffee, Dumbbell, ShieldAlert, ArrowLeft, Heart, Sparkles, MessageSquare, Send } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import CheckoutModal from '@/components/CheckoutModal';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string };
}

interface Hotel {
  id: string;
  name: string;
  location: string;
  description: string;
  rating: number;
  pricePerNight: number;
  images: string; // JSON string
  amenities: string; // comma-separated
  latitude: number;
  longitude: number;
  reviews: Review[];
}

function HotelsContent() {
  const searchParams = useSearchParams();
  const { apiUrl, token, setActiveBooking } = useApp();

  const [locationQuery, setLocationQuery] = useState(searchParams.get('location') || 'Paris');
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected hotel for detail view
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'map'>('details');

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const fetchHotels = async () => {
    setLoading(true);
    setError(null);
    setSelectedHotel(null);
    try {
      const res = await fetch(`${apiUrl}/api/hotels/search?location=${encodeURIComponent(locationQuery)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to search hotels');
      setHotels(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHotels();
  };

  const handleBookHotel = (hotel: Hotel) => {
    if (!token) {
      setIsAuthOpen(true);
      return;
    }
    setActiveBooking({
      type: 'HOTEL',
      details: hotel,
      totalPrice: hotel.pricePerNight * 2, // assume 2 nights
    });
    setIsCheckoutOpen(true);
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setIsAuthOpen(true);
      return;
    }
    if (!reviewComment.trim() || !selectedHotel) return;

    setReviewLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/hotels/${selectedHotel.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Review post failed');

      // Update selected hotel reviews list
      const updatedReviews = [data, ...(selectedHotel.reviews || [])];
      setSelectedHotel({
        ...selectedHotel,
        reviews: updatedReviews,
        // Approximate recalculation of rating
        rating: Number(
          (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1)
        ),
      });
      setReviewComment('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const getAmenityIcon = (amenityName: string) => {
    const name = amenityName.toLowerCase();
    if (name.includes('wifi')) return <span className="font-semibold text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">WiFi</span>;
    if (name.includes('pool') || name.includes('swimming')) return <span className="font-semibold text-xs bg-secondary/15 text-secondary px-2 py-0.5 rounded">Pool</span>;
    if (name.includes('fitness') || name.includes('gym')) return <span className="font-semibold text-xs bg-teal-500/10 text-teal-500 px-2 py-0.5 rounded">Gym</span>;
    if (name.includes('spa')) return <span className="font-semibold text-xs bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded">Spa</span>;
    if (name.includes('bar') || name.includes('drink')) return <span className="font-semibold text-xs bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded">Bar</span>;
    return <span className="font-semibold text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">{amenityName}</span>;
  };

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      
      {/* Top Search Bar */}
      {!selectedHotel && (
        <form onSubmit={handleSearchSubmit} className="glass rounded-2xl p-5 border border-border/40 shadow flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1 w-full">
            <label className="block text-2xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Search hotel locations
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <MapPin className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Where would you like to stay?"
                className="w-full rounded-xl border border-input bg-background/50 pl-10 pr-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110 shadow transition-all"
          >
            Find Accommodations
          </button>
        </form>
      )}

      {/* Main Grid View */}
      {selectedHotel ? (
        /* DETAIL VIEW */
        <div className="space-y-6 animate-fade-in">
          
          {/* Back Button */}
          <button
            onClick={() => setSelectedHotel(null)}
            className="flex items-center space-x-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to listings</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Gallery & Description */}
            <div className="lg:col-span-2 space-y-6">
              {/* Hotel Images */}
              {(() => {
                const imgs = JSON.parse(selectedHotel.images || '[]');
                return (
                  <div className="grid grid-cols-2 gap-4 rounded-2xl overflow-hidden shadow">
                    {imgs.map((img: string, idx: number) => (
                      <img
                        key={idx}
                        src={img}
                        alt={selectedHotel.name}
                        className="h-60 sm:h-80 w-full object-cover"
                      />
                    ))}
                  </div>
                );
              })()}

              {/* Tabs */}
              <div className="flex space-x-4 border-b border-border/20 pb-3">
                {['details', 'reviews', 'map'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`text-sm font-bold uppercase tracking-wider pb-2 border-b-2 transition-colors ${
                      activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">{selectedHotel.name}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedHotel.description}
                  </p>
                  
                  {/* Amenities */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amenity Packages</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedHotel.amenities.split(',').map((amen, idx) => (
                        <div key={idx}>{getAmenityIcon(amen)}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Review Form */}
                  <form onSubmit={handleAddReview} className="glass rounded-xl p-4 border border-border/60 space-y-3">
                    <h4 className="text-sm font-bold text-foreground">Write a Review</h4>
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
                        placeholder="Share your stay experience..."
                        className="flex-grow rounded-lg border border-input bg-background/50 px-3 py-1.5 text-xs text-foreground focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={reviewLoading}
                        className="rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:brightness-110 flex items-center space-x-1"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Send</span>
                      </button>
                    </div>
                  </form>

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {selectedHotel.reviews?.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic text-center py-4">
                        No reviews yet. Be the first to share your thoughts!
                      </p>
                    ) : (
                      selectedHotel.reviews?.map((rev, idx) => (
                        <div key={idx} className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-foreground">{rev.user.name}</span>
                            <div className="flex items-center space-x-1 text-2xs font-semibold text-amber-500">
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

              {activeTab === 'map' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center space-x-1">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Interactive Location Guide</span>
                  </h3>
                  
                  {/* Google Maps SVG Mock */}
                  <div className="relative h-72 w-full rounded-2xl overflow-hidden border border-border shadow bg-slate-900 flex items-center justify-center">
                    {/* SVG Map Lines */}
                    <svg className="absolute inset-0 h-full w-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M 0 50 L 400 50 M 0 150 L 400 150 M 0 250 L 400 250" stroke="white" strokeWidth="2" />
                      <path d="M 50 0 L 50 300 M 180 0 L 180 300 M 300 0 L 300 300" stroke="white" strokeWidth="2" />
                      <circle cx="180" cy="150" r="80" stroke="white" strokeWidth="1" fill="none" strokeDasharray="4" />
                    </svg>
                    
                    {/* Hotspots */}
                    <div className="absolute top-12 left-16 text-3xs font-semibold text-muted-foreground flex items-center space-x-1 bg-black/40 px-2 py-0.5 rounded">
                      <Sparkles className="h-3 w-3 text-secondary" />
                      <span>Tourist Hub</span>
                    </div>
                    <div className="absolute bottom-16 right-16 text-3xs font-semibold text-muted-foreground flex items-center space-x-1 bg-black/40 px-2 py-0.5 rounded">
                      <Coffee className="h-3 w-3 text-amber-500" />
                      <span>Cafe Quarter</span>
                    </div>

                    {/* Central Pin */}
                    <div className="relative z-10 flex flex-col items-center animate-bounce">
                      <MapPin className="h-10 w-10 text-rose-500 fill-rose-500/20" />
                      <span className="rounded bg-black border border-border/80 px-2 py-1 text-3xs font-bold text-white shadow-md block mt-1">
                        {selectedHotel.name}
                      </span>
                    </div>

                    {/* Overlay info coordinates */}
                    <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-3xs font-mono text-slate-300">
                      GPS: {selectedHotel.latitude.toFixed(4)}°N, {selectedHotel.longitude.toFixed(4)}°E
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Checkin / Pricing Sidebar */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-md h-fit space-y-6">
              <div>
                <span className="text-3xs text-muted-foreground block uppercase font-bold tracking-wider">Pricing</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-extrabold text-foreground">${selectedHotel.pricePerNight}</span>
                  <span className="text-xs text-muted-foreground">/ night</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-3xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Check-In</label>
                    <input
                      type="date"
                      defaultValue="2026-07-15"
                      className="w-full rounded-lg border border-input bg-background/50 px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-3xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Check-Out</label>
                    <input
                      type="date"
                      defaultValue="2026-07-17"
                      className="w-full rounded-lg border border-input bg-background/50 px-2.5 py-1.5 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-3xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Rooms & Guests</label>
                  <select className="w-full rounded-lg border border-input bg-background/50 px-2.5 py-1.5 text-xs text-foreground focus:outline-none">
                    <option>1 Room, 2 Adults</option>
                    <option>1 Room, 1 Adult</option>
                    <option>2 Rooms, 4 Adults</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => handleBookHotel(selectedHotel)}
                className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md hover:brightness-110 active:scale-98 transition-all"
              >
                Confirm Stay Reservation
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* HOTEL LISTINGS */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start animate-fade-in">
          
          {/* Left filters - simple */}
          <div className="glass rounded-2xl p-5 border border-border/40 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Browse Accommodations</h3>
            <p className="text-2xs text-muted-foreground leading-relaxed">
              Explore world-class suites matching rating, locations, and pricing options.
            </p>
            <div className="border-t border-border/20 pt-3 text-xs text-muted-foreground space-y-1">
              <p>📍 Location: <strong>{locationQuery}</strong></p>
              <p>⭐ Avg Rating: <strong>4.5+ Stars</strong></p>
            </div>
          </div>

          {/* Hotel Grid Area */}
          <div className="lg:col-span-3">
            {loading ? (
              /* Loading Skeleton */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-72 w-full bg-muted/60 animate-pulse rounded-2xl border border-border/30" />
                ))}
              </div>
            ) : error ? (
              <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-6 text-center space-y-2">
                <ShieldAlert className="h-8 w-8 text-destructive mx-auto" />
                <h4 className="font-bold text-foreground">Search error</h4>
                <p className="text-xs text-muted-foreground">{error}</p>
              </div>
            ) : hotels.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center bg-card">
                <Building className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <h4 className="font-bold text-foreground">No hotels found</h4>
                <p className="text-xs text-muted-foreground">Try searching for other major destinations (e.g. Tokyo, Paris, Sydney, Dubai).</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {hotels.map((hotel) => {
                  const imgs = JSON.parse(hotel.images || '[]');
                  const cardImg = imgs[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600';
                  
                  return (
                    <div
                      key={hotel.id}
                      className="group rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:border-primary/40 flex flex-col justify-between transition-colors"
                    >
                      <div className="relative">
                        <img
                          src={cardImg}
                          alt={hotel.name}
                          className="h-44 w-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />
                        <div className="absolute top-2 right-2 rounded-lg bg-black/45 px-2 py-0.5 text-2xs font-semibold text-amber-400 flex items-center space-x-0.5">
                          <Star className="h-3 w-3 fill-amber-400" />
                          <span>{hotel.rating}</span>
                        </div>
                      </div>
                      
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <h4 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                            {hotel.name}
                          </h4>
                          <span className="text-3xs text-muted-foreground font-semibold flex items-center space-x-0.5">
                            <MapPin className="h-3 w-3 text-secondary" />
                            <span>{hotel.location}</span>
                          </span>
                          <p className="text-3xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {hotel.description}
                          </p>
                        </div>

                        <div className="border-t border-border/20 pt-3 flex items-center justify-between">
                          <div>
                            <span className="text-4xs text-muted-foreground block uppercase font-bold">Per Night</span>
                            <span className="text-sm font-extrabold text-foreground">${hotel.pricePerNight}</span>
                          </div>
                          <button
                            onClick={() => setSelectedHotel(hotel)}
                            className="rounded-lg bg-primary/10 hover:bg-primary/20 px-3 py-1.5 text-2xs font-bold text-primary transition-all"
                          >
                            View Suite
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} onSuccess={() => {}} />

    </div>
  );
}

export default function HotelsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-muted-foreground font-semibold">Loading hotels search...</div>}>
      <HotelsContent />
    </Suspense>
  );
}
