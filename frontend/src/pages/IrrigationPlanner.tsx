import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { FiDroplet, FiInfo, FiActivity } from 'react-icons/fi';
import { motion } from 'framer-motion';

export const IrrigationPlanner: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [cropName, setCropName] = useState('Paddy (Rice)');
  const [soilType, setSoilType] = useState('Clayey');
  const [growthStage, setGrowthStage] = useState('Initial vegetative');
  const [areaSize, setAreaSize] = useState('2');
  const [waterSource, setWaterSource] = useState('Borewell');

  const [loading, setLoading] = useState(false);
  const [planner, setPlanner] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/api/ai/irrigation-planner', {
        cropName,
        soilType,
        growthStage,
        areaSize: parseFloat(areaSize),
        waterSource,
        userFirebaseId: user?.firebaseId
      });
      setPlanner(response);
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
          💧 {t('irrigationPlanner')}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {language === 'hi' 
            ? 'अपनी फसल, मिट्टी का प्रकार और जल स्रोत दर्ज करें। एआई 7-दिवसीय सिंचाई कार्यक्रम तैयार करेगा।' 
            : 'Enter crop name, soil texture, growth stage, and land area to generate a custom 7-day watering calendar.'}
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
                <option value="Paddy (Rice)">Paddy / Rice (धान)</option>
                <option value="Wheat">Wheat (गेंहू)</option>
                <option value="Maize">Maize (मक्का)</option>
                <option value="Cotton">Cotton (कपास)</option>
                <option value="Onion">Onion (प्याज़)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t('soilType')}</label>
              <select 
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 rounded-xl outline-none text-sm text-gray-800 dark:text-gray-200"
              >
                <option value="Clayey">Clayey (चिकनी मिट्टी)</option>
                <option value="Loamy">Loamy (दोमट)</option>
                <option value="Sandy Loam">Sandy Loam (बलुई दोमट)</option>
                <option value="Black Soil">Black / Cotton (काली मिट्टी)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t('growthStage')}</label>
              <select 
                value={growthStage}
                onChange={(e) => setGrowthStage(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 rounded-xl outline-none text-sm text-gray-800 dark:text-gray-200"
              >
                <option value="Initial sowing / germination">Sowing / Germination</option>
                <option value="Initial vegetative">Vegetative Growth</option>
                <option value="Flowering stage">Flowering Stage</option>
                <option value="Fruit / Grain setting">Grain / Fruit Setting</option>
                <option value="Maturity / Pre-harvest">Maturity / Pre-harvest</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t('landSize')}</label>
                <input 
                  type="number"
                  value={areaSize}
                  onChange={(e) => setAreaSize(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 rounded-xl outline-none text-sm text-gray-800 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{t('waterAvailability')}</label>
                <select 
                  value={waterSource}
                  onChange={(e) => setWaterSource(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 rounded-xl outline-none text-sm text-gray-800 dark:text-gray-200"
                >
                  <option value="Borewell">Borewell (नलकूप)</option>
                  <option value="Canal Ditch">Canal (नहर)</option>
                  <option value="Drip Lines">Drip Lines (टपकन)</option>
                  <option value="Sprinklers">Sprinklers (फव्वारा)</option>
                </select>
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
                  <span>Generating Schedule...</span>
                </>
              ) : (
                <>
                  <span>💧 Generate Schedule</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Panel: Calendar */}
        <div className="lg:col-span-2 space-y-4">
          {planner ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              
              {/* Summary details */}
              <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-150 dark:border-gray-800">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1">
                  <FiActivity className="w-5 h-5 text-blue-500" />
                  Watering Schedule for {planner.cropName}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 pl-6 leading-relaxed">
                  {planner.recommendations}
                </p>
              </div>

              {/* 7-Day Grid Calendar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {planner.wateringSchedule.map((day: any) => (
                  <div 
                    key={day.day} 
                    className={`p-4 rounded-2xl border ${
                      day.waterLiters > 0 
                        ? 'bg-blue-50/40 border-blue-200 dark:bg-blue-950/10 dark:border-blue-900/50' 
                        : 'bg-white border-gray-150 dark:bg-gray-900 dark:border-gray-800'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{day.day}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        day.waterLiters > 0 ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-900'
                      }`}>
                        {day.waterLiters > 0 ? 'Watering' : 'No Action'}
                      </span>
                    </div>
                    {day.waterLiters > 0 ? (
                      <div className="space-y-1">
                        <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                          {day.waterLiters.toLocaleString()} Liters
                        </p>
                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                          Method: {day.method} | Duration: {day.durationMinutes} mins
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-400 font-semibold leading-normal">Soil holds adequate moisture levels. No additional watering required.</p>
                    )}
                  </div>
                ))}
              </div>

            </motion.div>
          ) : (
            <div className="h-[400px] border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl flex flex-col items-center justify-center p-6 text-center">
              <span className="text-5xl mb-3">💧</span>
              <h3 className="font-bold text-gray-700 dark:text-gray-300">Awaiting Irrigation Input</h3>
              <p className="text-xs text-gray-450 mt-1 max-w-sm">
                Enter your crop, soil configuration, land size, and available water source in the left panel to build a smart irrigation scheduling plan.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default IrrigationPlanner;
