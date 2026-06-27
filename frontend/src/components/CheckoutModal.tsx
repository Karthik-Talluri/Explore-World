'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, CreditCard, Ticket, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CheckoutModal({ isOpen, onClose, onSuccess }: CheckoutModalProps) {
  const { apiUrl, token, activeBooking, setActiveBooking } = useApp();
  const router = useRouter();
  
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState<number | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  if (!isOpen || !activeBooking) return null;

  const originalPrice = activeBooking.totalPrice;
  const discountedPrice = couponDiscount 
    ? originalPrice * (1 - couponDiscount / 100) 
    : originalPrice;

  const handleApplyCoupon = async () => {
    setCouponError(null);
    if (!couponCode) return;

    try {
      // For local simplicity, check standard coupons directly or query the server
      const code = couponCode.toUpperCase();
      if (code === 'EXPLORE15') {
        setCouponDiscount(15);
      } else if (code === 'WELCOME10') {
        setCouponDiscount(10);
      } else {
        setCouponError('Invalid or expired coupon code');
      }
    } catch (err) {
      setCouponError('Error applying coupon');
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Simulate declines if card number starts with '4000 0000 0000 0002' (standard stripe decline simulator behavior)
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
          type: activeBooking.type,
          details: activeBooking.details,
          totalPrice: originalPrice,
          couponCode: couponDiscount ? couponCode : undefined,
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

      setBookingRef(data.booking.id);
      setSuccess(true);
      onSuccess();
      setTimeout(() => {
        // Redirect to dashboard after checkout success
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-card border border-border p-6 shadow-2xl transition-all duration-300 animate-fade-in">
        
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
            <CreditCard className="h-6 w-6 text-primary" />
            <span>Secure Checkout</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Complete your booking transaction securely via encrypted gateway.
          </p>
        </div>

        {success ? (
          /* SUCCESS VIEW */
          <div className="text-center py-8 space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Booking Confirmed!</h3>
            <p className="text-sm text-muted-foreground px-4">
              Your transaction of **${discountedPrice.toFixed(2)}** was processed successfully.
              A booking confirmation has been logged to your account.
            </p>
            <div className="bg-muted p-3 rounded-xl inline-block">
              <span className="text-xs font-mono text-muted-foreground block uppercase tracking-wide">
                Booking Reference
              </span>
              <span className="text-sm font-mono font-bold text-foreground">{bookingRef}</span>
            </div>
            <p className="text-xs text-primary animate-pulse">Redirecting to your Dashboard...</p>
          </div>
        ) : (
          /* PAYMENT FORM */
          <div className="space-y-6">
            
            {/* Booking Summary */}
            <div className="rounded-xl border border-border/80 bg-accent/40 p-4">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Booking Summary ({activeBooking.type})
              </span>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-foreground">
                  {activeBooking.type === 'FLIGHT' 
                    ? `Flight ${activeBooking.details.flightNumber} (${activeBooking.details.airline})`
                    : activeBooking.type === 'HOTEL'
                      ? `${activeBooking.details.name} at ${activeBooking.details.location}`
                      : 'Custom Holiday Package'}
                </span>
                <span className="text-sm font-bold text-foreground">${originalPrice}</span>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Apply Coupon (Try: **EXPLORE15**)
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-grow">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Ticket className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background/50 pl-10 pr-3 py-2 text-sm text-foreground focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  className="rounded-xl bg-accent px-4 py-2 text-sm font-medium hover:bg-muted transition-colors border border-border"
                >
                  Apply
                </button>
              </div>
              {couponDiscount && (
                <p className="text-xs text-emerald-500 font-medium">
                  Coupon applied! Discount of {couponDiscount}% added.
                </p>
              )}
              {couponError && <p className="text-xs text-destructive">{couponError}</p>}
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
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2.5 text-sm text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                  Card Number (Use `4000 0000 0000 0002` to simulate decline)
                </label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4000 1234 5678 9010"
                  className="w-full rounded-xl border border-input bg-background/50 px-3 py-2.5 text-sm text-foreground focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full rounded-xl border border-input bg-background/50 px-3 py-2.5 text-sm text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={3}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="•••"
                    className="w-full rounded-xl border border-input bg-background/50 px-3 py-2.5 text-sm text-foreground focus:outline-none"
                  />
                </div>
              </div>

              {/* Price Details & Submit */}
              <div className="border-t border-border mt-6 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider block">Total Amount</span>
                  <span className="text-xl font-bold text-foreground">${discountedPrice.toFixed(2)}</span>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:brightness-110 disabled:opacity-50 transition-all duration-200"
                >
                  {loading ? 'Processing...' : 'Pay & Confirm'}
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
