import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_DB_PATH = path.join(__dirname, '..', 'data', 'local_db.json');

let isConnected = false;
let localDb = {
  users: [],
  cropRecommendations: [],
  diseaseReports: [],
  mandiPrices: [],
  pestAlerts: [],
  irrigationPlans: [],
  fertilizerRecommendations: [],
  schemes: []
};

// Load local database file if it exists
function loadLocalDb() {
  try {
    const dataDir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const fileData = fs.readFileSync(LOCAL_DB_PATH, 'utf8');
      localDb = JSON.parse(fileData);
    } else {
      saveLocalDb();
    }
  } catch (err) {
    console.error('Failed to load local JSON database:', err);
  }
}

// Save local database to file
function saveLocalDb() {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(localDb, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save local JSON database:', err);
  }
}

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.log('⚠️  MONGO_URI not specified. Running KrishiMitra AI with File-Based JSON Database Fallback.');
    loadLocalDb();
    return false;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    console.log('✅ Connected to MongoDB successfully.');
    return true;
  } catch (err) {
    console.warn('⚠️  Could not connect to MongoDB. Falling back to File-Based JSON Database.');
    console.warn(`Error: ${err.message}`);
    loadLocalDb();
    return false;
  }
};

// Generic DB client wrapper supporting MongoDB (Mongoose) and Local JSON storage fallbacks
export const db = {
  isConnected: () => isConnected,

  find: async (model, query = {}) => {
    if (isConnected) {
      return await model.find(query);
    }
    const collectionName = model.modelName.toLowerCase() + 's';
    let data = localDb[collectionName] || [];
    
    // Simple filter matching
    return data.filter(item => {
      for (let key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  },

  findOne: async (model, query = {}) => {
    if (isConnected) {
      return await model.findOne(query);
    }
    const collectionName = model.modelName.toLowerCase() + 's';
    let data = localDb[collectionName] || [];
    return data.find(item => {
      for (let key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    }) || null;
  },

  create: async (model, docData) => {
    if (isConnected) {
      const newDoc = new model(docData);
      return await newDoc.save();
    }
    const collectionName = model.modelName.toLowerCase() + 's';
    if (!localDb[collectionName]) {
      localDb[collectionName] = [];
    }
    const newDoc = {
      _id: Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      ...docData
    };
    localDb[collectionName].push(newDoc);
    saveLocalDb();
    return newDoc;
  },

  findOneAndUpdate: async (model, query, updateData) => {
    if (isConnected) {
      return await model.findOneAndUpdate(query, updateData, { new: true });
    }
    const collectionName = model.modelName.toLowerCase() + 's';
    let data = localDb[collectionName] || [];
    const index = data.findIndex(item => {
      for (let key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });

    if (index !== -1) {
      const updated = { ...data[index], ...updateData, updatedAt: new Date().toISOString() };
      data[index] = updated;
      saveLocalDb();
      return updated;
    }
    return null;
  },

  findByIdAndDelete: async (model, id) => {
    if (isConnected) {
      return await model.findByIdAndDelete(id);
    }
    const collectionName = model.modelName.toLowerCase() + 's';
    let data = localDb[collectionName] || [];
    const index = data.findIndex(item => item._id === id);
    if (index !== -1) {
      const deleted = data.splice(index, 1)[0];
      saveLocalDb();
      return deleted;
    }
    return null;
  },

  // Batch insert (useful for seeding static data in localDb)
  seedCollection: (collectionName, items) => {
    localDb[collectionName] = items;
    saveLocalDb();
  }
};
