import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { generateCropPDF } from '../utils/pdfGenerator';
import { FiTrendingUp, FiDownload, FiInfo, FiDroplet, FiPlusCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

export const CropRecommendation: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [soilType, setSoilType] = useState('Alluvial');
  const [landSize, setLandSize] = useState('2');
  const [state, setState] = useState(user?.state || 'Punjab');
  const [district, setDistrict] = useState(user?.district || 'Ludhiana');
  const [rainfall, setRainfall] = useState('600');
  const [waterAvailability, setWaterAvailability] = useState('Borewell');
  const [budget, setBudget] = useState('15000');
  const [season, setSeason] = useState('Kharif');

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/api/ai/crop-recommendation', {
        soilType,
        landSize: parseFloat(landSize),
        state,
        district,
        rainfall: parseFloat(rainfall),
        waterAvailability,
        budget: parseFloat(budget),
        season,
        userFirebaseId: user?.firebaseId
      });
      setReport(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!report) return;
    generateCropPDF({
      soilType: report.soilType,
      landSize: report.landSize,
      location: `${report.district}, ${report.state}`,
      season: report.season,
      recommendations: report.recommendations
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          🌾 {t('cropRecommendation')}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {language === 'hi' 
            ? 'अपनी मिट्टी और बजट दर्ज करें। एआई तुरंत सबसे फायदेमंद फसल का सुझाव देगा।' 
            : 'Provide soil texture and farming budget. Gemini AI generates optimized recommendations for maximum margins.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Form */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800 h-fit">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t('soilType')}</label>
              <select 
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 rounded-xl outline-none text-sm text-gray-800 dark:text-gray-200"
              >
                <option value="Alluvial">Alluvial (जलोढ़)</option>
                <option value="Clayey">Clayey (चिकनी मिट्टी)</option>
                <option value="Sandy Loam">Sandy Loam (बलुई दोमट)</option>
                <option value="Black Soil">Black / Cotton (काली मिट्टी)</option>
                <option value="Red Soil">Red Soil (लाल मिट्टी)</option>
                <option value="Laterite">Laterite (लेटराइट)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t('landSize')}</label>
                <input 
                  type="number"
                  value={landSize}
                  onChange={(e) => setLandSize(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 rounded-xl outline-none text-sm text-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t('sowingSeason')}</label>
                <select 
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 rounded-xl outline-none text-sm text-gray-800 dark:text-gray-200"
                >
                  <option value="Kharif">Kharif (Monsoon)</option>
                  <option value="Rabi">Rabi (Winter)</option>
                  <option value="Zaid">Zaid (Summer)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t('state')}</label>
                <input 
                  type="text" 
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 rounded-xl outline-none text-sm text-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t('district')}</label>
                <input 
                  type="text" 
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 rounded-xl outline-none text-sm text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t('waterAvailability')}</label>
              <select 
                value={waterAvailability}
                onChange={(e) => setWaterAvailability(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 rounded-xl outline-none text-sm text-gray-800 dark:text-gray-200"
              >
                <option value="Borewell">Borewell (नलकूप)</option>
                <option value="Canal Irrigation">Canal (नहर)</option>
                <option value="Drip Irrigation">Drip Lines (टपकन सिंचाई)</option>
                <option value="Rainfed">Rainfed (वर्षा पर निर्भर)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t('rainfall')} (mm)</label>
                <input 
                  type="number"
                  value={rainfall}
                  onChange={(e) => setRainfall(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 rounded-xl outline-none text-sm text-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t('budget')} (₹)</label>
                <input 
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 rounded-xl outline-none text-sm text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-650 hover:bg-primary-700 text-white rounded-xl font-bold shadow-md shadow-primary-500/10 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>{language === 'hi' ? 'विश्लेषण जारी है...' : 'AI Analyzing...'}</span>
                </>
              ) : t('submit')}
            </button>
          </form>
        </div>

        {/* Right Side: Results */}
        <div className="lg:col-span-2 space-y-4">
          
          {report ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              {/* Header with download PDF */}
              <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 px-6 rounded-2xl border border-gray-150 dark:border-gray-800">
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-gray-100">AI analysis Successful</h3>
                  <p className="text-[11px] text-gray-400">Suggesting top {report.recommendations.length} profitable crops</p>
                </div>
                <button 
                  onClick={handleDownloadPDF}
                  className="p-2.5 bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-950/30 dark:text-primary-400 dark:hover:bg-primary-950/60 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <FiDownload className="w-4 h-4" /> {t('downloadPDF')}
                </button>
              </div>

              {/* Suggestions Cards */}
              {report.recommendations.map((crop: any, idx: number) => (
                <div key={crop.cropName} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm relative overflow-hidden">
                  
                  {/* Background green accent decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl -mr-10 -mt-10" />

                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded-full">
                        Choice #{idx + 1}
                      </span>
                      <h4 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">{crop.cropName}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400 block">{t('confidence')}</span>
                      <span className="text-lg font-extrabold text-primary-600 dark:text-primary-400">{(crop.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-5 leading-relaxed relative z-10">{crop.explanation}</p>

                  {/* Financials details */}
                  <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-150 dark:border-gray-850">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">Expected Sale Price</span>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">₹{crop.expectedPrice} / q</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">Estimated Cost</span>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">₹{crop.expectedCost} / q</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">Net Profit Margin</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <FiTrendingUp className="w-3.5 h-3.5" /> ₹{crop.expectedProfit} / q
                      </span>
                    </div>
                  </div>

                  {/* Guides */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50/40 dark:bg-blue-950/10 rounded-xl border border-blue-100/30 flex gap-2">
                      <FiDroplet className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 block">Watering Regime</span>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal">{crop.irrigationGuide}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-50/40 dark:bg-emerald-950/10 rounded-xl border border-emerald-100/30 flex gap-2">
                      <FiPlusCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block">NPK Requirement</span>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal">{crop.fertilizerGuide}</p>
                      </div>
                    </div>
                  </div>

                </div>
              ))}

            </motion.div>
          ) : (
            <div className="h-[400px] border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl flex flex-col items-center justify-center p-6 text-center">
              <span className="text-5xl mb-3">🌾</span>
              <h3 className="font-bold text-gray-700 dark:text-gray-300">Awaiting Farm Details</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                Enter your soil specifications, location parameters, and agricultural budget in the left panel to query the AI recommendation model.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default CropRecommendation;
