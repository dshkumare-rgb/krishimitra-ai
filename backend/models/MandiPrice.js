import mongoose from 'mongoose';

const MandiPriceSchema = new mongoose.Schema({
  cropName: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  market: { type: String, required: true },
  currentPrice: { type: Number, required: true }, // in ₹ per quintal
  lastUpdated: { type: Date, default: Date.now },
  latitude: Number,
  longitude: Number,
  priceHistory: [{
    month: String, // e.g. "Jan", "Feb" or "2026-01"
    price: Number
  }],
  expectedTrend: { type: String, enum: ['UP', 'DOWN', 'STABLE'], default: 'STABLE' },
  trendReasoning: String
});

export default mongoose.model('MandiPrice', MandiPriceSchema);
