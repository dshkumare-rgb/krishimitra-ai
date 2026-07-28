import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import ChartComponent from '../components/ChartComponent';
import DronePatrol from '../components/DronePatrol';
import { 
  FiCloudRain, FiAlertTriangle, FiDollarSign, FiAward, 
  FiArrowRight, FiThermometer, FiCheckSquare, FiMapPin 
} from 'react-icons/fi';
import { useLocation } from '../context/LocationContext';
import LocationPicker from '../components/LocationPicker';

interface DashboardProps {
  setActivePage: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActivePage }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [weatherData, setWeatherData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [mandis, setMandis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { stateName, districtName, getCoordinates } = useLocation();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const { lat, lon } = getCoordinates();
        
        // Fetch weather cache-aware
        const weather = await api.get(`/api/weather/forecast?lat=${lat}&lon=${lon}`, `weather-${districtName}`);
        setWeatherData(weather);

        // Fetch alerts cache-aware
        const alertList = await api.get(`/api/alerts/pest?state=${stateName}&district=${districtName}`, `alerts-${districtName}`);
        setAlerts(alertList);

        // Fetch mandi prices cache-aware
        const mandiList = await api.get(`/api/mandi/prices?state=${stateName}&district=${districtName}`, `mandi-${districtName}`);
        setMandis(mandiList);
        
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [stateName, districtName]);

  const wheatMandi = mandis.find(m => m.cropName === 'Wheat') || mandis[0];
  const chartLabels = wheatMandi ? wheatMandi.priceHistory.map((h: any) => h.month) : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartValues = wheatMandi ? wheatMandi.priceHistory.map((h: any) => h.price) : [2100, 2150, 2200, 2250, 2220, 2210, 2230, 2240, 2250, 2260, 2270, 2275];

  // Recommendations checklist depending on season
  const checklist = language === 'hi' ? [
    { text: "धान के खेतों में 5-10 सेमी पानी का स्तर बनाए रखें।" },
    { text: "कपास के खेतों में जलभराव रोकने के लिए जल निकासी मार्ग साफ करें।" },
    { text: "पत्तियों पर भूरे या पीले धब्बों (ब्लास्ट बीमारी) के लक्षणों की जांच करें।" },
    { text: "खेतों में उर्वरकों के छिड़काव से पहले मौसम पूर्वानुमान की जांच अवश्य करें।" }
  ] : [
    { text: "Maintain 5-10 cm water level in Paddy/Rice fields." },
    { text: "Clear field drainage lanes to prevent waterlogging in cotton belts." },
    { text: "Inspect rice leaf blades for diamond-shaped blast spots daily." },
    { text: "Verify weather predictions before spraying granular fertilizers." }
  ];

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between p-6 bg-primary-50 dark:bg-gray-900 rounded-3xl border border-primary-100 dark:border-gray-800 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold md:text-3xl text-gray-900 dark:text-gray-100">{t('welcome')}, {user?.displayName}!</h2>
          <p className="text-sm text-gray-650 dark:text-gray-300 mt-1.5 max-w-xl">
            {language === 'hi' 
              ? 'कृषिमित्र एआई में आपका स्वागत है। यहाँ आपके खेतों के लिए मौसम, मंडी भाव और कीट संबंधी ताज़ा चेतावनियाँ दी गई हैं।' 
              : 'Welcome to your smart farm assistant. Get localized weather metrics, mandi price analytics, and automated pest alert updates instantly.'}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3 flex-wrap">
          <button 
            onClick={() => setActivePage('crop')}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm transition shadow-sm"
          >
            🌾 {t('cropRecommendation')}
          </button>
          <button 
            onClick={() => setActivePage('disease')}
            className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-850 dark:text-gray-300 dark:border-gray-750 dark:hover:bg-gray-800 font-bold rounded-xl text-sm transition shadow-sm"
          >
            🔍 {t('diseaseDetection')}
          </button>
          <button 
            onClick={() => setActivePage('soil-card')}
            className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-850 dark:text-gray-300 dark:border-gray-750 dark:hover:bg-gray-800 font-bold rounded-xl text-sm transition shadow-sm"
          >
            🌱 {t('soilHealthCard')}
          </button>
        </div>
      </div>

      {/* Location Selector Dropdowns */}
      <LocationPicker />

      {/* Grid: 4 Info Widget Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Weather card */}
        <div id="weather-stat-card" className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-150 dark:border-gray-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-2xl">
            {weatherData?.current?.icon || '⛅'}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('weather')}</p>
            <h3 className="text-xl font-bold mt-0.5 text-gray-800 dark:text-gray-100">{weatherData?.current?.temp || '28.5'}°C</h3>
            <span className="text-xs text-gray-400 truncate block max-w-[140px]">{weatherData?.current?.description || 'Partly Cloudy'}</span>
            <span className="text-[10px] text-gray-400 mt-1 block leading-tight">
              {t('weatherSource')} OpenWeather/Meteo
            </span>
          </div>
        </div>

        {/* Mandi card */}
        <div id="mandi-stat-card" className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-150 dark:border-gray-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <FiDollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('mandiPrices')} (Wheat)</p>
            <h3 className="text-xl font-bold mt-0.5 text-gray-800 dark:text-gray-100">₹{wheatMandi?.currentPrice || '2,275'}/q</h3>
            <span className="text-[10px] bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 px-2 py-0.5 rounded-full font-bold uppercase inline-block">
              📈 {wheatMandi?.expectedTrend || 'UP'}
            </span>
            <span className="text-[10px] text-gray-400 mt-1 block leading-tight">
              {t('mandiSource')} Agmarknet OGD
            </span>
          </div>
        </div>


        {/* Active Alerts */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-150 dark:border-gray-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 flex items-center justify-center">
            <FiAlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('pestAlerts')}</p>
            <h3 className="text-xl font-bold mt-0.5 text-gray-800 dark:text-gray-100">{alerts.length} Active</h3>
            <span className="text-xs text-red-500 dark:text-red-400 font-medium">Near your district</span>
          </div>
        </div>

        {/* Govt Schemes */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-150 dark:border-gray-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <FiAward className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Govt Schemes</p>
            <h3 className="text-xl font-bold mt-0.5 text-gray-800 dark:text-gray-100">6 Available</h3>
            <span className="text-xs text-gray-400 font-medium">Eligibles for you</span>
          </div>
        </div>

      </div>

      {/* Grid: Chart & Weather advisories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2/3: Market Trend Graph */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">{t('priceHistory')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Showing monthly trends for {wheatMandi?.cropName || 'Wheat'} in {wheatMandi?.market || 'Ludhiana Mandi'}</p>
            </div>
            <button 
              onClick={() => setActivePage('mandi')}
              className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              Analyze Mandis <FiArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 h-[260px]">
            <ChartComponent 
              labels={chartLabels}
              data={chartValues}
              label={wheatMandi ? `${wheatMandi.cropName} (Rs. per Quintal)` : 'Wheat price trend'}
            />
          </div>
        </div>

        {/* Right 1/3: Weather Advisory */}
        <div id="agro-weather-advisory-panel" className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-1.5">
              <FiCloudRain className="w-5 h-5 text-blue-500" />
              {language === 'hi' ? 'मौसम कृषि सलाहकार' : 'Agro-Weather Advisory'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Live recommendations based on weather parameters</p>
            
            <div className="bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900 p-3 rounded-2xl text-[10px] text-orange-700 dark:text-orange-400 mb-3 flex gap-2 items-start leading-snug">
              <FiInfo className="w-4 h-4 shrink-0 mt-0.5 text-orange-500" />
              <span>{t('advisorySourceDisclaimer')}</span>
            </div>

            
            <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
              {weatherData?.advisories?.map((advisory: string, idx: number) => (
                <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-850 rounded-2xl text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed shadow-sm">
                  {advisory}
                </div>
              ))}
              {(!weatherData || weatherData.advisories.length === 0) && (
                <p className="text-xs text-gray-400">Loading advisories...</p>
              )}
            </div>
          </div>
          <button 
            onClick={() => setActivePage('weather')}
            className="w-full mt-4 py-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 hover:dark:bg-blue-950/45 text-xs font-bold rounded-2xl transition flex items-center justify-center gap-1.5"
          >
            <FiThermometer className="w-4 h-4" /> View 5-Day Forecast
          </button>
        </div>

      </div>

      {/* Bottom Grid: Seasonal Checklist, Drone Patrol, & Pest warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Sowing checklist */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1.5 flex items-center gap-2">
              <FiCheckSquare className="w-5 h-5 text-primary-600" />
              {language === 'hi' ? 'सामयिक कृषि कार्यों की सूची' : 'Seasonal Sowing Checklist'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Recommended actions to complete this week</p>

            <div className="space-y-4">
              {checklist.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    defaultChecked={idx === 0}
                    className="mt-1 w-4 h-4 text-primary-600 border-gray-350 rounded focus:ring-primary-500" 
                  />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Middle: Drone Patrol Live Feed */}
        <DronePatrol />

        {/* Right: Pest Alerts warnings */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-1 flex items-center gap-2">
              <FiAlertTriangle className="w-5 h-5 text-red-500" />
              {t('activePestWarnings')}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Outbreaks reported by neighbors or satellites</p>

            <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
              {alerts.slice(0, 3).map((alert: any) => (
                <div 
                  key={alert._id || alert.pestName} 
                  className={`p-3 border rounded-2xl flex justify-between items-start ${
                    alert.severity === 'HIGH' 
                      ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900 text-red-700 dark:text-red-400' 
                      : 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900 text-amber-700 dark:text-amber-400'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold">{alert.pestName}</p>
                    <p className="text-[11px] font-semibold opacity-90">Crop: {alert.cropAffected}</p>
                    <span className="text-[10px] flex items-center gap-0.5 font-medium mt-1">
                      <FiMapPin className="w-3 h-3" /> {alert.district}, {alert.state}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-white/70 dark:bg-gray-900/60 uppercase">
                    {alert.severity}
                  </span>
                </div>
              ))}
              {alerts.length === 0 && (
                <p className="text-xs text-gray-450">No active insect outbreaks in your state. Maintain basic cleanliness.</p>
              )}
            </div>
          </div>
          <button 
            onClick={() => setActivePage('pests')}
            className="w-full mt-4 py-3 bg-red-550 text-white hover:bg-red-600 text-xs font-bold rounded-2xl transition shadow-sm"
          >
            ⚠️ Report or View Outbreaks Map
          </button>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
