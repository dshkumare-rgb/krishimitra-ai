import mongoose from 'mongoose';

const DiseaseReportSchema = new mongoose.Schema({
  userFirebaseId: { type: String, required: true },
  imageUrl: String,
  detectedObject: String,
  cropName: String,
  scientificName: String,
  healthStatus: String,
  diseaseName: String,
  confidence: Number,
  severity: String,
  symptoms: String,
  cause: String,
  treatment: String, // Maps to immediate action/recommendedAction
  organicSolution: String, // Maps to biological treatment
  chemicalSolution: String, // Maps to chemical treatment
  prevention: String,
  similarDiseases: String,
  estimatedYieldLoss: String,
  recommendedAction: String,
  reportLanguage: String,
  disclaimer: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('DiseaseReport', DiseaseReportSchema);
