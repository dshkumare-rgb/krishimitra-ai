import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, db } from '../config/db.js';
import MandiPrice from '../models/MandiPrice.js';
import Scheme from '../models/Scheme.js';
import PestAlert from '../models/PestAlert.js';
import { staticMandiPrices, staticSchemes, staticPestAlerts } from './staticData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seed = async () => {
  console.log('🌱 Starting KrishiMitra database seeding...');
  const isMongo = await connectDB();

  if (isMongo) {
    try {
      // Clear existing records in MongoDB
      await MandiPrice.deleteMany({});
      await Scheme.deleteMany({});
      await PestAlert.deleteMany({});

      // Insert static data
      await MandiPrice.insertMany(staticMandiPrices);
      await Scheme.insertMany(staticSchemes);
      await PestAlert.insertMany(staticPestAlerts);

      console.log('✅ Seeding complete on MongoDB.');
    } catch (err) {
      console.error('❌ MongoDB Seeding failed:', err);
    }
  } else {
    // Seeding file-based fallback database
    db.seedCollection('mandiprices', staticMandiPrices);
    db.seedCollection('schemes', staticSchemes);
    db.seedCollection('pestalerts', staticPestAlerts);
    console.log('✅ Seeding complete on Local JSON Database file.');
  }

  process.exit(0);
};

seed();
