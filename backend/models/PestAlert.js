import mongoose from 'mongoose';

const PestAlertSchema = new mongoose.Schema({
  pestName: { type: String, required: true },
  cropAffected: { type: String, required: true },
  severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
  state: { type: String, required: true },
  district: { type: String, required: true },
  description: String,
  symptoms: String,
  controlMeasures: String,
  reportedAt: { type: Date, default: Date.now },
  latitude: Number,
  longitude: Number
});

export default mongoose.model('PestAlert', PestAlertSchema);
