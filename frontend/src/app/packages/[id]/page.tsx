'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Clock, Users, ArrowLeft, ShieldCheck, Compass, Check, Calendar } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import CheckoutModal from '@/components/CheckoutModal';

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
  visaRequirement: string;
  currency: string;
  weather: string;
  inclusions: string;
  images: string[];
}

export default function PackageDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { apiUrl, token, setActiveBooking } = useApp();

  const [pkg, setPkg] = useState<TourPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Counter states
  const [numPersons, setNumPersons] = useState(1);
  const [selectedDays, setSelectedDays] = useState(5);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    const fetchPackageDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${apiUrl}/api/packages/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load package details');
        setPkg(data);
        setSelectedDays(data.durationDays);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPackageDetails();
    }
  }, [id, apiUrl]);

  const handleBookNow = () => {
    if (!token) {
      setIsAuthOpen(true);
      return;
    }
    if (!pkg) return;

    const baseDuration = pkg.durationDays || 5;
    const pricePerDay = Math.round((pkg.price * 85) / baseDuration);
    const pricePerPerson = pricePerDay * selectedDays;

    setActiveBooking({
      packageId: pkg.id,
      name: pkg.name,
      price: pricePerPerson, // Carry customized INR price per traveler
      availableDates: ['2026-07-15', '2026-08-10', '2026-09-05'], // Fallback options
      travelersCount: numPersons, // Carry traveler count
      durationDays: selectedDays, // Carry selected duration
    });
    setIsCheckoutOpen(true);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 text-center space-y-4 bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-center items-center">
        <Compass className="h-10 w-10 text-secondary animate-spin" />
        <p className="text-xs text-slate-400">Loading custom reservation card...</p>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="mx-auto max-w-md px-4 py-32 text-center bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-center">
        <div className="rounded-2xl bg-rose-950/20 border border-rose-500/30 p-6 space-y-4">
          <h4 className="font-bold text-white">Error Loading Details</h4>
          <p className="text-xs text-slate-400">{error || 'Package not found'}</p>
          <button onClick={() => router.back()} className="text-xs text-secondary font-bold hover:underline">
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  const heroImg = pkg.images[0] || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200';
  
  // Custom price calculations based on selected number of days (multiplied by 85 for INR conversion)
  const baseDuration = pkg.durationDays || 5;
  const pricePerDay = Math.round((pkg.price * 85) / baseDuration);
  const pricePerPerson = pricePerDay * selectedDays;
  const totalPrice = pricePerPerson * numPersons;

  return (
    <div className="mx-auto max-w-4xl w-full px-4 py-28 sm:px-6 lg:px-8 space-y-8 animate-fade-in bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-center">
      
      {/* Back Link */}
      <div className="flex items-center">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Landmarks</span>
        </button>
      </div>

      {/* Premium Package Details Card */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Side: Destination Image */}
        <div className="relative h-64 md:h-full min-h-[350px]">
          <img
            src={heroImg}
            alt={pkg.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950/80 via-slate-950/20 to-transparent" />
          
          {/* Floating Duration Badge */}
          <div className="absolute top-6 left-6 bg-slate-950/75 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-xl flex items-center space-x-2 text-xs font-bold shadow-lg">
            <Clock className="h-4 w-4 text-secondary" />
            <span>{selectedDays} Days / {selectedDays - 1} Nights</span>
          </div>
        </div>

        {/* Right Side: Package details and price calculations */}
        <div className="p-8 sm:p-10 flex flex-col justify-between space-y-8">
          
          <div className="space-y-4">
            <span className="rounded bg-secondary/10 border border-secondary/20 px-3 py-1 text-4xs font-bold text-secondary uppercase tracking-widest inline-block">
              {pkg.category} Package
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{pkg.name}</h1>
            <p className="text-xs text-slate-400 font-medium">
              Experience the best of {pkg.destination} with premium private transportation, luxury accommodations, and curated landmark tours.
            </p>

            {/* Quick Inclusions */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-3xs font-semibold text-slate-300">
              <div className="flex items-center space-x-1.5">
                <Check className="h-3.5 w-3.5 text-secondary" />
                <span>Hotel Stays Included</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Check className="h-3.5 w-3.5 text-secondary" />
                <span>Private Chauffeur</span>
              </div>
            </div>
          </div>

          <div className="space-y-6 border-t border-white/5 pt-6">
            
            {/* Interactive Selectors */}
            <div className="space-y-4">
              
              {/* Duration Selector */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Duration (Days)</span>
                </div>
                
                <div className="flex items-center space-x-3 bg-slate-950 border border-white/10 rounded-xl p-1">
                  <button
                    onClick={() => setSelectedDays(prev => Math.max(3, prev - 1))}
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-bold"
                  >
                    -
                  </button>
                  <span className="text-sm font-black text-white px-2 w-4 text-center">{selectedDays}</span>
                  <button
                    onClick={() => setSelectedDays(prev => Math.min(15, prev + 1))}
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Number of Persons Selector */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Travelers</span>
                </div>
                
                <div className="flex items-center space-x-3 bg-slate-950 border border-white/10 rounded-xl p-1">
                  <button
                    onClick={() => setNumPersons(prev => Math.max(1, prev - 1))}
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-bold"
                  >
                    -
                  </button>
                  <span className="text-sm font-black text-white px-2 w-4 text-center">{numPersons}</span>
                  <button
                    onClick={() => setNumPersons(prev => Math.min(10, prev + 1))}
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            {/* Price Calculations */}
            <div className="flex items-baseline justify-between border-t border-white/5 pt-4">
              <div>
                <span className="text-4xs text-slate-400 uppercase tracking-widest block font-bold">Total Price</span>
                <span className="text-3xl font-black text-secondary">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <span className="text-3xs text-slate-400 font-medium">
                ₹{pricePerPerson.toLocaleString('en-IN')} / person
              </span>
            </div>

            {/* Book Now Trigger */}
            <button
              onClick={handleBookNow}
              className="w-full rounded-2xl bg-gradient-to-r from-secondary to-amber-600 py-4 text-sm font-black text-slate-950 shadow-lg hover:brightness-110 active:scale-98 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="h-5 w-5" />
              <span>Book Package Now</span>
            </button>
          </div>

        </div>

      </div>

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} onSuccess={() => {}} />

    </div>
  );
}
