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
      <div className="mx-auto max-w-7xl px-4 py-32 text-center space-y-4 bg-slate-50 text-slate-900 min-h-screen flex flex-col justify-center items-center">
        <Compass className="h-10 w-10 text-amber-500 animate-spin" />
        <p className="text-xs text-slate-500 font-semibold">Loading custom reservation details...</p>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="mx-auto max-w-md px-4 py-32 text-center bg-slate-50 text-slate-900 min-h-screen flex flex-col justify-center">
        <div className="rounded-[18px] bg-rose-50 border border-rose-100 p-6 space-y-4 shadow-sm">
          <h4 className="font-bold text-slate-950 font-sans">Error Loading Details</h4>
          <p className="text-xs text-rose-600 font-medium">{error || 'Package not found'}</p>
          <button onClick={() => router.back()} className="text-xs text-amber-500 font-bold hover:underline">
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
    <div className="mx-auto max-w-4xl w-full px-4 py-24 sm:px-6 lg:px-8 space-y-8 animate-fade-in bg-slate-50 text-slate-900 min-h-screen flex flex-col justify-center font-sans">
      
      {/* Back Link */}
      <div className="flex items-center">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Landmarks</span>
        </button>
      </div>

      {/* Premium Package Details Card */}
      <div className="bg-white border border-slate-200 rounded-[18px] overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Side: Destination Image */}
        <div className="relative h-64 md:h-full min-h-[350px]">
          <img
            src={heroImg}
            alt={pkg.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950/70 via-slate-950/15 to-transparent" />
          
          {/* Floating Duration Badge */}
          <div className="absolute top-6 left-6 bg-slate-950/75 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-xl flex items-center space-x-2 text-xs font-bold text-white shadow-lg">
            <Clock className="h-4 w-4 text-amber-400" />
            <span>{selectedDays} Days / {selectedDays - 1} Nights</span>
          </div>
        </div>

        {/* Right Side: Package details and price calculations */}
        <div className="p-8 sm:p-10 flex flex-col justify-between space-y-8">
          
          <div className="space-y-4">
            <span className="rounded bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-[9px] font-bold text-amber-600 uppercase tracking-widest inline-block">
              {pkg.category} Portfolio
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 leading-tight font-sans">{pkg.name}</h1>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Experience the best of {pkg.destination} with premium private transportation, luxury accommodations, and curated landmark tours.
            </p>

            {/* Quick Inclusions */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] font-bold text-slate-600">
              <div className="flex items-center space-x-1.5">
                <Check className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>Hotel Stays Included</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Check className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>Private Chauffeur</span>
              </div>
            </div>
          </div>

          <div className="space-y-6 border-t border-slate-100 pt-6">
            
            {/* Interactive Selectors */}
            <div className="space-y-4">
              
              {/* Duration Selector */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Duration (Days)</span>
                </div>
                
                <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 rounded-xl p-1">
                  <button
                    onClick={() => setSelectedDays(prev => Math.max(3, prev - 1))}
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-950 hover:bg-slate-200 transition-colors font-bold"
                  >
                    -
                  </button>
                  <span className="text-xs font-black text-slate-950 px-2 w-4 text-center">{selectedDays}</span>
                  <button
                    onClick={() => setSelectedDays(prev => Math.min(15, prev + 1))}
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-950 hover:bg-slate-200 transition-colors font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Number of Persons Selector */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Travelers</span>
                </div>
                
                <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 rounded-xl p-1">
                  <button
                    onClick={() => setNumPersons(prev => Math.max(1, prev - 1))}
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-950 hover:bg-slate-200 transition-colors font-bold"
                  >
                    -
                  </button>
                  <span className="text-xs font-black text-slate-950 px-2 w-4 text-center">{numPersons}</span>
                  <button
                    onClick={() => setNumPersons(prev => Math.min(10, prev + 1))}
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-950 hover:bg-slate-200 transition-colors font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            {/* Price Calculations */}
            <div className="flex items-baseline justify-between border-t border-slate-100 pt-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Total Price</span>
                <span className="text-2xl font-extrabold text-amber-500">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">
                ₹{pricePerPerson.toLocaleString('en-IN')} / person
              </span>
            </div>

            {/* Book Now Trigger */}
            <button
              onClick={handleBookNow}
              className="w-full rounded-xl bg-slate-950 hover:bg-slate-900 py-3.5 text-xs font-bold text-white shadow-md flex items-center justify-center space-x-2 transition-all duration-350"
            >
              <ShieldCheck className="h-4.5 w-4.5 text-amber-500" />
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
