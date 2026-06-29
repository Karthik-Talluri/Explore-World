import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import prisma from './db';

// Route imports
import authRoutes from './routes/auth.routes';
import packageRoutes from './routes/packages.routes';
import bookingRoutes from './routes/bookings.routes';
import adminRoutes from './routes/admin.routes';
import aiRoutes from './routes/ai.routes';

dotenv.config();

const app = express();

app.use(cors({
  origin: true, // Allow all origins for serverless requests
  credentials: true
}));
app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Register routes (support both /api/ prefix and stripped/relative routes on Vercel)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/packages', packageRoutes);
app.use('/packages', packageRoutes);

app.use('/api/bookings', bookingRoutes);
app.use('/bookings', bookingRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

app.use('/api/ai', aiRoutes);
app.use('/ai', aiRoutes);

// Health Check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({ status: 'OK', timestamp: new Date(), environment: 'vercel-serverless' });
});

// Self-seeding database function for serverless deployment
let isSeeded = false;
async function seedDatabase() {
  if (isSeeded) return;
  try {
    const packageCount = await prisma.tourPackage.count();
    if (packageCount === 0) {
      console.log('Database empty. Seeding initial users and holiday packages...');

      // Seed admin
      const hashedAdminPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.create({
        data: {
          email: 'admin@exploreworld.com',
          name: 'Explore Admin',
          password: hashedAdminPassword,
          role: 'ADMIN',
        },
      });

      // Seed normal user
      const hashedUserPassword = await bcrypt.hash('user123', 10);
      await prisma.user.create({
        data: {
          email: 'user@exploreworld.com',
          name: 'Jane Doe',
          password: hashedUserPassword,
          role: 'USER',
        },
      });

      // Seed Initial Tour Packages
      const initialPackages = [
        {
          name: 'Kashmir Paradise Valley Tour',
          category: 'NATIONAL',
          destination: 'Kashmir',
          price: 499,
          durationDays: 6,
          bestSeason: 'March to October',
          attractions: 'Gulmarg Gondola, Dal Lake Shikara, Shalimar Bagh',
          hotelDetails: 'Snow-capped Luxury Cottage & Dal Lake Houseboat stay',
          mealPlan: 'Daily Breakfast & Dinner (Kashmiri Wazwan included)',
          transportation: 'Private Innova for all sightseeing transfers',
          itinerary: JSON.stringify([
            { day: 1, title: 'Arrival in Srinagar & Houseboat check-in', description: 'Arrive at Srinagar airport. Transfer to a premium Dal Lake houseboat. Enjoy a 1-hour sunset Shikara ride.' },
            { day: 2, title: 'Srinagar Mugal Gardens Sightseeing', description: 'Explore Shalimar Bagh, Nishat Bagh, and the historic Shankaracharya Temple.' },
            { day: 3, title: 'Srinagar to Gulmarg Day Trip', description: 'Travel to Gulmarg. Ride the famous Gondola cable car (Phase 1 & 2) for breathtaking snow views.' },
            { day: 4, title: 'Day Trip to Sonamarg - Meadow of Gold', description: 'Visit Sonamarg, enjoy a pony ride to Thajiwas Glacier, and walk along the Sindh River.' },
            { day: 5, title: 'Pahalgam Valley Exploration', description: 'Transfer to Pahalgam. Discover Betaab Valley, Aru Valley, and the Lidder River trails.' },
            { day: 6, title: 'Departure flight from Srinagar', description: 'Transfer back to Srinagar airport for your onward flight home.' }
          ]),
          visaRequirement: 'Not Required',
          currency: 'INR',
          weather: '10°C - 20°C (Cold/Mild)',
          inclusions: 'Luxury stays,Airport pickup/drop,Private driver,Houseboat stay,Shikara ride',
          exclusions: 'Flights,Personal shopping,Camera tickets,Tips',
          rating: 4.9,
          availableDates: JSON.stringify(['2026-07-15', '2026-08-10', '2026-09-05']),
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&auto=format&fit=crop&q=80'
          ]),
          type: 'Honeymoon',
        },
        {
          name: 'Rajasthan Royal Heritage Tour',
          category: 'NATIONAL',
          destination: 'Rajasthan',
          price: 599,
          durationDays: 7,
          bestSeason: 'October to March',
          attractions: 'Amber Fort, City Palace Jaipur, Mehrangarh Fort Jodhpur',
          hotelDetails: 'Heritage Haveli & Thar Desert Luxury Camp',
          mealPlan: 'Daily Traditional Rajasthani Breakfast & Dinner',
          transportation: 'Private Sedan Transfer with English speaking driver',
          itinerary: JSON.stringify([
            { day: 1, title: 'Arrival in Jaipur - The Pink City', description: 'Check into your heritage Haveli. Spend the evening visiting Chokhi Dhani for local food.' },
            { day: 2, title: 'Jaipur Forts & Palaces Tour', description: 'Visit Amber Fort (elephant ride optional), Hawa Mahal, and Jantar Mantar.' },
            { day: 3, title: 'Jaipur to Jodhpur (The Blue City)', description: 'Drive to Jodhpur. Visit the majestic Mehrangarh Fort overlooking the blue houses.' },
            { day: 4, title: 'Jodhpur to Jaisalmer Desert Camp', description: 'Drive to Jaisalmer. Check into luxury desert camps. Enjoy camel safari on Sam Sand Dunes.' },
            { day: 5, title: 'Jaisalmer Golden Fort Tour', description: 'Explore Jaisalmer Fort, Patwon ki Haveli, and Gadisar Lake.' },
            { day: 6, title: 'Jaisalmer to Udaipur (City of Lakes)', description: 'Drive to Udaipur, check into a lakefront hotel, and enjoy a boat ride on Lake Pichola.' },
            { day: 7, title: 'Udaipur departure transfer', description: 'Transfer to Udaipur airport for departure.' }
          ]),
          visaRequirement: 'Not Required',
          currency: 'INR',
          weather: '18°C - 30°C (Warm)',
          inclusions: 'Haveli stay,Desert camel safari,Private driver,Lake Pichola boat tour',
          exclusions: 'Monument entry fees,Lunch,Flights',
          rating: 4.8,
          availableDates: JSON.stringify(['2026-07-20', '2026-08-15', '2026-09-12']),
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1477587458883-471a5ed94245?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=800&auto=format&fit=crop&q=80'
          ]),
          type: 'Family',
        },
        {
          name: 'Dubai Luxury Skyline Escape',
          category: 'INTERNATIONAL',
          destination: 'Dubai',
          price: 1399,
          durationDays: 5,
          bestSeason: 'November to April',
          attractions: 'Burj Khalifa, Desert Safari, Dubai Mall, Marina Yacht',
          hotelDetails: '5★ Luxury Downtown Dubai Hotel stay',
          mealPlan: 'Daily Premium Breakfast & Desert Camp BBQ dinner',
          transportation: 'Private SUV pickup/drop & Yacht cruise transfers',
          itinerary: JSON.stringify([
            { day: 1, title: 'Arrival in Dubai & Marina Dhow Cruise', description: 'Arrive at Dubai DXB. Transfer to your luxury hotel. Evening dinner on a traditional Marina Dhow Cruise.' },
            { day: 2, title: 'Half-Day Dubai City Tour & Burj Khalifa', description: 'Explore Jumeirah Mosque, Dubai Frame, and ascend to the 124th floor of Burj Khalifa.' },
            { day: 3, title: 'Thar Desert Safari & BBQ Dinner', description: 'Afternoon dune bashing in 4x4 SUVs. Sandboarding, camel rides, belly dancing show, and BBQ dinner.' },
            { day: 4, title: 'Aquaventure Waterpark & Palm Jumeirah Tour', description: 'Spend the day at Atlantis Palm Aquaventure and visit the Lost Chambers aquarium.' },
            { day: 5, title: 'Dubai Departure Transfer', description: 'Morning shopping at Dubai Mall. Transfer to DXB airport for your flight home.' }
          ]),
          visaRequirement: 'eVisa / On Arrival (depending on passport)',
          currency: 'AED / USD',
          weather: '24°C - 32°C (Sunny/Warm)',
          inclusions: '5 Star hotel stays,Burj Khalifa tickets,SUV Desert safari,Yacht cruise dinner',
          exclusions: 'International flights,Tourism Dirham fees,Personal spending',
          rating: 4.8,
          availableDates: JSON.stringify(['2026-07-15', '2026-08-10', '2026-09-05']),
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=800&auto=format&fit=crop&q=80'
          ]),
          type: 'Luxury',
        },
        {
          name: 'Maldives Overwater Pool Villa Getaway',
          category: 'INTERNATIONAL',
          destination: 'Maldives',
          price: 1899,
          durationDays: 5,
          bestSeason: 'November to April',
          attractions: 'House Reef Snorkeling, Sunset Dolphin Cruise, Private Sandbank',
          hotelDetails: 'Luxury Overwater Villa with private pool at 5★ Resort',
          mealPlan: 'Full Board (All meals & premium drinks included)',
          transportation: 'Roundtrip Luxury Speedboat / Seaplane transfer',
          itinerary: JSON.stringify([
            { day: 1, title: 'Arrive at Male Airport & Speedboat Transfer', description: 'Arrive at Velana International Airport. Scenic speedboat ride to your resort. Check into your Overwater Pool Villa.' },
            { day: 2, title: 'Snorkeling Safari & Water Sports', description: 'Guided snorkeling session in the house reef. Afternoon windsurfing or jet-skiing.' },
            { day: 3, title: 'Private Sandbank Picnic & Dolphin Cruise', description: 'Transfer to a secluded private sandbank for a chef-curated lunch. Sunset dolphin watching cruise.' },
            { day: 4, title: 'Resort Spa Treatment & Beach BBQ Dinner', description: 'Enjoy a 60-minute relaxing Balinese massage. Beachfront BBQ seafood dinner under the stars.' },
            { day: 5, title: 'Departure transfer to Male', description: 'Leisurely morning. Transfer back to Male airport for departure.' }
          ]),
          visaRequirement: 'Free Visa On Arrival (30 Days)',
          currency: 'MVR / USD',
          weather: '26°C - 30°C (Tropical)',
          inclusions: 'Overwater Villa stay,Full Board meals,Speedboat transfers, dolphin cruise',
          exclusions: 'Airfare,Premium spa add-ons,Diving courses',
          rating: 4.9,
          availableDates: JSON.stringify(['2026-07-15', '2026-08-10', '2026-09-05']),
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&auto=format&fit=crop&q=80'
          ]),
          type: 'Honeymoon',
        }
      ];

      for (const p of initialPackages) {
        await prisma.tourPackage.create({ data: p });
      }

      console.log('Database seeded with packages successfully.');
      isSeeded = true;
    }
  } catch (error) {
    console.error('Seeding database failed:', error);
  }
}

// Trigger seeding asynchronously on function import
seedDatabase();

export default app;
