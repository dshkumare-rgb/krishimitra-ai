import mongoose from 'mongoose';

const SubscribedAlertLogSchema = new mongoose.Schema({
  userFirebaseId: { type: String, required: true },
  alertType: { type: String, required: true }, // e.g. 'pest', 'weather', 'mandi'
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('SubscribedAlertLog', SubscribedAlertLogSchema);
