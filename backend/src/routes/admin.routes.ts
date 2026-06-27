import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateJWT, requireAdmin, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// Apply auth middlewares globally to all admin routes
router.use(authenticateJWT);
router.use(requireAdmin);

// Get Platform Statistics
router.get('/stats', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalBookings = await prisma.booking.count();
    const totalUsers = await prisma.user.count({ where: { role: 'USER' } });
    
    // Calculate total revenue
    const paidBookings = await prisma.booking.findMany({
      where: { paymentStatus: 'PAID' },
      select: { totalPrice: true },
    });
    const totalRevenue = paidBookings.reduce((sum, b) => sum + b.totalPrice, 0);

    // Bookings breakdown by type
    const flightsCount = await prisma.booking.count({ where: { type: 'FLIGHT' } });
    const hotelsCount = await prisma.booking.count({ where: { type: 'HOTEL' } });
    const packagesCount = await prisma.booking.count({ where: { type: 'PACKAGE' } });

    // Recent bookings (last 5)
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    const parsedRecentBookings = recentBookings.map(b => ({
      ...b,
      details: JSON.parse(b.details),
    }));

    return res.json({
      summary: {
        totalBookings,
        totalUsers,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        breakdown: {
          flights: flightsCount,
          hotels: hotelsCount,
          packages: packagesCount,
        },
      },
      recentBookings: parsedRecentBookings,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get All Bookings
router.get('/bookings', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    const formattedBookings = bookings.map(b => ({
      ...b,
      details: JSON.parse(b.details),
    }));

    return res.json(formattedBookings);
  } catch (error) {
    console.error('Admin fetch bookings error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get All Users
router.get('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(users);
  } catch (error) {
    console.error('Admin fetch users error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Add a Hotel
router.post('/hotels', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, location, description, rating, pricePerNight, images, amenities, latitude, longitude } = req.body;

    if (!name || !location || !pricePerNight) {
      return res.status(400).json({ message: 'Name, location, and pricePerNight are required' });
    }

    const hotel = await prisma.hotel.create({
      data: {
        name,
        location,
        description: description || '',
        rating: Number(rating) || 4.0,
        pricePerNight: Number(pricePerNight),
        images: JSON.stringify(images || []),
        amenities: amenities || '',
        latitude: Number(latitude) || 0.0,
        longitude: Number(longitude) || 0.0,
      },
    });

    return res.status(201).json(hotel);
  } catch (error) {
    console.error('Admin create hotel error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Add a Flight
router.post('/flights', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { flightNumber, airline, departureCity, arrivalCity, departureTime, arrivalTime, price, seatClass, availableSeats, stops } = req.body;

    if (!flightNumber || !airline || !departureCity || !arrivalCity || !price) {
      return res.status(400).json({ message: 'Flight number, airline, departure/arrival cities, and price are required' });
    }

    const flight = await prisma.flight.create({
      data: {
        flightNumber,
        airline,
        departureCity: departureCity.toUpperCase(),
        arrivalCity: arrivalCity.toUpperCase(),
        departureTime: new Date(departureTime),
        arrivalTime: new Date(arrivalTime),
        price: Number(price),
        class: seatClass || 'Economy',
        availableSeats: Number(availableSeats) || 60,
        stops: Number(stops) || 0,
      },
    });

    return res.status(201).json(flight);
  } catch (error) {
    console.error('Admin create flight error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Add Coupon
router.post('/coupons', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code, discountPercent, active } = req.body;

    if (!code || !discountPercent) {
      return res.status(400).json({ message: 'Code and discountPercent are required' });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountPercent: Number(discountPercent),
        active: active !== undefined ? active : true,
      },
    });

    return res.status(201).json(coupon);
  } catch (error) {
    console.error('Admin create coupon error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
