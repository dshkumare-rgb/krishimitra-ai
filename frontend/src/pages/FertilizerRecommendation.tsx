import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { FiPlusCircle, FiCheck, FiInfo } from 'react-icons/fi';
import { motion } from 'framer-motion';

export const FertilizerRecommendation: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [cropName, setCropName] = useState('Wheat');
  const [soilN, setSoilN] = useState('45');
  const [soilP, setSoilP] = useState('22');
  const [soilK, setSoilK] = useState('240');
  const [targetYield, setTargetYield] = useState('2.5');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/api/ai/fertilizer-recommendation', {
        cropName,
        soilN: parseFloat(soilN),
        soilP: parseFloat(soilP),
        soilK: parseFloat(soilK),
        targetYieldTonsPerAcre: parseFloat(targetYield),
        userFirebaseId: user?.firebaseId
      });
      setResult(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          🧪 {t('fertilizerRecommend')}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {language === 'hi' 
            ? 'अपनी मिट्टी के पोषक तत्वों का स्तर (N-P-K) दर्ज करें। एआई आवश्यक खाद की खुराक बताएगा।' 
            : 'Enter Nitrogen, Phosphorus, and Potassium soil values to calculate exact fertilizer dosages.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800 h-fit">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Target Crop</label>
              <select 
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 rounded-xl outline-none text-sm text-gray-800 dark:text-gray-200"
              >
                <option value="Wheat">Wheat (गेंहू)</option>
                <option value="Paddy (Rice)">Paddy / Rice (धान)</option>
                <option value="Cotton">Cotton (कपास)</option>
                <option value="Soybean">Soybean (सोयाबीन)</option>
                <option value="Mustard">Mustard (सरसों)</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Nitrogen (N)</label>
                <input 
                  type="number"
                  value={soilN}
                  onChange={(e) => setSoilN(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 rounded-xl outline-none text-xs font-bold text-gray-700 dark:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Phosphorus (P)</label>
                <input 
                  type="number"
                  value={soilP}
                  onChange={(e) => setSoilP(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 rounded-xl outline-none text-xs font-bold text-gray-700 dark:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Potassium (K)</label>
                <input 
                  type="number"
                  value={soilK}
                  onChange={(e) => setSoilK(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 rounded-xl outline-none text-xs font-bold text-gray-700 dark:text-gray-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Target Yield (Tons/Acre)</label>
              <input 
                type="number"
                step="0.1"
                value={targetYield}
                onChange={(e) => setTargetYield(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 rounded-xl outline-none text-sm text-gray-800 dark:text-gray-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-md shadow-primary-500/10 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Calculating Dosages...</span>
                </>
              ) : (
                <>
                  <span>🧪 Calculate Dosage</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right results */}
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              {/* NPK suggested card */}
              <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-150 dark:border-gray-800">
                <h3 className="font-bold text-gray-850 dark:text-gray-150 mb-3 text-xs uppercase tracking-wider">Required Nutrient Balance (NPK in kg/acre)</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-red-50/40 dark:bg-red-950/10 border border-red-100 dark:border-red-900/40 rounded-2xl text-center">
                    <span className="text-[10px] font-bold text-red-500 block uppercase">Nitrogen (N)</span>
                    <span className="text-xl font-extrabold text-red-700 dark:text-red-400">{result.recommendedNPK.n} kg</span>
                  </div>
                  <div className="p-3 bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/40 rounded-2xl text-center">
                    <span className="text-[10px] font-bold text-blue-500 block uppercase">Phosphorus (P)</span>
                    <span className="text-xl font-extrabold text-blue-700 dark:text-blue-400">{result.recommendedNPK.p} kg</span>
                  </div>
                  <div className="p-3 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl text-center">
                    <span className="text-[10px] font-bold text-emerald-500 block uppercase">Potassium (K)</span>
                    <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">{result.recommendedNPK.k} kg</span>
                  </div>
                </div>
              </div>

              {/* Specific fertilizers list */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800 space-y-4">
                <h3 className="font-bold text-gray-850 dark:text-gray-150 text-sm">Recommended Commercial Fertilizers</h3>
                
                <div className="space-y-3">
                  {result.fertilizersToApply.map((fert: any) => (
                    <div key={fert.name} className="p-4 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-850 rounded-2xl flex items-start gap-3">
                      <FiCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-xs text-gray-850 dark:text-gray-100">{fert.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-primary-50 text-primary-700 border border-primary-100 dark:bg-primary-950 dark:text-primary-400 dark:border-primary-900 uppercase">
                            {fert.amountKgPerAcre} kg / acre
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-gray-450 mt-1 uppercase tracking-wider">{fert.method} | {fert.timing}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Organic advice */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800">
                <h3 className="font-bold text-gray-850 dark:text-gray-150 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FiInfo className="w-4 h-4 text-primary-600" /> Organic & Bio-fertilizer Alternatives
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {result.organicAlternatives}
                </p>
              </div>

            </motion.div>
          ) : (
            <div className="h-[400px] border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl flex flex-col items-center justify-center p-6 text-center">
              <span className="text-5xl mb-3">🧪</span>
              <h3 className="font-bold text-gray-700 dark:text-gray-300">Awaiting Soil Test Data</h3>
              <p className="text-xs text-gray-450 mt-1 max-w-sm">
                Enter your Nitrogen (N), Phosphorus (P), and Potassium (K) levels in the left panel to execute stoichiometric nutrient deficit calculations.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default FertilizerRecommendation;
