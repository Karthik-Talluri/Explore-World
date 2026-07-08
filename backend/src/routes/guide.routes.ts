import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware globally to all guide routes
router.use(authenticateJWT);

// Helper to check if user is a tour guide and return the guide profile
const getTourGuideProfile = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return null;
  }

  const guide = await prisma.tourGuide.findUnique({
    where: { userId },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!guide) {
    res.status(403).json({ message: 'Forbidden: Tour Guide profile not found' });
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

// Update booking assignment status (Accept / Reject / Complete Tour)
router.put('/assignments/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const guide = await getTourGuideProfile(req, res);
    if (!guide) return;

    const assignmentId = req.params.id;
    const { status } = req.body;

    if (!['ACCEPTED', 'REJECTED', 'COMPLETED'].includes(status)) {
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
      data: { status },
      include: {
        booking: {
          include: {
            user: { select: { name: true, email: true } },
            package: true,
          },
        },
      },
    });

    return res.json({
      message: `Assignment marked as ${status.toLowerCase()}`,
      assignment: updated,
    });
  } catch (error) {
    console.error('Update assignment status error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
