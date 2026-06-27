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
  const [travelersCount, setTravelersCount] = useState(1);
  const [roomType, setRoomType] = useState<'Single' | 'Double' | 'Suite'>('Single');
  const [specialRequests, setSpecialRequests] = useState('');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-2xl bg-card border border-border p-6 shadow-2xl transition-all duration-300 animate-fade-in">
        
        {/* Close Button */}
        {!success && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center justify-center space-x-2">
            <CreditCard className="h-6 w-6 text-secondary" />
            <span className="text-gold-gradient font-bold">Secure Reservation Checkout</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Complete your holiday tour booking transaction securely via encrypted gateway.
          </p>
        </div>

        {success ? (
          /* SUCCESS VIEW */
          <div className="text-center py-8 space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-secondary animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Tour Package Reserved!</h3>
            <p className="text-sm text-muted-foreground px-4">
              Your transaction of **${totalPrice.toFixed(2)}** was processed successfully.
              A booking confirmation has been logged to your account.
            </p>
            <div className="bg-muted p-3 rounded-xl inline-block border border-secondary/20">
              <span className="text-xs font-mono text-muted-foreground block uppercase tracking-wide">
                Invoice Reference
              </span>
              <span className="text-sm font-mono font-bold text-secondary">{invoiceId}</span>
            </div>
            <p className="text-xs text-secondary animate-pulse">Redirecting to your Dashboard...</p>
          </div>
        ) : (
          /* RESERVATION FORM */
          <div className="space-y-6">
            
            {/* Booking Summary */}
            <div className="rounded-xl border border-secondary/20 bg-primary/20 p-4">
              <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">
                Tour Package Selected
              </span>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-foreground">
                  {activeBooking.name}
                </span>
                <span className="text-sm font-extrabold text-secondary">${basePrice} / traveler</span>
              </div>
            </div>

            {/* Custom inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Travel Date */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center space-x-1">
                  <Calendar className="h-3.5 w-3.5 text-secondary" />
                  <span>Travel Date</span>
                </label>
                <select
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-xs text-foreground focus:outline-none"
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
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center space-x-1">
                  <Users className="h-3.5 w-3.5 text-secondary" />
                  <span>Number of Travelers</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={travelersCount}
                  onChange={(e) => setTravelersCount(Number(e.target.value))}
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-xs text-foreground focus:outline-none"
                />
              </div>

              {/* Room Type */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center space-x-1">
                  <Home className="h-3.5 w-3.5 text-secondary" />
                  <span>Room Type Selection</span>
                </label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value as any)}
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-xs text-foreground focus:outline-none"
                >
                  <option value="Single">Single Room (Standard)</option>
                  <option value="Double">Double Room (+10%)</option>
                  <option value="Suite">Premium Luxury Suite (+30%)</option>
                </select>
              </div>

              {/* Requests */}
              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Special Requests / Dietary Needs
                </label>
                <textarea
                  placeholder="E.g., Vegetarian meals, high floor, anniversary surprise..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-xs text-foreground focus:outline-none h-14 resize-none"
                />
              </div>

            </div>

            {/* Error Alert */}
            {error && (
              <div className="flex items-center space-x-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Card Form */}
            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Card Number (Use `4000 0000 0000 0002` to simulate decline)
                </label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4000 1234 5678 9010"
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full rounded-xl border border-input bg-background/50 px-3 py-2.5 text-xs text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={3}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="•••"
                    className="w-full rounded-xl border border-input bg-background/50 px-3 py-2.5 text-xs text-foreground focus:outline-none"
                  />
                </div>
              </div>

              {/* Price Details & Submit */}
              <div className="border-t border-border mt-6 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-4xs text-muted-foreground uppercase tracking-wider block">Estimated Total</span>
                  <span className="text-xl font-extrabold text-foreground">${totalPrice.toFixed(2)}</span>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-gradient-to-r from-secondary to-amber-600 px-6 py-3 text-xs font-bold text-slate-950 shadow-md hover:brightness-110 disabled:opacity-50 transition-all duration-200"
                >
                  {loading ? 'Processing...' : 'Complete Reservation'}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
