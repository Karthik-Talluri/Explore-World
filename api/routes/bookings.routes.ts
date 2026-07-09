import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// Create booking (secure tour checkout)
router.post('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { packageId, travelDate, travelersCount, roomType, specialRequests, pickupLocation, contactNumber, paymentMethodId } = req.body;

    if (!userId || !packageId || !travelDate || !travelersCount || !roomType) {
      return res.status(400).json({ message: 'All booking fields are required' });
    }

    const pkg = await prisma.tourPackage.findUnique({ where: { id: packageId } });
    if (!pkg) {
      return res.status(404).json({ message: 'Tour package not found' });
    }

    // Pricing calculation
    let basePrice = pkg.price;
    // Room type modifiers: Double (+10%), Suite (+30%)
    let modifier = 1.0;
    if (roomType === 'Double') modifier = 1.1;
    else if (roomType === 'Suite') modifier = 1.3;

    const totalPrice = Number((basePrice * Number(travelersCount) * modifier).toFixed(2));

    // Stripe checkout simulation
    let paymentStatus = 'PAID';
    if (paymentMethodId === 'pm_card_chargeDeclined') {
      paymentStatus = 'FAILED';
    }

    const invoiceId = `INV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // Guide auto-assignment logic
    let selectedGuide = null;
    if (paymentStatus === 'PAID') {
      const guides = await prisma.tourGuide.findMany({
        where: { availability: true },
        include: {
          assignments: {
            include: {
              booking: true
            }
          }
        }
      });

      // Filter guides specializing in this destination (handling partial matches like Kashmir vs Jammu and Kashmir)
      const matchedGuides = guides.filter((g) => {
        const specList = g.specialization.toLowerCase().split(',').map(s => s.trim());
        const dest = pkg.destination.toLowerCase();
        return specList.some(spec => dest.includes(spec) || spec.includes(dest)) ||
               g.specialization.toLowerCase().includes(dest) ||
               dest.includes(g.specialization.toLowerCase());
      });

      // Filter out guides who already have an active tour on this date
      const availableGuides = matchedGuides.filter((g) => {
        const hasOverlap = g.assignments.some((asg) => {
          const asgDate = new Date(asg.booking.travelDate).toDateString();
          const bookingDate = new Date(travelDate).toDateString();
          return asgDate === bookingDate && asg.status !== 'REJECTED' && asg.status !== 'COMPLETED';
        });
        return !hasOverlap;
      });

      if (availableGuides.length > 0) {
        // Sort by fewest active assignments (distribute workload evenly)
        availableGuides.sort((a, b) => {
          const countA = a.assignments.filter(asg => asg.status !== 'REJECTED' && asg.status !== 'COMPLETED').length;
          const countB = b.assignments.filter(asg => asg.status !== 'REJECTED' && asg.status !== 'COMPLETED').length;
          return countA - countB;
        });
        selectedGuide = availableGuides[0];
      }
    }

    let initialBookingStatus = 'CONFIRMED';
    if (paymentStatus === 'PAID') {
      initialBookingStatus = selectedGuide ? 'Waiting for Guide Acceptance' : 'Waiting for Guide';
    } else {
      initialBookingStatus = 'PENDING';
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        packageId,
        travelDate: new Date(travelDate),
        travelersCount: Number(travelersCount),
        roomType,
        specialRequests: specialRequests || '',
        pickupLocation: pickupLocation || 'Hotel Lobby / Airport',
        contactNumber: contactNumber || '+1-555-0199',
        totalPrice,
        status: initialBookingStatus,
        paymentStatus,
        invoiceId,
      },
      include: {
        package: true,
      }
    });

    if (selectedGuide) {
      await prisma.guideAssignment.create({
        data: {
          bookingId: booking.id,
          guideId: selectedGuide.id,
          status: 'PENDING',
        }
      });
      console.log(`Auto-assigned guide ${selectedGuide.id} to booking ${booking.id}`);
    } else {
      console.log(`No available guides found for destination ${pkg.destination} on date ${new Date(travelDate).toLocaleDateString()}`);
    }

    // Console Log Simulated Email Confirmation
    const user = await prisma.user.findUnique({ where: { id: userId } });
    console.log(`
      =======================================================
      EMAIL SENT TO: ${user?.email}
      SUBJECT: Tour Booking Confirmation - ${pkg.name}
      -------------------------------------------------------
      Dear ${user?.name},

      Your tour reservation has been processed successfully!
      Invoice Reference: ${invoiceId}
      Tour Package: ${pkg.name}
      Travel Date: ${new Date(travelDate).toLocaleDateString()}
      Travelers: ${travelersCount}
      Room Type: ${roomType}
      Total Price Paid: $${totalPrice}
      Status: ${booking.status}

      Thank you for choosing Explore World!
      =======================================================
    `);

    return res.status(201).json({
      message: paymentStatus === 'PAID' ? 'Booking confirmed' : 'Payment failed. Booking pending.',
      booking,
    });
  } catch (error) {
    console.error('Booking checkout error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get User's bookings
router.get('/history', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        package: true,
        guideAssignment: {
          include: {
            guide: {
              include: {
                user: { select: { name: true, email: true } }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format output
    const formatted = await Promise.all(bookings.map(async (b) => {
      let guideAvgRating = 5.0;
      let guidePhone = '+1-555-0199'; // default mock phone
      if (b.guideAssignment) {
        const guideId = b.guideAssignment.guideId;
        const allGuideAssignments = await prisma.guideAssignment.findMany({
          where: { guideId, rating: { not: null } },
          select: { rating: true }
        });
        if (allGuideAssignments.length > 0) {
          const totalRating = allGuideAssignments.reduce((sum, a) => sum + (a.rating || 0), 0);
          guideAvgRating = Number((totalRating / allGuideAssignments.length).toFixed(1));
        }
        
        const email = b.guideAssignment.guide.user.email;
        if (email === 'guide@exploreworld.com') guidePhone = '+1-555-0122';
        else if (email === 'guide2@exploreworld.com') guidePhone = '+1-555-0244';
        else if (email === 'kashmirguide@exploreworld.com') guidePhone = '+1-555-0899';
      }

      return {
        ...b,
        package: {
          ...b.package,
          images: JSON.parse(b.package.images),
          itinerary: JSON.parse(b.package.itinerary),
        },
        guideAssignment: b.guideAssignment ? {
          ...b.guideAssignment,
          guide: {
            ...b.guideAssignment.guide,
            phone: guidePhone,
            averageRating: guideAvgRating,
          }
        } : null
      };
    }));

    return res.json(formatted);
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
      return res.status(403).json({ message: 'Forbidden: Unauthorized cancel' });
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED' },
      include: { package: true }
    });

    return res.json({
      message: 'Booking cancelled successfully',
      booking: {
        ...updated,
        package: {
          ...updated.package,
          images: JSON.parse(updated.package.images),
          itinerary: JSON.parse(updated.package.itinerary),
        }
      },
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Rate tour guide for a completed assignment
router.post('/:id/rate-guide', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const bookingId = req.params.id;
    const { rating, feedback } = req.body;

    if (!userId || !rating) {
      return res.status(400).json({ message: 'Rating is required' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { guideAssignment: true }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden: You cannot rate this guide' });
    }

    if (!booking.guideAssignment) {
      return res.status(400).json({ message: 'No tour guide assigned to this booking' });
    }

    // Update assignment rating and feedback
    const updatedAssignment = await prisma.guideAssignment.update({
      where: { id: booking.guideAssignment.id },
      data: {
        rating: Number(rating),
        feedback: feedback || '',
      }
    });

    return res.json({
      message: 'Tour guide rated successfully',
      assignment: updatedAssignment,
    });
  } catch (error) {
    console.error('Rate guide error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
