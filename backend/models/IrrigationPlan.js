import mongoose from 'mongoose';

const IrrigationPlanSchema = new mongoose.Schema({
  userFirebaseId: { type: String, required: true },
  cropName: String,
  soilType: String,
  growthStage: String,
  areaSize: Number,
  waterSource: String,
  wateringSchedule: [{
    day: String,
    waterLiters: Number,
    method: String,
    durationMinutes: Number
  }],
  recommendations: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('IrrigationPlan', IrrigationPlanSchema);
