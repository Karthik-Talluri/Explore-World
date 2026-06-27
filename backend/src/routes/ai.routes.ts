import { Router } from 'express';
import prisma from '../db';

const router = Router();

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const query = message.toLowerCase();
    let responseText = '';
    let suggestedHotels: any[] = [];
    let suggestedFlights: any[] = [];

    // Simple keyword extraction for destinations
    const destinations = ['paris', 'london', 'tokyo', 'dubai', 'sydney', 'new york'];
    let matchedDestination = '';

    for (const dest of destinations) {
      if (query.includes(dest)) {
        matchedDestination = dest;
        break;
      }
    }

    if (matchedDestination) {
      const capDest = matchedDestination.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

      // Query real DB hotels for this destination
      const hotels = await prisma.hotel.findMany({
        where: { location: { contains: matchedDestination } },
        take: 2,
      });

      // Query real DB flights
      const flights = await prisma.flight.findMany({
        where: { arrivalCity: { equals: matchedDestination.toUpperCase() } },
        take: 2,
      });

      suggestedHotels = hotels.map(h => ({
        ...h,
        images: JSON.parse(h.images),
      }));
      suggestedFlights = flights;

      responseText = `I've analyzed your request for **${capDest}**! Here is a custom curated 3-day travel plan:

*   **Day 1: Arrival & Exploration** - Check into your hotel, stroll around the city center, and enjoy a local gourmet dinner.
*   **Day 2: Historical & Cultural Tour** - Visit the famous landmarks, local museums, and scenic viewpoints.
*   **Day 3: Shopping & Leisure** - Explore local boutiques, enjoy a relaxing afternoon at a garden or cafe, and prep for departure.

Below are top deals matching your query for flights and accommodations. Let me know if you would like me to adjust the budget, class, or duration!`;

    } else if (query.includes('budget') || query.includes('cheap')) {
      responseText = `If you are looking for a budget-friendly escape, I recommend looking at **Paris** or **Tokyo** in the coming weeks. We have special off-season hotel discounts up to 30% off! Try searching for Economy flights and applying the coupon code **EXPLORE15** at checkout for an extra 15% off.`;
    } else if (query.includes('weather') || query.includes('season')) {
      responseText = `Here is the current season guide for our top destinations:
*   **Tokyo**: Mild and sunny, perfect for sightseeing.
*   **Paris**: Beautiful summer warmth, ideal for café terraces.
*   **Sydney**: Cool winter breeze, great for coastal walks.
Would you like me to find hotels in any of these locations?`;
    } else {
      responseText = `Hello! I am your AI Travel Assistant. I can help you:
*   Plan customized 3-day itineraries (try asking: *"Plan a trip to Tokyo"* or *"What can I do in Paris?"*)
*   Find cheap flights or budget hotel recommendations
*   Answer travel insurance and visa requirements

Where would you like to travel next?`;
    }

    return res.json({
      reply: responseText,
      hotels: suggestedHotels,
      flights: suggestedFlights,
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
