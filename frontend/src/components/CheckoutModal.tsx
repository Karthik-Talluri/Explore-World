'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, CreditCard, Ticket, CheckCircle2, AlertCircle, Calendar, Users, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckoutModal({ isOpen, onClose, onSuccess }: CheckoutModalProps) {
  const { apiUrl, token, activeBooking, setActiveBooking } = useApp();
  const router = useRouter();
  
  // Selection states
  const [travelDate, setTravelDate] = useState('');
  const [travelersCount, setTravelersCount] = useState(activeBooking?.travelersCount || 1);
  const [roomType, setRoomType] = useState<'Single' | 'Double' | 'Suite'>('Single');
  const [specialRequests, setSpecialRequests] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  // Payment states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [invoiceId, setInvoiceId] = useState('');

  if (!isOpen || !activeBooking) return null;

  // Price calculations
  const basePrice = activeBooking.price;
  let roomModifier = 1.0;
  if (roomType === 'Double') roomModifier = 1.1;
  else if (roomType === 'Suite') roomModifier = 1.3;

  const totalPrice = Number((basePrice * travelersCount * roomModifier).toFixed(2));

  // Initialize date selection if empty
  if (!travelDate && activeBooking.availableDates.length > 0) {
    setTravelDate(activeBooking.availableDates[0]);
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const isDecline = cardNumber.replace(/\s/g, '') === '4000000000000002';
    const paymentMethodId = isDecline ? 'pm_card_chargeDeclined' : 'pm_card_success';

    try {
      const response = await fetch(`${apiUrl}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          packageId: activeBooking.packageId,
          travelDate,
          travelersCount,
          roomType,
          specialRequests,
          pickupLocation,
          contactNumber,
          paymentMethodId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment processing failed');
      }

      if (data.booking.paymentStatus === 'FAILED') {
        throw new Error('Your card was declined. Please try another card.');
      }

      setInvoiceId(data.booking.invoiceId);
      setSuccess(true);
      onSuccess();
      setTimeout(() => {
        onClose();
        setActiveBooking(null);
        router.push('/dashboard');
      }, 3500);

    } catch (err: any) {
      setError(err.message || 'Payment error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 text-slate-900 font-sans">
      <div className="relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-[18px] bg-white border border-slate-200 p-6 sm:p-7 shadow-xl transition-all duration-300 animate-fade-in">
        
        {/* Close Button */}
        {!success && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="mb-6 text-center">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 flex items-center justify-center space-x-2 font-sans">
            <CreditCard className="h-5.5 w-5.5 text-amber-500" />
            <span>Secure Checkout</span>
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">
            Complete your holiday tour booking transaction securely via encrypted gateway.
          </p>
        </div>

        {success ? (
          /* SUCCESS VIEW */
          <div className="text-center py-8 space-y-4 font-sans">
            <div className="flex justify-center">
              <CheckCircle2 className="h-14 w-14 text-emerald-500 animate-bounce" />
            </div>
            <h3 className="text-lg font-bold text-slate-950">Tour Package Reserved!</h3>
            <p className="text-xs text-slate-500 font-semibold px-4 leading-relaxed">
              Your transaction of <strong className="text-slate-900">₹{totalPrice.toLocaleString('en-IN')}</strong> was processed successfully.
              A booking confirmation has been logged to your account.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl inline-block border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                Invoice Reference ID
              </span>
              <span className="text-xs font-mono font-bold text-amber-600">{invoiceId}</span>
            </div>
            <p className="text-xs text-amber-500 font-bold animate-pulse">Redirecting to your Dashboard...</p>
          </div>
        ) : (
          /* RESERVATION FORM */
          <div className="space-y-6">
            
            {/* Booking Summary */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-1">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block font-sans">
                Package Selected
              </span>
              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                <span className="truncate max-w-[240px]">
                  {activeBooking.name} {activeBooking.durationDays ? `(${activeBooking.durationDays} Days)` : ''}
                </span>
                <span className="text-amber-600 font-extrabold text-right">₹{basePrice.toLocaleString('en-IN')} / person</span>
              </div>
            </div>

            {/* Custom inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-semibold text-slate-600">
              
              {/* Travel Date */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center space-x-1.5">
                  <Calendar className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>Travel Date</span>
                </label>
                <select
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500/50 font-semibold"
                >
                  {activeBooking.availableDates.map((d, i) => (
                    <option key={i} value={d}>
                      {new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Travelers */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center space-x-1.5">
                  <Users className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>Travelers Count</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={travelersCount}
                  onChange={(e) => setTravelersCount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500/50 font-semibold"
                />
              </div>

              {/* Room Type */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center space-x-1.5">
                  <Home className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span>Room Selection</span>
                </label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500/50 font-semibold"
                >
                  <option value="Single">Single Room (Standard)</option>
                  <option value="Double">Double Room (+10%)</option>
                  <option value="Suite">Premium Luxury Suite (+30%)</option>
                </select>
              </div>

              {/* Contact Number */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500/50 font-semibold"
                />
              </div>

              {/* Pickup Location */}
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                  Pickup Point Meeting Location
                </label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Airport Arrivals Lobby, Central Railway Station"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500/50 font-semibold"
                />
              </div>

              {/* Requests */}
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                  Special Requests / Dietary Plans
                </label>
                <textarea
                  placeholder="E.g., Vegetarian meals, wheelchair access, high floor..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-amber-500/50 h-16 resize-none font-semibold"
                />
              </div>

            </div>

            {/* Error Alert */}
            {error && (
              <div className="flex items-center space-x-2 rounded-xl bg-rose-50 p-3.5 text-xs text-rose-600 border border-rose-100 font-bold">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Card Form */}
            <form onSubmit={handlePayment} className="space-y-4 font-semibold text-slate-650">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none focus:border-amber-500/50 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Card Number (Use `4000 0000 0000 0002` to simulate decline)
                </label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4000 1234 5678 9010"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none focus:border-amber-500/50 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none focus:border-amber-500/50 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    CVV Security Code
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={3}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="•••"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none focus:border-amber-500/50 font-semibold"
                  />
                </div>
              </div>

              {/* Price Details & Submit */}
              <div className="border-t border-slate-200 mt-6 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Estimated Total</span>
                  <span className="text-xl font-extrabold text-amber-500">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-slate-950 hover:bg-slate-900 px-6 py-3 text-xs font-bold text-white shadow-sm hover:brightness-110 disabled:opacity-50 transition-all duration-200"
                >
                  {loading ? 'Processing...' : 'Complete Payment'}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
