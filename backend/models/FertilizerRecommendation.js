import mongoose from 'mongoose';

const FertilizerRecommendationSchema = new mongoose.Schema({
  userFirebaseId: { type: String, required: true },
  cropName: String,
  soilN: Number,
  soilP: Number,
  soilK: Number,
  targetYieldTonsPerAcre: Number,
  recommendedNPK: {
    n: Number,
    p: Number,
    k: Number
  },
  fertilizersToApply: [{
    name: String,
    amountKgPerAcre: Number,
    timing: String,
    method: String
  }],
  organicAlternatives: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('FertilizerRecommendation', FertilizerRecommendationSchema);
