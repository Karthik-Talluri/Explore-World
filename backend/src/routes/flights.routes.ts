import { Router } from 'express';
import prisma from '../db';

const router = Router();

const AIRLINES = ['Delta Air Lines', 'British Airways', 'Emirates', 'Japan Airlines', 'Singapore Airlines', 'Qantas'];
const CLASSES = ['Economy', 'Business', 'First'];

// Helper to generate dynamic mock flights
async function getOrCreateMockFlights(from: string, to: string, dateStr: string, seatClass: string) {
  const departureDate = new Date(dateStr);
  
  // Set time range for the day
  const startOfDay = new Date(departureDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(departureDate.setHours(23, 59, 59, 999));

  // Find existing flights
  let flights = await prisma.flight.findMany({
    where: {
      departureCity: from.toUpperCase(),
      arrivalCity: to.toUpperCase(),
      departureTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
      class: seatClass,
    },
  });

  // If no flights, generate 4 mock flights for this day/route and save them
  if (flights.length === 0) {
    const flightTemplates = [
      { hour: 8, priceFactor: 1.0, stops: 0, suffix: 'A' },
      { hour: 13, priceFactor: 1.2, stops: 1, suffix: 'B' },
      { hour: 17, priceFactor: 1.5, stops: 0, suffix: 'C' },
      { hour: 21, priceFactor: 0.9, stops: 2, suffix: 'D' },
    ];

    const newFlightsData = [];

    for (let i = 0; i < flightTemplates.length; i++) {
      const template = flightTemplates[i];
      const airline = AIRLINES[Math.floor(Math.random() * AIRLINES.length)];
      
      const depTime = new Date(startOfDay);
      depTime.setHours(template.hour, Math.floor(Math.random() * 6) * 10, 0, 0);

      const arrTime = new Date(depTime);
      const flightDurationHours = template.stops === 0 ? 7 : 11;
      arrTime.setHours(arrTime.getHours() + flightDurationHours);

      const basePrice = seatClass === 'First' ? 3500 : seatClass === 'Business' ? 1800 : 450;
      const price = Math.round(basePrice * template.priceFactor * (0.9 + Math.random() * 0.2));

      const flightNumber = `${airline.substring(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}${template.suffix}`;

      newFlightsData.push({
        flightNumber,
        airline,
        departureCity: from.toUpperCase(),
        arrivalCity: to.toUpperCase(),
        departureTime: depTime,
        arrivalTime: arrTime,
        price,
        class: seatClass,
        availableSeats: Math.floor(10 + Math.random() * 50),
        stops: template.stops,
      });
    }

    // Save to DB (using createMany or individual inserts since SQLite doesn't always support createMany depending on Prisma client version, safety first: insert individually)
    for (const f of newFlightsData) {
      await prisma.flight.create({ data: f });
    }

    // Re-query to get with database IDs
    flights = await prisma.flight.findMany({
      where: {
        departureCity: from.toUpperCase(),
        arrivalCity: to.toUpperCase(),
        departureTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        class: seatClass,
      },
    });
  }

  return flights;
}

// Search Flights
router.get('/search', async (req, res) => {
  try {
    const { from, to, date, class: seatClass = 'Economy' } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({ message: 'Parameters "from", "to", and "date" (YYYY-MM-DD) are required' });
    }

    const flights = await getOrCreateMockFlights(
      String(from),
      String(to),
      String(date),
      String(seatClass)
    );

    return res.json(flights);
  } catch (error) {
    console.error('Flight search error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Flight details by ID
router.get('/:id', async (req, res) => {
  try {
    const flight = await prisma.flight.findUnique({
      where: { id: req.params.id },
    });

    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    return res.json(flight);
  } catch (error) {
    console.error('Get flight error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
