import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  firebaseId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  displayName: { type: String },
  role: { type: String, enum: ['farmer', 'admin'], default: 'farmer' },
  state: { type: String, default: '' },
  district: { type: String, default: '' },
  language: { type: String, default: 'en' },
  theme: { type: String, default: 'light' },
  phoneNumber: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', UserSchema);
