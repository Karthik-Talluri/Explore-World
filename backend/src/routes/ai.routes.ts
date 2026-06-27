import { Router } from 'express';
import prisma from '../db';

const router = Router();

router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const query = message.toLowerCase();
    let reply = '';
    let suggestedPackages: any[] = [];

    // Simple keyword extraction for destinations
    const destinations = ['paris', 'london', 'tokyo', 'dubai', 'sydney', 'new york', 'kashmir', 'rajasthan', 'goa', 'kerala', 'maldives', 'bali', 'switzerland'];
    let matchedDestination = '';

    for (const dest of destinations) {
      if (query.includes(dest)) {
        matchedDestination = dest;
        break;
      }
    }

    if (matchedDestination) {
      const capDest = matchedDestination.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

      // Find packages matching destination in name or destination field
      const packages = await prisma.tourPackage.findMany({
        where: {
          OR: [
            { destination: { contains: matchedDestination } },
            { name: { contains: matchedDestination } },
          ],
          active: true,
        },
        take: 2,
      });

      suggestedPackages = packages.map(p => ({
        ...p,
        images: JSON.parse(p.images),
        itinerary: JSON.parse(p.itinerary),
      }));

      reply = `I have analyzed your interest in traveling to **${capDest}**! Here is a luxury customized tour package plan for you:

We have prepared high-end itineraries featuring premium hotel stays, private transfers, and excursions. 

You can review the recommended tour package details below and book your travel dates directly! Let me know if you would like me to find packages for other destinations.`;
    } else if (query.includes('budget') || query.includes('cheap')) {
      reply = `If you are looking for budget-friendly packages, we offer special rates for **Rajasthan** and **Kashmir** tours starting at just $499! Apply the coupon code **EXPLORE15** at checkout for an extra 15% off your first reservation.`;
    } else if (query.includes('honeymoon') || query.includes('romantic')) {
      reply = `For the ultimate romantic getaway, I highly recommend our **Maldives Overwater Pool Villa Getaway** or **Kashmir Paradise Valley Tour**. Both packages feature secluded stays, couple activities, and candle-lit dinners.`;
    } else {
      reply = `Hello! I am your **Explore World AI Travel Assistant**. I can help you find:
*   Curated National & International Tour Packages (try: *"Show me tours in Kashmir"* or *"Plan a trip to Dubai"*)
*   Honeymoon or Family holiday recommendations
*   Itinerary summaries, meal details, and package inclusions

Where would you like to travel next?`;
    }

    return res.json({
      reply,
      packages: suggestedPackages,
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
