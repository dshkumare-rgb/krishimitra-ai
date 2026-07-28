import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { connectDB, db } from './config/db.js';
import authRoutes from './routes/auth.js';
import aiRoutes from './routes/ai.js';
import mandiRoutes from './routes/mandi.js';
import weatherRoutes from './routes/weather.js';
import alertsRoutes from './routes/alerts.js';
import adminRoutes from './routes/admin.js';
import supportRoutes from './routes/support.js';
import cropCalendarRoutes from './routes/cropCalendar.js';
import marketplaceRoutes from './routes/marketplace.js';
import schemeApplicationRoutes from './routes/schemeApplication.js';
import alertSubscriptionRoutes from './routes/alertSubscription.js';
import { initCronJob } from './services/alertCronJob.js';


import MandiPrice from './models/MandiPrice.js';
import Scheme from './models/Scheme.js';
import PestAlert from './models/PestAlert.js';
import { staticMandiPrices, staticSchemes, staticPestAlerts } from './data/staticData.js';

// Resolve Paths for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dynamic Mock Leaf Image Route
// Provides a valid green leaf icon as an image so leaf disease uploader previews and displays never break
app.get('/uploads/sample-leaf.jpg', (req, res) => {
  // 1x1 green pixel gif fallback
  const s = Buffer.from('R0lGODlhAQABAIAAAAD/gAAAACwAAAAAAQABAAACAkQBADs=', 'base64');
  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': s.length
  });
  res.end(s);
});

// Setup static uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/mandi', mandiRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/crop-calendar', cropCalendarRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/schemes', schemeApplicationRoutes);
app.use('/api/alerts-sub', alertSubscriptionRoutes);

// Serve static client assets in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Root Endpoint for dev mode
  app.get('/', (req, res) => {
    res.json({
      message: 'Welcome to KrishiMitra AI API Gateway Core',
      databaseMode: db.isConnected() ? 'MongoDB Cloud/Local' : 'JSON File-Based Offline Cache',
      status: 'Healthy',
      timestamp: new Date().toISOString()
    });
  });
}


// Initialize and Start Server
const startServer = async () => {
  const isMongo = await connectDB();

  // Auto-seed database if empty (whether MongoDB or JSON file)
  try {
    let mandis = await db.find(MandiPrice);
    let schemes = await db.find(Scheme);
    let alerts = await db.find(PestAlert);

    if (mandis.length === 0 && schemes.length === 0 && alerts.length === 0) {
      console.log('🌱 Database is empty. Seeding initial KrishiMitra dataset...');
      if (isMongo) {
        await MandiPrice.insertMany(staticMandiPrices);
        await Scheme.insertMany(staticSchemes);
        await PestAlert.insertMany(staticPestAlerts);
        console.log('✅ Seeding complete on MongoDB.');
      } else {
        db.seedCollection('mandiprices', staticMandiPrices);
        db.seedCollection('schemes', staticSchemes);
        db.seedCollection('pestalerts', staticPestAlerts);
        console.log('✅ Seeding complete on Local JSON Database file.');
      }
    } else {
      console.log('📊 Existing agricultural data records detected. Skipping auto-seed.');
    }
  } catch (err) {
    console.error('⚠️  Failed to run auto-seed checks:', err.message);
  }

  // Initialize background SMS/WhatsApp notification cron matching scanner
  initCronJob();

  app.listen(PORT, () => {
    console.log(`🚀 KrishiMitra AI Express Server running on http://localhost:${PORT}`);
  });
};

startServer();
