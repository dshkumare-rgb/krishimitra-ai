import mongoose from 'mongoose';

const CropCalendarRecordSchema = new mongoose.Schema({
  userFirebaseId: { type: String, required: true },
  cropName: { type: String, required: true },
  sowingDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('CropCalendarRecord', CropCalendarRecordSchema);
