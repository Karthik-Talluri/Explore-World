import { Router, Response } from 'express';
import prisma from '../db';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

console.log("packages.routes.ts loaded");
router.get("/", async (req, res) => {
  try {
    const packages = await prisma.tourPackage.findMany({
      where: { active: true },
      include: {
        reviews: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { price: "asc" }
    });

    const formatted = packages.map(p => ({
      ...p,
      images: JSON.parse(p.images),
      itinerary: JSON.parse(p.itinerary),
      availableDates: JSON.parse(p.availableDates),
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Static high-quality images for seeding
const TRAVEL_IMAGES = {
  NATIONAL: [
    'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=800&auto=format&fit=crop&q=80', // Kashmir
    'https://images.unsplash.com/photo-1596760401497-2705d8f6d6c8?w=800&auto=format&fit=crop&q=80', // Goa
    'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&auto=format&fit=crop&q=80', // Kerala
    'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&auto=format&fit=crop&q=80', // Ladakh
  ],
  INTERNATIONAL: [
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80', // Dubai
    'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&auto=format&fit=crop&q=80', // Maldives
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80', // Bali
    'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800&auto=format&fit=crop&q=80', // Switzerland
  ]
};

// Helper to generate a realistic package dynamically if missing
async function getOrCreateMockPackage(destName: string): Promise<any> {
  const normDest = destName.trim().toLowerCase();

  let pkg: any = await prisma.tourPackage.findFirst({
    where: { destination: { contains: normDest } },
    include: { reviews: { include: { user: { select: { name: true } } } } }
  });

  if (!pkg) {
    const capDest = destName.charAt(0).toUpperCase() + destName.slice(1);

    // Categorize
    const isInternational = [
      'dubai', 'maldives', 'bali', 'singapore', 'thailand', 'malaysia', 'vietnam', 'indonesia', 'japan',
      'south korea', 'china', 'sri lanka', 'nepal', 'bhutan', 'turkey', 'switzerland', 'france', 'italy',
      'spain', 'greece', 'united kingdom', 'germany', 'norway', 'finland', 'iceland', 'australia',
      'new zealand', 'canada', 'united states', 'mexico', 'egypt', 'south africa'
    ].includes(normDest);

    const category = isInternational ? 'INTERNATIONAL' : 'NATIONAL';
    const visa = isInternational ? 'Visa Required / eVisa' : 'Not Required';
    const currency = isInternational ? 'USD / Local' : 'INR';
    const weather = isInternational ? '22°C - Sunny' : '18°C - Mild';
    const price = isInternational ? 1200 + Math.floor(Math.random() * 1500) : 350 + Math.floor(Math.random() * 500);
    const duration = 5 + Math.floor(Math.random() * 4);
    const type = ['Luxury', 'Honeymoon', 'Adventure', 'Family', 'Solo', 'Group', 'Budget'][Math.floor(Math.random() * 7)];
    const bestSeason = isInternational ? 'November to April' : 'October to March';
    const imgList = isInternational ? TRAVEL_IMAGES.INTERNATIONAL : TRAVEL_IMAGES.NATIONAL;
    const images = JSON.stringify([imgList[Math.floor(Math.random() * 4)], imgList[Math.floor(Math.random() * 4)]]);

    const itineraryData = Array.from({ length: duration }).map((_, i) => ({
      day: i + 1,
      title: `Day ${i + 1}: Exploring Highlights`,
      description: `Embark on a customized sightseeing route of the top tourist hotspots in ${capDest}. Includes transfers, buffet breakfast, and guide.`
    }));

    pkg = await prisma.tourPackage.create({
      data: {
        name: `Signature ${capDest} Getaway`,
        category,
        destination: capDest,
        price,
        durationDays: duration,
        bestSeason,
        attractions: `${capDest} Center, Local Markets, Scenic Overlooks`,
        hotelDetails: `4★ Premium Resort (Free Upgrade)`,
        mealPlan: `Breakfast & Dinner Included`,
        transportation: `Private Luxury Sedan / Coach Transfer`,
        itinerary: JSON.stringify(itineraryData),
        visaRequirement: visa,
        currency,
        weather,
        inclusions: 'Luxury stay,Airport pickup/drop,Private driver,Daily buffet meals,Entry tickets',
        exclusions: 'International flights,Personal spending,Tips and porterage,Travel insurance',
        rating: 4.5 + Math.random() * 0.5,
        availableDates: JSON.stringify(['2026-07-15', '2026-08-10', '2026-09-05']),
        images,
        type,
        active: true,
      },
    });

    // Fetch again with empty reviews relation
    pkg = await prisma.tourPackage.findUnique({
      where: { id: pkg.id },
      include: { reviews: { include: { user: { select: { name: true } } } } }
    });
  }

  return pkg;
}

// Search Tour Packages
router.get('/search', async (req, res) => {
  try {
    const { destination, category, type, maxPrice, maxDuration } = req.query;

    const filters: any = { active: true };

    if (category) {
      filters.category = String(category).toUpperCase();
    }
    if (type) {
      filters.type = String(type);
    }
    if (maxPrice) {
      filters.price = { lte: Number(maxPrice) };
    }
    if (maxDuration) {
      filters.durationDays = { lte: Number(maxDuration) };
    }

    if (destination) {
      filters.destination = { contains: String(destination) };
    }

    // Try finding existing packages
    let packages = await prisma.tourPackage.findMany({
      where: filters,
      include: { reviews: { include: { user: { select: { name: true } } } } },
      orderBy: { price: 'asc' },
    });

    // If searched destination returned nothing, try dynamically generating a package
    if (packages.length === 0 && destination) {
      const generated = await getOrCreateMockPackage(String(destination));
      if (generated) {
        packages = [generated];
      }
    }

    // Parse image and date strings
    const formatted = packages.map(p => ({
      ...p,
      images: JSON.parse(p.images),
      itinerary: JSON.parse(p.itinerary),
      availableDates: JSON.parse(p.availableDates),
    }));

    return res.json(formatted);
  } catch (error) {
    console.error("FULL ERROR:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: String(error)
    });
  });

// Get package by ID
router.get('/:id', async (req, res) => {
  try {
    const pkg = await prisma.tourPackage.findUnique({
      where: { id: req.params.id },
      include: {
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!pkg) {
      return res.status(404).json({ message: 'Tour package not found' });
    }

    return res.json({
      ...pkg,
      images: JSON.parse(pkg.images),
      itinerary: JSON.parse(pkg.itinerary),
      availableDates: JSON.parse(pkg.availableDates),
    });
  } catch (error) {
    console.error('Get package error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Submit Inquiry
router.post('/:id/inquire', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        name,
        email,
        message,
        packageId: req.params.id,
      },
    });

    console.log(`
      [NEW CUSTOMER INQUIRY LEAD]
      Package ID: ${req.params.id}
      Customer Name: ${name} (${email})
      Message: "${message}"
    `);

    return res.status(201).json({ message: 'Inquiry submitted successfully', inquiry });
  } catch (error) {
    console.error('Submit inquiry error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Add Review
router.post('/:id/reviews', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const packageId = req.params.id;
    const userId = req.user?.id;
    const { rating, comment } = req.body;

    if (!rating || !comment || !userId) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    const review = await prisma.review.create({
      data: {
        userId,
        packageId,
        rating: Number(rating),
        comment,
      },
      include: { user: { select: { name: true } } }
    });

    // Update package rating average
    const allReviews = await prisma.review.findMany({ where: { packageId } });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.tourPackage.update({
      where: { id: packageId },
      data: { rating: Number(avgRating.toFixed(1)) }
    });

    return res.status(201).json(review);
  } catch (error) {
    console.error('Add review error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
