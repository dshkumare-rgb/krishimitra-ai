import MarketplaceListing from '../models/MarketplaceListing.js';
import { db } from '../config/db.js';

export const getListings = async (req, res) => {
  const { cropName, state, district, status, userId } = req.query;
  const filter = {};

  if (cropName) filter.cropName = cropName;
  if (state) filter.locationState = state;
  if (district) filter.locationDistrict = district;
  if (status) filter.status = status;
  if (userId) filter.userFirebaseId = userId;

  try {
    // Automatically flag expired listings (expiresAt < now)
    const all = await db.find(MarketplaceListing, {});
    const now = new Date();
    for (const item of all) {
      if (item.status === 'active' && item.expiresAt && new Date(item.expiresAt) < now) {
        item.status = 'expired';
        await db.save(item);
      }
    }

    const list = await db.find(MarketplaceListing, filter);
    res.status(200).json(list);
  } catch (err) {
    console.error('Failed to get marketplace listings:', err.message);
    res.status(500).json({ error: 'Failed to retrieve listings.' });
  }
};

export const createListing = async (req, res) => {
  const { userId, farmerName, phone, cropName, quantity, unit, askingPrice, state, district, description, images } = req.body;

  if (!userId || !farmerName || !phone || !cropName || !quantity || !askingPrice || !state || !district) {
    return res.status(400).json({ error: 'Missing required listing parameters.' });
  }

  try {
    const listing = new MarketplaceListing({
      userFirebaseId: userId,
      farmerName,
      phone,
      cropName,
      quantity,
      unit: unit || 'Quintals',
      askingPrice,
      locationState: state,
      locationDistrict: district,
      description,
      images: images || []
    });

    await db.save(listing);
    console.log('🌾 Marketplace produce listed:', listing);
    res.status(201).json({ message: 'Produce listed successfully.', listing });
  } catch (err) {
    console.error('Failed to create listing:', err.message);
    res.status(500).json({ error: 'Failed to create listing.' });
  }
};

export const markAsSold = async (req, res) => {
  const { id } = req.params;
  try {
    const items = await db.find(MarketplaceListing, { _id: id });
    if (items.length === 0) {
      return res.status(444).json({ error: 'Listing not found.' });
    }

    const item = items[0];
    item.status = 'sold';
    await db.save(item);

    res.status(200).json({ message: 'Produce listing marked as sold.', item });
  } catch (err) {
    console.error('Failed to mark listing as sold:', err.message);
    res.status(500).json({ error: 'Failed to update listing.' });
  }
};
