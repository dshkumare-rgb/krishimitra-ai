import Scheme from '../models/Scheme.js';
import MandiPrice from '../models/MandiPrice.js';
import PestAlert from '../models/PestAlert.js';
import User from '../models/User.js';
import { db } from '../config/db.js';

// 1. GET ADMIN OVERVIEW STATISTICS
export const getStats = async (req, res) => {
  try {
    const userCount = (await db.find(User)).length;
    const schemesCount = (await db.find(Scheme)).length;
    const mandiPriceCount = (await db.find(MandiPrice)).length;
    const alertCount = (await db.find(PestAlert)).length;

    return res.status(200).json({
      users: userCount + 12, // mock offset + dynamic count
      schemes: schemesCount,
      prices: mandiPriceCount,
      alerts: alertCount,
      systemStatus: 'Healthy',
      dbConnected: db.isConnected(),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch statistics', details: err.message });
  }
};

// 2. SCHEMES CRUD
export const createScheme = async (req, res) => {
  try {
    const newScheme = await db.create(Scheme, req.body);
    return res.status(201).json(newScheme);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create government scheme', details: err.message });
  }
};

export const getSchemes = async (req, res) => {
  const { category, state } = req.query;

  try {
    let list = await db.find(Scheme, {});

    if (category) {
      list = list.filter(s => s.category === category);
    }

    if (state && state !== 'All') {
      list = list.filter(s => s.state === state || s.state === 'All');
    }

    return res.status(200).json(list);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve schemes', details: err.message });
  }
};

export const deleteScheme = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await db.findByIdAndDelete(Scheme, id);
    if (!deleted) return res.status(404).json({ error: 'Scheme not found' });
    return res.status(200).json({ message: 'Scheme deleted successfully', deleted });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete scheme', details: err.message });
  }
};

// 3. MANDI PRICE CRUD
export const addMandiPrice = async (req, res) => {
  const { cropName, state, district, market, currentPrice, latitude, longitude } = req.body;
  if (!cropName || !state || !district || !market || !currentPrice) {
    return res.status(400).json({ error: 'Missing mandatory fields for adding Mandi price' });
  }

  try {
    // Generate a default mock price history for the new crop
    const priceHistory = Array.from({ length: 12 }, (_, i) => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const variance = (Math.random() - 0.5) * 150;
      return {
        month: months[i],
        price: Math.round(currentPrice - variance)
      };
    });

    const newMandi = await db.create(MandiPrice, {
      cropName,
      state,
      district,
      market,
      currentPrice: parseFloat(currentPrice),
      latitude: parseFloat(latitude) || 22.0,
      longitude: parseFloat(longitude) || 75.0,
      priceHistory,
      expectedTrend: Math.random() > 0.5 ? 'UP' : 'STABLE',
      trendReasoning: 'Added via Admin portal. Current market trend indicates steady trading.'
    });

    return res.status(201).json(newMandi);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to register market price', details: err.message });
  }
};

export const deleteMandiPrice = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await db.findByIdAndDelete(MandiPrice, id);
    if (!deleted) return res.status(404).json({ error: 'Mandi price entry not found' });
    return res.status(200).json({ message: 'Mandi price entry deleted', deleted });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete entry', details: err.message });
  }
};

// 4. USER PROFILE MANAGEMENT
export const registerOrUpdateUser = async (req, res) => {
  const { firebaseId, email, displayName, state, district, language, theme, phoneNumber, role } = req.body;
  if (!firebaseId) {
    return res.status(400).json({ error: 'firebaseId is required' });
  }

  try {
    let user = await db.findOne(User, { firebaseId });
    if (user) {
      // Update
      user = await db.findOneAndUpdate(User, { firebaseId }, {
        displayName, state, district, language, theme, phoneNumber, role
      });
    } else {
      // Create
      user = await db.create(User, {
        firebaseId, email, displayName, state, district, language, theme, phoneNumber, role: role || 'farmer'
      });
    }
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to sync user profile', details: err.message });
  }
};
