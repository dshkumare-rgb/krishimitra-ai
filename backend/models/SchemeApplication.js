import mongoose from 'mongoose';

const SchemeApplicationSchema = new mongoose.Schema({
  userFirebaseId: { type: String, required: true },
  schemeId: { type: String, required: true },
  schemeName: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Submitted', 'Under Review', 'Approved', 'Rejected'], 
    default: 'Submitted' 
  },
  appliedDate: { type: Date, default: Date.now },
  documentChecklist: [
    { name: String, isUploaded: { type: Boolean, default: false } }
  ],
  notes: String,
  followUpReminderDate: Date
});

export default mongoose.model('SchemeApplication', SchemeApplicationSchema);
