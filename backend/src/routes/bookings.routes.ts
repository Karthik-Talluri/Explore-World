import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// Create booking (checkout)
router.post('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { type, details, totalPrice, couponCode, paymentMethodId } = req.body;

    if (!userId || !type || !details || !totalPrice) {
      return res.status(400).json({ message: 'Type, details, and totalPrice are required' });
    }

    let finalPrice = totalPrice;

    // Process coupon code if present
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode },
      });
      if (coupon && coupon.active) {
        finalPrice = totalPrice * (1 - coupon.discountPercent / 100);
      }
    }

    // Stripe checkout simulation
    let paymentStatus = 'PAID';
    if (paymentMethodId === 'pm_card_chargeDeclined') {
      paymentStatus = 'FAILED';
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        type,
        details: JSON.stringify(details),
        totalPrice: Number(finalPrice.toFixed(2)),
        status: paymentStatus === 'PAID' ? 'CONFIRMED' : 'PENDING',
        paymentStatus,
      },
    });

    // Mock Booking Confirmation Email Logging
    const user = await prisma.user.findUnique({ where: { id: userId } });
    console.log(`
      =======================================================
      EMAIL SENT TO: ${user?.email}
      SUBJECT: Booking Confirmation - Explore World
      -------------------------------------------------------
      Dear ${user?.name},

      Your travel booking (${type}) has been successfully processed!
      Booking Reference ID: ${booking.id}
      Total Amount Paid: $${booking.totalPrice}
      Status: ${booking.status}

      Thank you for choosing Explore World!
      =======================================================
    `);

    return res.status(201).json({
      message: paymentStatus === 'PAID' ? 'Booking confirmed successfully' : 'Payment failed. Booking pending.',
      booking,
    });
  } catch (error) {
    console.error('Booking checkout error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get User's booking history
router.get('/history', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const bookings = await prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Parse the details field back into objects
    const formattedBookings = bookings.map(b => ({
      ...b,
      details: JSON.parse(b.details),
    }));

    return res.json(formattedBookings);
  } catch (error) {
    console.error('Fetch booking history error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Cancel a booking
router.post('/cancel/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const bookingId = req.params.id;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden: You do not own this booking' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
      },
    });

    return res.json({
      message: 'Booking cancelled successfully',
      booking: {
        ...updatedBooking,
        details: JSON.parse(updatedBooking.details),
      },
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
