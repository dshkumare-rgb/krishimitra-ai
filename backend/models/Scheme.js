import mongoose from 'mongoose';

const SchemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  eligibility: { type: String, required: true },
  benefits: { type: String, required: true },
  link: { type: String, default: '' },
  category: { type: String, default: 'General' }, // Subsidy, Financial, Insurance, Technology
  state: { type: String, default: 'All' }, // All, or specific state
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Scheme', SchemeSchema);
