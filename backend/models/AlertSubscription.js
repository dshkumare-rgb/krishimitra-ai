import mongoose from 'mongoose';

const AlertSubscriptionSchema = new mongoose.Schema({
  userFirebaseId: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  alertPest: { type: Boolean, default: true },
  alertWeather: { type: Boolean, default: true },
  alertMandi: { type: Boolean, default: true },
  alertMandiThreshold: { type: Number, default: 10 }, // percent price drop triggering warning
  alertSchemes: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('AlertSubscription', AlertSubscriptionSchema);
