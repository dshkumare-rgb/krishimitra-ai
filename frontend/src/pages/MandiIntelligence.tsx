import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { api } from '../services/api';
import ChartComponent from '../components/ChartComponent';
import MapContainer, { MapMarkerItem } from '../components/MapContainer';
import { FiTrendingUp, FiSearch, FiMapPin, FiCompass, FiMap } from 'react-icons/fi';

export const MandiIntelligence: React.FC = () => {
  const { t, language } = useLanguage();
  const { stateName } = useLocation();

  const [mandis, setMandis] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [selectedState, setSelectedState] = useState(stateName || 'All');
  const [selectedMandi, setSelectedMandi] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const url = `/api/mandi/prices?cropName=${selectedCrop}${selectedState !== 'All' ? `&state=${selectedState}` : ''}`;
      const data = await api.get(url, 'mandi');
      setMandis(data);
      if (data.length > 0) {
        setSelectedMandi(data[0]);
      } else {
        setSelectedMandi(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedState(stateName);
  }, [stateName]);

  useEffect(() => {
    fetchPrices();
  }, [selectedCrop, selectedState]);

  // Convert mandis to map markers
  const mapMarkers: MapMarkerItem[] = mandis.map(m => ({
    id: m._id,
    latitude: m.latitude || 22.719,
    longitude: m.longitude || 75.857,
    label: `${m.market} (${m.cropName})`,
    info: `Price: ₹${m.currentPrice} per Quintal | Trend: ${m.expectedTrend}`
  }));

  const chartLabels = selectedMandi ? selectedMandi.priceHistory.map((h: any) => h.month) : [];
  const chartValues = selectedMandi ? selectedMandi.priceHistory.map((h: any) => h.price) : [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            📊 {t('mandiPrices')}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {language === 'hi' 
              ? 'अनाज और सब्जियों के ताजा मंडी भाव देखें। निकटतम मंडियों की खोज करें और रुझान समझें।' 
              : 'Search localized crop prices across regional mandi markets. Analyze 12-month historical graphs and expected trends.'}
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <select 
            value={selectedCrop} 
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl outline-none text-xs font-bold text-gray-700 dark:text-gray-200"
          >
            <option value="Wheat">Wheat (गेंहू)</option>
            <option value="Paddy (Rice)">Paddy / Rice (धान)</option>
            <option value="Soybean">Soybean (सोयाबीन)</option>
            <option value="Cotton">Cotton (कपास)</option>
            <option value="Onion">Onion (प्याज)</option>
            <option value="Potato">Potato (आलू)</option>
            <option value="Mustard">Mustard (सरसों)</option>
            <option value="Sugarcane">Sugarcane (गन्ना)</option>
            <option value="Barley">Barley (जौ)</option>
          </select>
          <select 
            value={selectedState} 
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-2xl outline-none text-xs font-bold text-gray-700 dark:text-gray-200"
          >
            <option value="All">All States</option>
            <option value="Punjab">Punjab</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left pane: Proximity List */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800 space-y-4 h-fit">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1.5 text-sm">
            <FiCompass className="w-5 h-5 text-primary-600" />
            {t('nearestMandi')}
          </h3>
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {mandis.map((m) => {
              const isActive = selectedMandi && selectedMandi._id === m._id;
              return (
                <div 
                  key={m._id}
                  onClick={() => setSelectedMandi(m)}
                  className={`p-3.5 border rounded-2xl cursor-pointer transition flex items-start justify-between ${
                    isActive 
                      ? 'bg-primary-50 border-primary-300 dark:bg-primary-950/20 dark:border-primary-900 text-primary-900 dark:text-primary-300' 
                      : 'bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-xs">{m.market}</p>
                    <span className="text-[10px] text-gray-400 block">{m.district}, {m.state}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xs">₹{m.currentPrice}/q</p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      m.expectedTrend === 'UP' 
                        ? 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400' 
                        : m.expectedTrend === 'DOWN' 
                        ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400' 
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-400'
                    }`}>
                      {m.expectedTrend}
                    </span>
                  </div>
                </div>
              );
            })}
            {mandis.length === 0 && (
              <p className="text-xs text-gray-450 text-center py-6">No mandis found matching the selected filters.</p>
            )}
          </div>
        </div>

        {/* Right pane: Map and History Chart */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Map */}
          {mapMarkers.length > 0 && (
            <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-150 dark:border-gray-800 flex flex-col gap-3">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 text-xs flex items-center gap-1">
                <FiMap className="w-4 h-4 text-emerald-500" /> Mandi Locations Map
              </h3>
              <MapContainer items={mapMarkers} />
            </div>
          )}

          {/* Details & historical graph */}
          {selectedMandi && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800">
              
              {/* Left detail */}
              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Market Detail</span>
                  <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-0.5">{selectedMandi.market}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                    <FiMapPin className="w-3.5 h-3.5 text-primary-600" />
                    {selectedMandi.district}, {selectedMandi.state}
                  </p>
                </div>

                <div className="p-3.5 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-850 rounded-2xl">
                  <span className="text-[10px] text-gray-450 font-bold block">{t('expectedTrend')}</span>
                  <span className={`text-sm font-extrabold flex items-center gap-1 ${
                    selectedMandi.expectedTrend === 'UP' ? 'text-emerald-600' : 'text-slate-600'
                  }`}>
                    <FiTrendingUp className="w-4 h-4" /> {selectedMandi.expectedTrend} Outlook
                  </span>
                  <p className="text-[11px] text-gray-500 dark:text-gray-450 mt-1 leading-relaxed">{selectedMandi.trendReasoning}</p>
                </div>
              </div>

              {/* Right: History chart */}
              <div className="flex flex-col justify-between">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">{t('priceHistory')}</h4>
                <div className="h-[150px]">
                  <ChartComponent 
                    labels={chartLabels}
                    data={chartValues}
                    label={`${selectedMandi.cropName} (Rs/quintal)`}
                  />
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default MandiIntelligence;
