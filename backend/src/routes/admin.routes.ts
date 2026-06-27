import { Router, Response } from 'express';
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

// List all bookings
router.get('/bookings', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { name: true, email: true } },
        package: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = bookings.map(b => ({
      ...b,
      package: {
        ...b.package,
        images: JSON.parse(b.package.images),
        itinerary: JSON.parse(b.package.itinerary),
      }
    }));

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

export default router;
