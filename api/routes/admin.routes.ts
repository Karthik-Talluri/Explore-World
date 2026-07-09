import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db';
import { authenticateJWT, requireAdmin, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middlewares globally to all admin routes
router.use(authenticateJWT);
router.use(requireAdmin);

// Get Admin stats dashboard summary
router.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalBookings = await prisma.booking.count();
    const totalUsers = await prisma.user.count({ where: { role: 'USER' } });
    const totalPackages = await prisma.tourPackage.count();
    
    // Revenue
    const paidBookings = await prisma.booking.findMany({
      where: { paymentStatus: 'PAID' },
      select: { totalPrice: true },
    });
    const totalRevenue = paidBookings.reduce((sum, b) => sum + b.totalPrice, 0);

    // Breakdown
    const nationalCount = await prisma.tourPackage.count({ where: { category: 'NATIONAL' } });
    const internationalCount = await prisma.tourPackage.count({ where: { category: 'INTERNATIONAL' } });

    // Recent Bookings
    const recent = await prisma.booking.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        package: { select: { name: true } }
      }
    });

    return res.json({
      summary: {
        totalBookings,
        totalUsers,
        totalPackages,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        breakdown: {
          national: nationalCount,
          international: internationalCount,
        }
      },
      recentBookings: recent,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// List all bookings (with optional filters)
router.get('/bookings', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { destination, date, guideId, status } = req.query;

    const whereClause: any = {};

    if (status) {
      whereClause.status = status as string;
    }

    if (date) {
      const filterDate = new Date(date as string);
      if (!isNaN(filterDate.getTime())) {
        const startOfDay = new Date(filterDate.setUTCHours(0, 0, 0, 0));
        const endOfDay = new Date(filterDate.setUTCHours(23, 59, 59, 999));
        whereClause.travelDate = {
          gte: startOfDay,
          lte: endOfDay,
        };
      }
    }

    if (destination) {
      whereClause.package = {
        destination: {
          contains: destination as string,
          mode: 'insensitive',
        },
      };
    }

    if (guideId) {
      whereClause.guideAssignment = {
        guideId: guideId as string,
      };
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true } },
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

    const formatted = bookings.map(b => {
      let parsedImages = [];
      let parsedItinerary = [];
      try {
        parsedImages = JSON.parse(b.package.images);
      } catch (e) {
        parsedImages = [b.package.images];
      }
      try {
        parsedItinerary = JSON.parse(b.package.itinerary);
      } catch (e) {
        parsedItinerary = [];
      }
      return {
        ...b,
        package: {
          ...b.package,
          images: parsedImages,
          itinerary: parsedItinerary,
        }
      };
    });

    return res.json(formatted);
  } catch (error) {
    console.error('Admin list bookings error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// List all users
router.get('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(users);
  } catch (error) {
    console.error('Admin list users error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Add a tour package
router.post('/packages', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name, category, destination, price, durationDays, bestSeason, attractions,
      hotelDetails, mealPlan, transportation, itinerary, visaRequirement, currency,
      weather, inclusions, exclusions, images, type
    } = req.body;

    if (!name || !category || !destination || !price || !durationDays) {
      return res.status(400).json({ message: 'Name, category, destination, price, and duration are required' });
    }

    const pkg = await prisma.tourPackage.create({
      data: {
        name,
        category: category.toUpperCase(),
        destination,
        price: Number(price),
        durationDays: Number(durationDays),
        bestSeason: bestSeason || 'Year-round',
        attractions: attractions || '',
        hotelDetails: hotelDetails || 'Premium stay',
        mealPlan: mealPlan || 'All meals included',
        transportation: transportation || 'Luxury transfers',
        itinerary: JSON.stringify(itinerary || []),
        visaRequirement: visaRequirement || 'Not Required',
        currency: currency || 'INR',
        weather: weather || 'Pleasant',
        inclusions: inclusions || '',
        exclusions: exclusions || '',
        images: JSON.stringify(images || []),
        availableDates: JSON.stringify(['2026-07-15', '2026-08-10', '2026-09-05']),
        type: type || 'Luxury',
        active: true,
      },
    });

    return res.status(201).json(pkg);
  } catch (error) {
    console.error('Admin add package error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Toggle package status (enable/disable)
router.put('/packages/:id/toggle', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const pkg = await prisma.tourPackage.findUnique({ where: { id: req.params.id } });
    if (!pkg) return res.status(404).json({ message: 'Package not found' });

    const updated = await prisma.tourPackage.update({
      where: { id: req.params.id },
      data: { active: !pkg.active },
    });

    return res.json(updated);
  } catch (error) {
    console.error('Toggle package error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a tour package
router.delete('/packages/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.tourPackage.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    console.error('Delete package error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// List all reviews
router.get('/reviews', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { name: true, email: true } },
        package: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(reviews);
  } catch (error) {
    console.error('Admin fetch reviews error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a review
router.delete('/reviews/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) return res.status(404).json({ message: 'Review not found' });

    await prisma.review.delete({ where: { id: req.params.id } });

    // Update package rating average
    const packageId = review.packageId;
    const allReviews = await prisma.review.findMany({ where: { packageId } });
    const avgRating = allReviews.length > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
      : 4.5;

    await prisma.tourPackage.update({
      where: { id: packageId },
      data: { rating: Number(avgRating.toFixed(1)) }
    });

    return res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// List all tour guides with statistics
router.get('/guides', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const guides = await prisma.tourGuide.findMany({
      include: {
        user: { select: { name: true, email: true, role: true } },
        assignments: {
          include: {
            booking: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedGuides = guides.map((guide) => {
      let totalEarnings = 0;
      let activeBookings = 0;
      let completedTours = 0;
      let totalRatingCount = 0;
      let totalRatingSum = 0;

      guide.assignments.forEach((asg) => {
        if (asg.status === 'PENDING' || asg.status === 'ACCEPTED') {
          activeBookings++;
        }
        if (asg.status === 'COMPLETED') {
          completedTours++;
          totalEarnings += asg.booking.totalPrice * 0.1;
        }
        if (asg.rating) {
          totalRatingCount++;
          totalRatingSum += asg.rating;
        }
      });

      const avgRating = totalRatingCount > 0 ? Number((totalRatingSum / totalRatingCount).toFixed(1)) : 5.0;

      return {
        id: guide.id,
        userId: guide.userId,
        name: guide.user.name,
        email: guide.user.email,
        specialization: guide.specialization,
        availability: guide.availability,
        status: guide.status,
        phone: guide.phone,
        stats: {
          activeBookings,
          completedTours,
          totalAssignments: guide.assignments.length,
          totalEarnings: Number(totalEarnings.toFixed(2)),
          rating: avgRating,
        },
      };
    });

    return res.json(formattedGuides);
  } catch (error) {
    console.error('Admin list guides error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new tour guide
router.post('/guides', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password, specialization, availability } = req.body;

    if (!name || !email || !password || !specialization) {
      return res.status(400).json({ message: 'Name, email, password, and specialization are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'GUIDE',
        },
      });

      const guide = await tx.tourGuide.create({
        data: {
          userId: user.id,
          specialization,
          availability: availability !== undefined ? availability : true,
          status: 'APPROVED',
          phone: req.body.phone || '+1-555-0199',
        },
      });

      return { user, guide };
    });

    return res.status(201).json({
      message: 'Tour guide created successfully',
      guide: {
        id: result.guide.id,
        userId: result.user.id,
        name: result.user.name,
        email: result.user.email,
        specialization: result.guide.specialization,
        availability: result.guide.availability,
      },
    });
  } catch (error) {
    console.error('Admin create guide error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update tour guide
router.put('/guides/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, specialization, availability } = req.body;

    const guide = await prisma.tourGuide.findUnique({
      where: { id },
    });

    if (!guide) {
      return res.status(404).json({ message: 'Tour guide not found' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: guide.userId },
        data: {
          name: name !== undefined ? name : undefined,
          email: email !== undefined ? email : undefined,
        },
      });

      const updatedGuide = await tx.tourGuide.update({
        where: { id },
        data: {
          specialization: specialization !== undefined ? specialization : undefined,
          availability: availability !== undefined ? availability : undefined,
        },
      });

      return { user: updatedUser, guide: updatedGuide };
    });

    return res.json({
      message: 'Tour guide updated successfully',
      guide: {
        id: updated.guide.id,
        userId: updated.user.id,
        name: updated.user.name,
        email: updated.user.email,
        specialization: updated.guide.specialization,
        availability: updated.guide.availability,
      },
    });
  } catch (error) {
    console.error('Admin update guide error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete tour guide
router.delete('/guides/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const guide = await prisma.tourGuide.findUnique({
      where: { id },
    });

    if (!guide) {
      return res.status(404).json({ message: 'Tour guide not found' });
    }

    // Deleting the User automatically cascades and deletes the TourGuide because of schema relations
    await prisma.user.delete({
      where: { id: guide.userId },
    });

    return res.json({ message: 'Tour guide deleted successfully' });
  } catch (error) {
    console.error('Admin delete guide error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Reassign a booking's guide assignment
router.put('/assignments/reassign', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bookingId, guideId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: 'Booking ID is required' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if we are unassigning (guideId is null or empty)
    if (!guideId) {
      // Remove existing assignment if any
      await prisma.guideAssignment.deleteMany({
        where: { bookingId },
      });
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'Waiting for Guide' }
      });
      return res.json({ message: 'Booking unassigned successfully' });
    }

    const guide = await prisma.tourGuide.findUnique({
      where: { id: guideId },
    });

    if (!guide) {
      return res.status(404).json({ message: 'Tour guide not found' });
    }

    if (guide.status !== 'APPROVED') {
      return res.status(400).json({ message: 'Cannot assign a guide whose registration is not approved.' });
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.guideAssignment.findUnique({
      where: { bookingId },
    });

    let assignment;
    if (existingAssignment) {
      assignment = await prisma.guideAssignment.update({
        where: { bookingId },
        data: {
          guideId,
          status: 'PENDING', // reset to pending so new guide has to accept/reject
        },
      });
    } else {
      assignment = await prisma.guideAssignment.create({
        data: {
          bookingId,
          guideId,
          status: 'PENDING',
        },
      });
    }

    // Update booking status to Waiting for Guide Acceptance
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'Waiting for Guide Acceptance' }
    });

    return res.json({
      message: 'Guide reassigned successfully',
      assignment,
    });
  } catch (error) {
    console.error('Admin reassign guide error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Cancel a booking by Admin
router.put('/bookings/:id/cancel', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const currentSpecialRequests = booking.specialRequests || '';
    const newSpecialRequests = currentSpecialRequests 
      ? `${currentSpecialRequests} | Admin Cancellation: ${reason || 'No reason specified'}`
      : `Admin Cancellation: ${reason || 'No reason specified'}`;

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        specialRequests: newSpecialRequests
      }
    });

    // Also set any guide assignment status to CANCELLED
    await prisma.guideAssignment.updateMany({
      where: { bookingId: id },
      data: { status: 'CANCELLED' }
    });

    return res.json({ message: 'Booking cancelled by admin successfully', booking: updated });
  } catch (error) {
    console.error('Admin cancel booking error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// List all travellers (users with role 'USER')
router.get('/travellers', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const travellers = await prisma.user.findMany({
      where: { role: 'USER' },
      include: {
        bookings: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = travellers.map(t => ({
      id: t.id,
      name: t.name,
      email: t.email,
      createdAt: t.createdAt,
      bookingsCount: t.bookings.length,
      totalSpent: t.bookings.reduce((sum, b) => sum + b.totalPrice, 0)
    }));

    return res.json(formatted);
  } catch (error) {
    console.error('Admin list travellers error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a traveller
router.delete('/travellers/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id }
    });
    return res.json({ message: 'Traveller deleted successfully' });
  } catch (error) {
    console.error('Admin delete traveller error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Approve or Reject a guide registration
router.put('/guides/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const guide = await prisma.tourGuide.update({
      where: { id: req.params.id },
      data: { status }
    });

    return res.json({ message: `Guide registration ${status.toLowerCase()} successfully`, guide });
  } catch (error) {
    console.error('Admin update guide status error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
