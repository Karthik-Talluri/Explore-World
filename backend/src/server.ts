import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import prisma from './db';

// Route imports
import authRoutes from './routes/auth.routes';
import flightRoutes from './routes/flights.routes';
import hotelRoutes from './routes/hotels.routes';
import bookingRoutes from './routes/bookings.routes';
import aiRoutes from './routes/ai.routes';
import adminRoutes from './routes/admin.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Self-seeding database function for development ease
async function seedDatabase() {
  try {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('Database empty. Seeding initial users and coupons...');

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

      // Seed coupons
      await prisma.coupon.create({
        data: { code: 'EXPLORE15', discountPercent: 15.0, active: true },
      });
      await prisma.coupon.create({
        data: { code: 'WELCOME10', discountPercent: 10.0, active: true },
      });

      console.log('Database seeded successfully.');
    }
  } catch (error) {
    console.error('Seeding database failed:', error);
  }
}

// Start Server
app.listen(PORT, async () => {
  console.log(`Explore World API Server running on port ${PORT}`);
  await seedDatabase();
});
