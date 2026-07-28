import mongoose from 'mongoose';

const CropRecommendationSchema = new mongoose.Schema({
  userFirebaseId: { type: String, required: true },
  soilType: String,
  landSize: Number,
  state: String,
  district: String,
  rainfall: Number,
  waterAvailability: String,
  budget: Number,
  season: String,
  recommendations: [{
    cropName: String,
    confidence: Number,
    expectedPrice: Number,
    expectedCost: Number,
    expectedProfit: Number,
    explanation: String,
    irrigationGuide: String,
    fertilizerGuide: String
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('CropRecommendation', CropRecommendationSchema);
