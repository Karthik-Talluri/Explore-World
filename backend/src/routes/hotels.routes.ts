import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

const HOTEL_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&auto=format&fit=crop&q=80'
];

const AMENITIES_LIST = ['Free WiFi', 'Swimming Pool', 'Spa & Wellness', 'Fitness Center', 'Restaurant', 'Bar', 'Room Service', 'Air Conditioning'];

// Helper to seed hotels for a queried location if none exist
async function getOrCreateMockHotels(location: string) {
  const normalizedLocation = location.trim().toLowerCase();

  // Find hotels in DB
  let hotels = await prisma.hotel.findMany({
    where: {
      location: { contains: normalizedLocation }
    },
    include: { reviews: { include: { user: { select: { name: true } } } } }
  });

  if (hotels.length === 0) {
    const capitalizedLocation = location.charAt(0).toUpperCase() + location.slice(1);
    const mockHotelsData = [
      {
        name: `Grand Royal Palace`,
        location: capitalizedLocation,
        description: `Experience luxury at the heart of ${capitalizedLocation}. Fully furnished suites, award-winning fine dining restaurants, and a world-class wellness center await your arrival.`,
        rating: 4.8,
        pricePerNight: 280,
        images: JSON.stringify([HOTEL_IMAGES[0], HOTEL_IMAGES[1]]),
        amenities: 'Free WiFi,Swimming Pool,Fitness Center,Restaurant,Room Service,Air Conditioning',
        latitude: 48.8566 + (Math.random() - 0.5) * 0.05, // approximate location (Paris center default offset)
        longitude: 2.3522 + (Math.random() - 0.5) * 0.05
      },
      {
        name: `Serenity Boutique Resort`,
        location: capitalizedLocation,
        description: `A tranquil escape from the city. Beautiful minimalist architecture surrounded by lush gardens, featuring an infinity pool overlooking panoramic views.`,
        rating: 4.6,
        pricePerNight: 190,
        images: JSON.stringify([HOTEL_IMAGES[2], HOTEL_IMAGES[3]]),
        amenities: 'Free WiFi,Swimming Pool,Spa & Wellness,Bar,Air Conditioning',
        latitude: 48.8566 + (Math.random() - 0.5) * 0.05,
        longitude: 2.3522 + (Math.random() - 0.5) * 0.05
      },
      {
        name: `Urban Pulse Suites`,
        location: capitalizedLocation,
        description: `Modern, tech-integrated rooms designed for the contemporary traveler. Located walking distance from top attractions and vibrant nightlife.`,
        rating: 4.3,
        pricePerNight: 120,
        images: JSON.stringify([HOTEL_IMAGES[1], HOTEL_IMAGES[3]]),
        amenities: 'Free WiFi,Fitness Center,Restaurant,Bar,Air Conditioning',
        latitude: 48.8566 + (Math.random() - 0.5) * 0.05,
        longitude: 2.3522 + (Math.random() - 0.5) * 0.05
      }
    ];

    for (const h of mockHotelsData) {
      await prisma.hotel.create({ data: h });
    }

    hotels = await prisma.hotel.findMany({
      where: {
        location: { contains: normalizedLocation }
      },
      include: { reviews: { include: { user: { select: { name: true } } } } }
    });
  }

  return hotels;
}

// Search Hotels
router.get('/search', async (req, res) => {
  try {
    const { location } = req.query;

    if (!location) {
      return res.status(400).json({ message: 'Parameter "location" is required' });
    }

    const hotels = await getOrCreateMockHotels(String(location));
    return res.json(hotels);
  } catch (error) {
    console.error('Hotel search error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Hotel details by ID
router.get('/:id', async (req, res) => {
  try {
    const hotel = await prisma.hotel.findUnique({
      where: { id: req.params.id },
      include: {
        reviews: {
          include: {
            user: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    return res.json(hotel);
  } catch (error) {
    console.error('Get hotel error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Add Review for Hotel
router.post('/:id/reviews', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const hotelId = req.params.id;
    const userId = req.user?.id;
    const { rating, comment } = req.body;

    if (!rating || !comment || !userId) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const review = await prisma.review.create({
      data: {
        userId,
        hotelId,
        rating: Number(rating),
        comment,
      },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    // Update hotel average rating
    const allReviews = await prisma.review.findMany({
      where: { hotelId }
    });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.hotel.update({
      where: { id: hotelId },
      data: { rating: Number(avgRating.toFixed(1)) }
    });

    return res.status(201).json(review);
  } catch (error) {
    console.error('Add review error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
