import mongoose from 'mongoose';

const MarketplaceListingSchema = new mongoose.Schema({
  userFirebaseId: { type: String, required: true },
  farmerName: { type: String, required: true },
  phone: { type: String, required: true },
  cropName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'Quintals' }, // e.g. Quintals, Kilograms, Tonnes
  askingPrice: { type: Number, required: true }, // price in INR per unit
  locationState: { type: String, required: true },
  locationDistrict: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['active', 'sold', 'expired'], default: 'active' },
  images: [String],
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } // 7-day automatic expiry
});

export default mongoose.model('MarketplaceListing', MarketplaceListingSchema);
