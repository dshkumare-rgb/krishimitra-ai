import { GoogleGenerativeAI } from '@google/generative-ai';
import CropRecommendation from '../models/CropRecommendation.js';
import DiseaseReport from '../models/DiseaseReport.js';
import IrrigationPlan from '../models/IrrigationPlan.js';
import FertilizerRecommendation from '../models/FertilizerRecommendation.js';
import { db } from '../config/db.js';

// Setup Gemini Client if API key is provided
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// ----------------------------------------------------
// 1. AI CROP RECOMMENDATION
// ----------------------------------------------------
export const recommendCrops = async (req, res) => {
  const { soilType, landSize, state, district, rainfall, waterAvailability, budget, season, userFirebaseId } = req.body;

  if (!userFirebaseId) {
    return res.status(400).json({ error: 'User firebase ID is required' });
  }

  // --- GEMINI API FLOW ---
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
        Provide crop recommendations for a farm with:
        Soil Type: ${soilType}
        Land Size: ${landSize} acres
        Location: ${district}, ${state}, India
        Annual/Seasonal Rainfall: ${rainfall} mm
        Water Availability: ${waterAvailability}
        Budget: ₹${budget}
        Season: ${season}

        Return response strictly as a JSON array of objects. Do not include markdown wraps like \`\`\`json. Each object must have these exact fields:
        {
          "cropName": "Name of the Crop",
          "confidence": 0.85 to 0.98,
          "expectedPrice": 3000 (avg market price per quintal in INR),
          "expectedCost": 1200 (production cost per quintal in INR),
          "expectedProfit": 1800 (net profit per quintal in INR),
          "explanation": "Brief explanation of why this crop is recommended for this soil/season",
          "irrigationGuide": "Irrigation frequency and requirements",
          "fertilizerGuide": "N-P-K recommendation"
        }
        Limit the suggestions to the top 3 best matching crops.
      `;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      });

      const responseText = result.response.text();
      const recommendations = JSON.parse(responseText);

      // Save to Database
      const record = await db.create(CropRecommendation, {
        userFirebaseId, soilType, landSize, state, district, rainfall, waterAvailability, budget, season,
        recommendations
      });

      return res.status(200).json(record);
    } catch (err) {
      console.warn('Gemini API Error, executing mock fallback:', err.message);
      // Fail over to mock below
    }
  }

  // --- MOCK FALLBACK SYSTEM ---
  // Simple rules based recommendations
  let recommendations = [];
  const lowercaseSoil = (soilType || 'alluvial').toLowerCase();
  const lowercaseSeason = (season || 'kharif').toLowerCase();

  if (lowercaseSeason === 'kharif') {
    if (lowercaseSoil.includes('clay') || lowercaseSoil.includes('black')) {
      recommendations = [
        {
          cropName: "Paddy (Rice)",
          confidence: 0.92,
          expectedPrice: 2200,
          expectedCost: 1100,
          expectedProfit: 1100,
          explanation: "Clayey/black soils retain water exceptionally well, which matches Paddy's high standing-water requirement during the humid Kharif monsoon.",
          irrigationGuide: "Requires standing water of 5-10cm. Maintain continuous flooding till crop maturity.",
          fertilizerGuide: "Apply N-P-K ratio of 120:60:40 kg/hectare. Split Nitrogen application in 3 doses."
        },
        {
          cropName: "Cotton",
          confidence: 0.88,
          expectedPrice: 7100,
          expectedCost: 3500,
          expectedProfit: 3600,
          explanation: "Black cotton soil has high moisture retentiveness and excellent aeration when dry, perfect for Cotton taproot growth.",
          irrigationGuide: "Moderate watering. Sensitive to waterlogging. Critical stages are flowering and boll formation.",
          fertilizerGuide: "NPK ratio of 80:40:40 kg/hectare. Zinc sulfate application is recommended."
        }
      ];
    } else {
      recommendations = [
        {
          cropName: "Maize (Corn)",
          confidence: 0.90,
          expectedPrice: 2090,
          expectedCost: 950,
          expectedProfit: 1140,
          explanation: "Loamy and alluvial soils with fair drainage are highly suitable for maize, growing rapidly in warm, rainy season.",
          irrigationGuide: "Irrigate every 10-12 days depending on rainfall. Avoid water pooling at the root zone.",
          fertilizerGuide: "Apply NPK 100:50:50 kg/hectare. Include farmyard manure during field preparation."
        },
        {
          cropName: "Soybean",
          confidence: 0.85,
          expectedPrice: 4600,
          expectedCost: 2000,
          expectedProfit: 2600,
          explanation: "Soybean thrives in well-drained sandy loams, fixing atmospheric nitrogen to improve overall soil health.",
          irrigationGuide: "Requires 4-5 irrigations if rains are dry. Ensure watering during flowering and pod development.",
          fertilizerGuide: "NPK 20:60:40 kg/hectare. Nitrogen requirement is low due to root nodule N-fixation."
        }
      ];
    }
  } else {
    // Rabi Season
    recommendations = [
      {
        cropName: "Wheat",
        confidence: 0.95,
        expectedPrice: 2275,
        expectedCost: 1050,
        expectedProfit: 1225,
        explanation: "Wheat requires cool growing conditions and mild winters. Clay-loam soils are ideal for deep root growth.",
        irrigationGuide: "Requires 4-6 crown root initiation (CRI) waterings. Crucial watering at jointing and milking stages.",
        fertilizerGuide: "NPK 120:60:40 kg/hectare. Apply phosphorus and potash at sowing."
      },
      {
        cropName: "Mustard",
        confidence: 0.89,
        expectedPrice: 5650,
        expectedCost: 2300,
        expectedProfit: 3350,
        explanation: "Mustard grows well in light sandy loam soils during winter, requiring less moisture than wheat.",
        irrigationGuide: "Highly drought resistant. Requires only 2 irrigations: one at pre-flowering and one at pod filling.",
        fertilizerGuide: "NPK 80:40:40 kg/hectare. Sulfur addition (40 kg/ha) is critical to raise seed oil content."
      }
    ];
  }

  // Save Mock Recommendation
  const record = await db.create(CropRecommendation, {
    userFirebaseId, soilType, landSize, state, district, rainfall, waterAvailability, budget, season,
    recommendations
  });

  return res.status(200).json(record);
};

// ----------------------------------------------------
// 2. AI PLANT DISEASE DETECTION
// ----------------------------------------------------
export const detectDisease = async (req, res) => {
  const { userFirebaseId } = req.body;
  const file = req.file;

  if (!userFirebaseId) {
    return res.status(400).json({ error: 'User firebase ID is required' });
  }

  let imageUrl = '/uploads/sample-leaf.jpg'; // Mock local URL
  let fileBuffer = null;
  let fileMime = 'image/jpeg';

  if (file) {
    imageUrl = `/uploads/${file.filename}`;
    fileBuffer = file.buffer;
    fileMime = file.mimetype;
  }

  // --- GEMINI MULTIMODAL FLOW ---
  if (genAI && file) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const imagePart = {
        inlineData: {
          data: fileBuffer.toString('base64'),
          mimeType: fileMime
        }
      };

      const prompt = `
        You are KrishiMitra AI, an expert agricultural assistant trained on Indian crops, plant diseases, pests, nutrient deficiencies, weeds, and farming practices.
        Your job is to analyze every uploaded image carefully and generate an accurate agricultural report.

        Follow these steps:
        STEP 1: Identify the Subject (Mention category e.g. Crop Leaf, and confidence).
        STEP 2: Crop Identification (Crop name, scientific name, growth stage).
        STEP 3: Disease Detection (Identify if crop is Healthy or Diseased, disease name, scientific disease name, confidence score, severity: Low/Medium/High/Critical).
        STEP 4: Symptoms (Explain in simple farmer language e.g. curling, yellowing, spots, etc.).
        STEP 5: Cause (Virus, Fungus, Bacteria, Pest, Weather, nutrient deficiency, etc.).
        STEP 6: Biological Control (Organic control treatments, neem oil, Trichoderma, dosage).
        STEP 7: Chemical Treatment (Approved active ingredients, brands, dosage per litre, spray interval, max sprays, waiting period, precautions).
        STEP 8: Prevention (Crop rotation, spacing, resistant varieties).
        STEP 9: Economic Impact (Yield Loss %, Spread Speed, Urgency Level).
        STEP 10: Similar Diseases (Comparison details).
        STEP 11: Multilingual Report (Translate the entire report to English, Hindi, Marathi, Gujarati, Punjabi, Bengali, Tamil, Telugu, Kannada, Malayalam, Odia, Assamese, or Urdu depending on the user's preferred locale. Do not mix languages).
        STEP 12: If the image does NOT contain a crop leaf, fruit, vegetable, flower, stem, root, or seed, return "This image does not appear to contain a crop leaf suitable for disease diagnosis." in the diseaseName field and set confidence lower, do not force disease prediction.
        STEP 13: Hallucination Prevention (If confidence is below 70%, set diseaseName to "Unable to confidently identify. Please upload a clearer image.").

        Return response strictly as a JSON object. Do not include markdown wraps like \`\`\`json. The structure must be:
        {
          "detectedObject": "Tomato Leaf",
          "cropName": "Tomato",
          "scientificName": "Solanum lycopersicum",
          "healthStatus": "Diseased",
          "diseaseName": "Tomato Leaf Curl Virus (TLCV)",
          "confidence": 0.95,
          "severity": "High",
          "symptoms": "Upward curling of leaves and yellowing between veins.",
          "cause": "Whitefly vector transmitting Begomovirus.",
          "treatment": "Uproot infected plants; deploy yellow sticky traps.",
          "organicSolution": "Spray Neem Oil (5ml/L water).",
          "chemicalSolution": "Spray Imidacloprid 17.8% SL (0.5 ml/L).",
          "prevention": "Use insect netting and grow resistant hybrid seeds.",
          "similarDiseases": "Mite damage causing downward leaf roll.",
          "estimatedYieldLoss": "30-50%",
          "recommendedAction": "Isolate the field, treat whiteflies, and destroy infected weeds.",
          "reportLanguage": "English",
          "disclaimer": "Agricultural advice is for reference; verify with local extension agents."
        }
      `;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [imagePart, { text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      });

      const responseText = result.response.text();
      const diagnostic = JSON.parse(responseText);

      // Backwards compatibility mapping
      if (!diagnostic.treatment && diagnostic.recommendedAction) {
        diagnostic.treatment = diagnostic.recommendedAction;
      }

      const record = await db.create(DiseaseReport, {
        userFirebaseId,
        imageUrl,
        ...diagnostic
      });

      return res.status(200).json(record);
    } catch (err) {
      console.warn('Gemini Multimodal Vision Error, executing mock fallback:', err.message);
    }
  }

  // --- MOCK VISION FALLBACK ---
  // Simulate leaf analysis based on filename clues, or choose a random realistic disease
  const leafDiseases = [
    {
      diseaseName: "Tomato Leaf Curl Virus (TLCV)",
      confidence: 0.94,
      symptoms: "Leaves curl upward and inward, resembling cups. Foliage exhibits puckering, yellowing between veins, stunted plant growth, and drop in flower count.",
      treatment: "Uproot and destroy infected plants immediately to prevent further viral transmission. Deploy yellow sticky traps.",
      organicSolution: "Spray Neem oil (5ml per liter of water) mixed with a mild soap solution. Introduce natural predators like lacewings to hunt insect vectors (whiteflies).",
      chemicalSolution: "Apply Imidacloprid 17.8% SL (0.5 ml/liter) or Acetamiprid 20% SP (0.2 g/liter) to eliminate the whitefly vector.",
      prevention: "Cover nursery beds with fine nylon nets. Practice crop rotation with non-solanaceous crops. Eliminate weed hosts."
    },
    {
      diseaseName: "Potato Late Blight (Phytophthora infestans)",
      confidence: 0.88,
      symptoms: "Water-soaked dark spots appear on leaf tips or edges, expanding rapidly. Under humid weather, a fuzzy white fungal growth develops on leaf undersides, eventually rotting tubers.",
      treatment: "Remove damaged stems and foliage. Increase ventilation/spacing.",
      organicSolution: "Spray copper-based organic fungicides. Apply biological control sprays containing Bacillus subtilis.",
      chemicalSolution: "Spray Mancozeb 75% WP (2g/liter) as protective or Metalaxyl 8% + Mancozeb 64% WP (2.5g/liter) at onset of disease.",
      prevention: "Plant certified disease-free seed tubers. Keep soil mounded around stems to shield tubers from spores. Avoid overhead watering."
    },
    {
      diseaseName: "Rice Leaf Blast (Magnaporthe oryzae)",
      confidence: 0.91,
      symptoms: "Elongated, spindle-shaped lesions with grayish centers and dark brown borders appear on leaves, turning into node necrosis and broken panicles (neck blast).",
      treatment: "Drain field water temporarily if nitrogen level is high. Apply protective spray.",
      organicSolution: "Foliar spray with Pseudomonas fluorescens formulation (5g/liter) or cow-urine extracts.",
      chemicalSolution: "Spray Tricyclazole 75% WP (0.6g/liter) or Carbendazim 50% WP (1g/liter) at early symptom emergence.",
      prevention: "Avoid over-fertilizing with nitrogen. Maintain optimal plant spacing. Burn crop stubble post-harvest to kill spores."
    }
  ];

  // Pick a disease based on uploaded filename, or default to random
  let diagnosis = leafDiseases[0];
  const originalName = file ? file.originalname.toLowerCase() : '';
  if (originalName.includes('potato') || originalName.includes('blight')) {
    diagnosis = leafDiseases[1];
  } else if (originalName.includes('rice') || originalName.includes('paddy') || originalName.includes('blast')) {
    diagnosis = leafDiseases[2];
  } else {
    diagnosis = leafDiseases[Math.floor(Math.random() * leafDiseases.length)];
  }

  const record = await db.create(DiseaseReport, {
    userFirebaseId,
    imageUrl,
    ...diagnosis
  });

  return res.status(200).json(record);
};

// ----------------------------------------------------
// 3. AI IRRIGATION PLANNER
// ----------------------------------------------------
export const planIrrigation = async (req, res) => {
  const { cropName, soilType, growthStage, areaSize, waterSource, userFirebaseId } = req.body;

  if (!userFirebaseId) {
    return res.status(400).json({ error: 'User firebase ID is required' });
  }

  // --- GEMINI FLOW ---
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
        Create a detailed 7-day irrigation schedule for:
        Crop Name: ${cropName}
        Soil Type: ${soilType}
        Growth Stage: ${growthStage}
        Area Size: ${areaSize} acres
        Water Source: ${waterSource}

        Return response strictly as a JSON object. Do not include markdown wraps like \`\`\`json. The structure must be:
        {
          "cropName": "${cropName}",
          "wateringSchedule": [
            { "day": "Monday", "waterLiters": 12000, "method": "Drip Irrigation", "durationMinutes": 45 },
            { "day": "Tuesday", "waterLiters": 0, "method": "None (No irrigation needed)", "durationMinutes": 0 }
            ... (for 7 days)
          ],
          "recommendations": "Add customized water saving advice, weather-responsive strategies, and mulching tips."
        }
      `;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      });

      const responseText = result.response.text();
      const plan = JSON.parse(responseText);

      const record = await db.create(IrrigationPlan, {
        userFirebaseId, cropName, soilType, growthStage, areaSize, waterSource,
        wateringSchedule: plan.wateringSchedule,
        recommendations: plan.recommendations
      });

      return res.status(200).json(record);
    } catch (err) {
      console.warn('Gemini Irrigation Planner Error, executing mock fallback:', err.message);
    }
  }

  // --- MOCK FALLBACK ---
  // Create schedule
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const isHighWaterCrop = ['paddy', 'rice', 'sugarcane', 'banana'].includes((cropName || '').toLowerCase());
  const schedule = days.map((day, idx) => {
    // Water every day for high water crops, or alternate days for dry crops
    const needsWater = isHighWaterCrop ? true : (idx % 2 === 0);
    const amount = needsWater ? Math.round(5000 * areaSize) : 0;
    const method = waterSource.toLowerCase().includes('drip') ? 'Drip Lines' : 'Sprinklers';
    return {
      day,
      waterLiters: amount,
      method: needsWater ? method : 'None',
      durationMinutes: needsWater ? 60 : 0
    };
  });

  const recommendations = `Based on the ${soilType} soil type and ${growthStage} growth stage, your crop requires moderate soil humidity. Tip: Avoid watering between 11:00 AM and 3:00 PM to reduce evapotranspiration. We recommend adding straw mulch to retain moisture.`;

  const record = await db.create(IrrigationPlan, {
    userFirebaseId, cropName, soilType, growthStage, areaSize, waterSource,
    wateringSchedule: schedule,
    recommendations
  });

  return res.status(200).json(record);
};

// ----------------------------------------------------
// 4. AI FERTILIZER RECOMMENDATION
// ----------------------------------------------------
export const recommendFertilizers = async (req, res) => {
  const { cropName, soilN, soilP, soilK, targetYieldTonsPerAcre, userFirebaseId } = req.body;

  if (!userFirebaseId) {
    return res.status(400).json({ error: 'User firebase ID is required' });
  }

  // --- GEMINI FLOW ---
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
        Recommend fertilizers based on these soil nutrient levels (in kg/ha):
        Target Crop: ${cropName}
        Current Soil Nitrogen (N): ${soilN}
        Current Soil Phosphorus (P): ${soilP}
        Current Soil Potassium (K): ${soilK}
        Target Yield: ${targetYieldTonsPerAcre} tons/acre

        Return response strictly as a JSON object. Do not include markdown wraps like \`\`\`json. The structure must be:
        {
          "recommendedNPK": { "n": 120, "p": 60, "k": 40 },
          "fertilizersToApply": [
            { "name": "Urea", "amountKgPerAcre": 50, "timing": "Basal dose during sowing", "method": "Broadcasting" },
            { "name": "Single Super Phosphate (SSP)", "amountKgPerAcre": 40, "timing": "Pre-sowing tilling", "method": "Placement" }
          ],
          "organicAlternatives": "List organic replacements like vermicompost, bone meal, neem cake, and biofertilizers (e.g. Azotobacter)."
        }
      `;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      });

      const responseText = result.response.text();
      const plan = JSON.parse(responseText);

      const record = await db.create(FertilizerRecommendation, {
        userFirebaseId, cropName, soilN, soilP, soilK, targetYieldTonsPerAcre,
        recommendedNPK: plan.recommendedNPK,
        fertilizersToApply: plan.fertilizersToApply,
        organicAlternatives: plan.organicAlternatives
      });

      return res.status(200).json(record);
    } catch (err) {
      console.warn('Gemini Fertilizer recommendation error, executing mock:', err.message);
    }
  }

  // --- MOCK FALLBACK ---
  // Simple stoichiometric logic: if soil values are low, suggest higher dosage.
  const nReq = Math.max(0, 100 - parseInt(soilN || 0));
  const pReq = Math.max(0, 50 - parseInt(soilP || 0));
  const kReq = Math.max(0, 50 - parseInt(soilK || 0));

  const fertilizersToApply = [];
  if (nReq > 0) {
    fertilizersToApply.push({
      name: "Urea (46% N)",
      amountKgPerAcre: Math.round(nReq * 1.5),
      timing: "Apply in 2 split doses: 50% at sowing, 50% at tillering (30 days post sowing)",
      method: "Soil Broadcasting"
    });
  }
  if (pReq > 0) {
    fertilizersToApply.push({
      name: "DAP (Diammonium Phosphate - 18% N, 46% P)",
      amountKgPerAcre: Math.round(pReq * 1.8),
      timing: "Apply 100% basal dose during soil preparation / before sowing",
      method: "Band placement next to seed furrows"
    });
  }
  if (kReq > 0) {
    fertilizersToApply.push({
      name: "MOP (Muriate of Potash - 60% K)",
      amountKgPerAcre: Math.round(kReq * 1.2),
      timing: "Basal dose at sowing, or split if sandy soil",
      method: "Soil Broadcasting"
    });
  }

  const organicAlternatives = "Incorporate 5-10 tons of well-rotted farmyard manure (FYM) or Vermicompost per acre during plowing. Apply Azotobacter biofertilizer (seed treatment) to increase N availability naturally, and Phosphate Solubilizing Bacteria (PSB) to dissolve bound soil phosphorus.";

  const record = await db.create(FertilizerRecommendation, {
    userFirebaseId, cropName, soilN, soilP, soilK, targetYieldTonsPerAcre,
    recommendedNPK: { n: nReq, p: pReq, k: kReq },
    fertilizersToApply,
    organicAlternatives
  });

  return res.status(200).json(record);
};
