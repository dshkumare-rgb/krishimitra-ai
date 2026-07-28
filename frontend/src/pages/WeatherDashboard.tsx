import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { api } from '../services/api';
import ChartComponent from '../components/ChartComponent';
import { FiCloudRain, FiMapPin, FiWind, FiDroplet, FiNavigation, FiCalendar } from 'react-icons/fi';

export const WeatherDashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const { getCoordinates, districtName, stateName } = useLocation();

  const [lat, setLat] = useState('22.719');
  const [lon, setLon] = useState('75.857');
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = async (targetLat = lat, targetLon = lon) => {
    setLoading(true);
    try {
      const data = await api.get(`/api/weather/forecast?lat=${targetLat}&lon=${targetLon}`, `weather-${targetLat}-${targetLon}`);
      setWeather(data);
    } catch (err) {
      console.error('Weather load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { lat: newLat, lon: newLon } = getCoordinates();
    setLat(newLat.toFixed(3));
    setLon(newLon.toFixed(3));
    fetchWeather(newLat.toFixed(3), newLon.toFixed(3));
  }, [stateName, districtName]);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLat = position.coords.latitude.toFixed(3);
          const currentLon = position.coords.longitude.toFixed(3);
          setLat(currentLat);
          setLon(currentLon);
          fetchWeather(currentLat, currentLon);
        },
        (error) => {
          console.warn('Geolocation denied:', error.message);
          alert('Could not access current location. Standard coordinates set.');
        }
      );
    }
  };

  const chartLabels = weather ? weather.forecast.map((f: any) => f.date.split('-').slice(1).join('/')) : [];
  const chartTemps = weather ? weather.forecast.map((f: any) => f.tempMax) : [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            🌤️ {t('weather')}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {language === 'hi'
              ? 'मौसम की स्थिति और 5-दिन का पूर्वानुमान। अपने स्थान के लिए विशेष कृषि सलाहकार सलाह प्राप्त करें।'
              : 'Localized atmospheric parameters and 5-day forecasts. Includes customized smart agricultural guidance.'}
          </p>
        </div>

        {/* Location selector form */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-2 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-sm flex-wrap">
          <div className="flex items-center gap-1.5 px-2">
            <span className="text-[10px] font-bold text-gray-450 uppercase">Lat</span>
            <input 
              type="text" 
              value={lat} 
              onChange={(e) => setLat(e.target.value)} 
              className="w-14 bg-transparent outline-none border-none text-xs font-bold text-gray-700 dark:text-gray-300"
            />
          </div>
          <div className="flex items-center gap-1.5 px-2 border-l border-gray-150 dark:border-gray-850">
            <span className="text-[10px] font-bold text-gray-450 uppercase">Lon</span>
            <input 
              type="text" 
              value={lon} 
              onChange={(e) => setLon(e.target.value)} 
              className="w-14 bg-transparent outline-none border-none text-xs font-bold text-gray-700 dark:text-gray-300"
            />
          </div>
          <button 
            onClick={() => fetchWeather()}
            disabled={loading}
            className="px-3.5 py-1.5 bg-primary-600 text-white rounded-xl text-xs font-bold transition hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? '...' : 'Fetch'}
          </button>
          <button 
            onClick={handleGetCurrentLocation}
            className="p-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-950 dark:hover:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-400 transition"
            title="Locate Me"
          >
            <FiNavigation className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {weather && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel: Current details */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800 space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-gray-400">Current Weather</span>
                <h3 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mt-1 flex items-center gap-1">
                  <span>{weather.current.temp}°C</span>
                  <span className="text-2xl">{weather.current.icon}</span>
                </h3>
                <p className="text-xs font-bold text-primary-600 dark:text-primary-400">{weather.current.description}</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400">
                <FiMapPin className="w-3.5 h-3.5" /> {districtName}, {stateName}
              </div>
            </div>

            {/* Weather Metrics list */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-150 dark:border-gray-850 flex items-center gap-3">
                <FiDroplet className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Humidity</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{weather.current.humidity}%</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-150 dark:border-gray-850 flex items-center gap-3">
                <FiWind className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Wind Speed</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{weather.current.windSpeed} km/h</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-150 dark:border-gray-850 flex items-center gap-3">
                <FiCloudRain className="w-5 h-5 text-teal-500 flex-shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Precipitation</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{weather.current.precipitation} mm</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-150 dark:border-gray-850 flex items-center gap-3">
                <span className="text-xl flex-shrink-0">🌡️</span>
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Feels Like</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{weather.current.feelsLike}°C</span>
                </div>
              </div>
            </div>

            {/* Local Advisories */}
            <div className="pt-2 border-t border-gray-150 dark:border-gray-850">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                💼 Agricultural Advisory
              </h4>
              <div className="space-y-2">
                {weather.advisories.map((advisory: string, idx: number) => (
                  <p key={idx} className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed border-l-2 border-primary-500 pl-2">
                    {advisory}
                  </p>
                ))}
              </div>
            </div>

          </div>

          {/* Right panel: Forecast & temperature trend chart */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Forecast Chart */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-1.5">
                📈 5-Day Max Temperature Trend
              </h3>
              <div className="h-[180px]">
                <ChartComponent 
                  labels={chartLabels}
                  data={chartTemps}
                  label="Max Temp (°C)"
                  borderColor="#3b82f6"
                  backgroundColor="rgba(59, 130, 246, 0.1)"
                />
              </div>
            </div>

            {/* Daily Grid list */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-1.5">
                <FiCalendar className="w-5 h-5 text-gray-450" />
                5-Day Daily Outlook
              </h3>

              <div className="divide-y divide-gray-100 dark:divide-gray-850">
                {weather.forecast.map((day: any) => {
                  const dateObj = new Date(day.date);
                  const dayOfWeek = dateObj.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'short' });
                  const calendarDate = dateObj.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { day: 'numeric', month: 'short' });
                  
                  return (
                    <div key={day.date} className="flex items-center justify-between py-3 text-xs">
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200">{dayOfWeek}</p>
                        <p className="text-[10px] text-gray-450">{calendarDate}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl">{day.icon}</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{day.description}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800 dark:text-gray-200">{day.tempMax}°C</p>
                        <p className="text-[10px] text-gray-400">Min: {day.tempMin}°C</p>
                      </div>
                      <div className="w-16 text-right font-medium text-blue-600 dark:text-blue-400">
                        {day.precipitation > 0 ? `💧 ${day.precipitation}mm` : 'Dry'}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default WeatherDashboard;
