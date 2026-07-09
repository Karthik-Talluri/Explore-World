import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware globally to all guide routes
router.use(authenticateJWT);

// Helper to check if user is a tour guide and return the guide profile
const getTourGuideProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return null;
  }

  if (userRole !== 'GUIDE' && userRole !== 'TOUR_GUIDE') {
    res.status(403).json({ message: 'Forbidden: Guide access required' });
    return null;
  }

  const guide = await prisma.tourGuide.findUnique({
    where: { userId },
    include: { user: { select: { name: true, email: true, role: true } } },
  });

  if (!guide) {
    res.status(403).json({ message: 'Forbidden: Guide profile not found' });
    return null;
  }

  return guide;
};

// Get Tour Guide Dashboard Statistics and Assignments
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const guide = await getTourGuideProfile(req, res);
    if (!guide) return;

    // Fetch all assignments for this guide
    const assignments = await prisma.guideAssignment.findMany({
      where: { guideId: guide.id },
      include: {
        booking: {
          include: {
            user: { select: { name: true, email: true } },
            package: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let totalAssigned = 0;
    let todayTours = 0;
    let upcomingTours = 0;
    let completedTours = 0;
    let pendingRequests = 0;
    let monthlyEarnings = 0;

    const formattedAssignments = assignments.map((asg) => {
      const travelDateStr = asg.booking.travelDate.toISOString().split('T')[0];
      const isToday = travelDateStr === todayStr;
      const isUpcoming = asg.booking.travelDate > now && asg.status !== 'COMPLETED' && asg.status !== 'REJECTED';

      totalAssigned++;
      if (isToday && asg.status !== 'REJECTED') todayTours++;
      if (isUpcoming) upcomingTours++;
      if (asg.status === 'COMPLETED') completedTours++;
      if (asg.status === 'PENDING') pendingRequests++;

      // Monthly Earnings: 10% of booking price for completed bookings in current month
      const bookingMonth = asg.booking.travelDate.getMonth();
      const bookingYear = asg.booking.travelDate.getFullYear();
      if (asg.status === 'COMPLETED' && bookingMonth === currentMonth && bookingYear === currentYear) {
        monthlyEarnings += asg.booking.totalPrice * 0.1;
      }

      // Parse package JSON fields safely
      let parsedImages = [];
      let parsedItinerary = [];
      try {
        parsedImages = JSON.parse(asg.booking.package.images);
      } catch (e) {
        parsedImages = [asg.booking.package.images];
      }
      try {
        parsedItinerary = JSON.parse(asg.booking.package.itinerary);
      } catch (e) {
        parsedItinerary = [];
      }

      return {
        id: asg.id,
        status: asg.status,
        rating: asg.rating,
        feedback: asg.feedback,
        createdAt: asg.createdAt,
        booking: {
          id: asg.booking.id,
          travelDate: asg.booking.travelDate,
          travelersCount: asg.booking.travelersCount,
          roomType: asg.booking.roomType,
          specialRequests: asg.booking.specialRequests,
          pickupLocation: asg.booking.pickupLocation,
          contactNumber: asg.booking.contactNumber,
          totalPrice: asg.booking.totalPrice,
          status: asg.booking.status,
          invoiceId: asg.booking.invoiceId,
          user: asg.booking.user,
          package: {
            id: asg.booking.package.id,
            name: asg.booking.package.name,
            destination: asg.booking.package.destination,
            price: asg.booking.package.price,
            durationDays: asg.booking.package.durationDays,
            hotelDetails: asg.booking.package.hotelDetails,
            mealPlan: asg.booking.package.mealPlan,
            transportation: asg.booking.package.transportation,
            images: parsedImages,
            itinerary: parsedItinerary,
          },
        },
      };
    });

    return res.json({
      guide: {
        id: guide.id,
        name: guide.user.name,
        email: guide.user.email,
        specialization: guide.specialization,
        availability: guide.availability,
      },
      stats: {
        totalAssigned,
        todayTours,
        upcomingTours,
        completedTours,
        pendingRequests,
        monthlyEarnings: Number(monthlyEarnings.toFixed(2)),
      },
      assignments: formattedAssignments,
    });
  } catch (error) {
    console.error('Fetch guide dashboard error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update booking assignment status (Accept / Reject / Start / Complete Tour)
router.put('/assignments/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const guide = await getTourGuideProfile(req, res);
    if (!guide) return;

    const assignmentId = req.params.id;
    const { status, reason } = req.body;

    if (!['ACCEPTED', 'REJECTED', 'STARTED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid assignment status' });
    }

    const assignment = await prisma.guideAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.guideId !== guide.id) {
      return res.status(403).json({ message: 'Forbidden: You do not own this assignment' });
    }

    const updated = await prisma.guideAssignment.update({
      where: { id: assignmentId },
      data: { status: status === 'CANCELLED' ? 'CANCELLED' : status },
      include: {
        booking: {
          include: {
            user: { select: { name: true, email: true } },
            package: true,
          },
        },
      },
    });

    // Handle booking status updates based on guide actions
    if (status === 'ACCEPTED') {
      await prisma.booking.update({
        where: { id: updated.bookingId },
        data: { status: 'Guide Accepted' }
      });
    } else if (status === 'STARTED') {
      await prisma.booking.update({
        where: { id: updated.bookingId },
        data: { status: 'Tour Started' }
      });
    } else if (status === 'COMPLETED') {
      await prisma.booking.update({
        where: { id: updated.bookingId },
        data: { status: 'Tour Completed' }
      });
    } else if (status === 'CANCELLED') {
      const currentSpecialRequests = updated.booking.specialRequests || '';
      const newSpecialRequests = currentSpecialRequests 
        ? `${currentSpecialRequests} | Guide Cancellation: ${reason || 'No reason specified'}`
        : `Guide Cancellation: ${reason || 'No reason specified'}`;
      await prisma.booking.update({
        where: { id: updated.bookingId },
        data: {
          status: 'CANCELLED',
          specialRequests: newSpecialRequests
        }
      });
    } else if (status === 'REJECTED') {
      const currentList = updated.booking.rejectedGuides || '';
      const newList = currentList ? `${currentList},${assignment.guideId}` : assignment.guideId;
      await prisma.booking.update({
        where: { id: updated.bookingId },
        data: { rejectedGuides: newList }
      });

      await assignNextGuide(updated.bookingId);
    }

    return res.json({
      message: `Assignment marked as ${status.toLowerCase()}`,
      assignment: updated,
    });
  } catch (error) {
    console.error('Update assignment status error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Toggle availability (Online/Offline status)
router.put('/profile', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const guide = await prisma.tourGuide.findUnique({
      where: { userId: req.user?.id }
    });
    if (!guide) {
      return res.status(404).json({ message: 'Guide profile not found' });
    }

    const { availability } = req.body;
    if (availability === undefined) {
      return res.status(400).json({ message: 'Availability status is required' });
    }

    const updated = await prisma.tourGuide.update({
      where: { id: guide.id },
      data: { availability: Boolean(availability) }
    });

    return res.json({
      message: `Status updated to ${updated.availability ? 'Online' : 'Offline'}`,
      guide: updated
    });
  } catch (error) {
    console.error('Update guide availability error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Helper function to automatically reassign rejected tours to another available guide
async function assignNextGuide(bookingId: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { package: true }
    });
    if (!booking) return;

    const pkg = booking.package;

    // Find all guides who are online (availability = true)
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

    // Find all guides who have already rejected this specific booking
    const rejectedGuideIds = (booking.rejectedGuides || '')
      .split(',')
      .map(id => id.trim())
      .filter(Boolean);

    // Filter matching available guides
    const availableGuides = guides.filter((g) => {
      // Exclude guides who already rejected
      if (rejectedGuideIds.includes(g.id)) return false;

      // Specialization check (handling partial matches like Kashmir vs Jammu and Kashmir)
      const specList = g.specialization.toLowerCase().split(',').map(s => s.trim());
      const dest = pkg.destination.toLowerCase();
      const matchesDest = specList.some(spec => dest.includes(spec) || spec.includes(dest)) ||
                          g.specialization.toLowerCase().includes(dest) ||
                          dest.includes(g.specialization.toLowerCase());
      if (!matchesDest) return false;

      // Overlapping booking check on same date
      const hasOverlap = g.assignments.some((asg) => {
        const asgDate = new Date(asg.booking.travelDate).toDateString();
        const bookingDate = new Date(booking.travelDate).toDateString();
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
      const selectedGuide = availableGuides[0];

      // Update the single unique assignment record
      await prisma.guideAssignment.update({
        where: { bookingId },
        data: {
          guideId: selectedGuide.id,
          status: 'PENDING',
        }
      });

      // Update booking status to Waiting for Guide Acceptance
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'Waiting for Guide Acceptance' }
      });

      console.log(`Auto-reassigned guide ${selectedGuide.id} to booking ${bookingId} after rejection`);
    } else {
      // If no other available guides, delete the assignment and mark booking as "Waiting for Guide"
      await prisma.guideAssignment.delete({
        where: { bookingId }
      });
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'Waiting for Guide' }
      });
      console.log(`No other available guides found for booking ${bookingId} after rejection. Marked as Waiting for Guide.`);
    }
  } catch (error) {
    console.error('Error reassigning guide:', error);
  }
}

export default router;
