import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FiSliders, FiBell, FiPhone, FiInfo, FiPercent, FiRefreshCw } from 'react-icons/fi';
import axios from 'axios';

export const Settings: React.FC = () => {
  const { t, language } = useLanguage();
  
  // Alert settings states
  const [phone, setPhone] = useState('');
  const [alertPest, setAlertPest] = useState(true);
  const [alertWeather, setAlertWeather] = useState(true);
  const [alertMandi, setAlertMandi] = useState(true);
  const [alertMandiThreshold, setAlertMandiThreshold] = useState(10);
  const [alertSchemes, setAlertSchemes] = useState(true);
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const userId = localStorage.getItem('userId') || 'default-farmer';
  const locStr = localStorage.getItem('userLocation');
  const userLoc = locStr ? JSON.parse(locStr) : { state: 'Madhya Pradesh', district: 'Indore' };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await axios.get(`/api/alerts-sub/subscription?userId=${userId}`);
      if (response.data) {
        setPhone(response.data.phone);
        setAlertPest(response.data.alertPest);
        setAlertWeather(response.data.alertWeather);
        setAlertMandi(response.data.alertMandi);
        setAlertMandiThreshold(response.data.alertMandiThreshold);
        setAlertSchemes(response.data.alertSchemes);
      }
    } catch (err) {
      console.error('Failed to fetch subscription config:', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post('/api/alerts-sub/subscription', {
        userId,
        phone,
        state: userLoc.state,
        district: userLoc.district,
        alertPest,
        alertWeather,
        alertMandi,
        alertMandiThreshold,
        alertSchemes
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save alert preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  const triggerReplayTour = () => {
    localStorage.removeItem('km-has-seen-tour');
    // Force a reload to let Layout trigger the onboarding tour automatically on start
    window.location.reload();
  };

  return (
    <div className="space-y-8 p-6 max-w-2xl mx-auto">
      
      {/* Title */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-3xl shadow-sm">
        <h2 className="text-2xl font-black text-gray-850 dark:text-gray-100 flex items-center gap-2">
          ⚙️ {t('settings')}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {language === 'hi' 
            ? 'अपनी अलर्ट प्राथमिकताओं और सिस्टम प्राथमिकताओं को कॉन्फ़िगर करें।' 
            : 'Configure your notification alerts and user preferences.'}
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Onboarding replay box */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-3xl shadow-sm space-y-3">
          <h3 className="font-bold text-gray-800 dark:text-gray-250 text-sm flex items-center gap-2">
            <FiRefreshCw className="text-primary-600 animate-spin-slow" />
            {language === 'hi' ? 'मार्गदर्शन टूर' : 'Interactive Onboarding'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {language === 'hi' 
              ? 'क्या आप सिस्टम का परिचय देने वाला वॉकथ्रू मार्गदर्शन पुनः देखना चाहते हैं?' 
              : 'Would you like to replay the first-time user tour highlight of the main dashboard tools?'}
          </p>
          <button
            type="button"
            onClick={triggerReplayTour}
            className="px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 border border-gray-150 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 rounded-xl transition-all"
          >
            🔄 {t('replayTour')}
          </button>
        </div>

        {/* Alert preferences box */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-bold text-gray-800 dark:text-gray-250 text-sm flex items-center gap-2 uppercase tracking-wider">
            <FiBell className="text-primary-600" />
            {language === 'hi' ? 'अलर्ट प्राथमिकताएं' : 'WhatsApp / SMS Alert Preferences'}
          </h3>

          <div className="space-y-4">
            
            {/* Phone input */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                <FiPhone /> {language === 'hi' ? 'मोबाइल नंबर (WhatsApp के लिए)' : 'Mobile Number (WhatsApp/SMS)'}
              </label>
              <input 
                type="tel" 
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-100"
                placeholder="e.g. +91 98765 43210"
              />
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-850" />

            {/* Subscriptions */}
            <div className="space-y-3">
              
              {/* Pest warnings toggle */}
              <label className="flex items-center justify-between cursor-pointer p-1">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-250">
                    {language === 'hi' ? 'कीट हमले की चेतावनी' : 'Pest Alerts'}
                  </span>
                  <p className="text-[10px] text-gray-400">{language === 'hi' ? 'जिले में सक्रिय कीट प्रकोप की तत्काल चेतावनी।' : 'Get notified of active bug outbreaks in your district.'}</p>
                </div>
                <input 
                  type="checkbox"
                  checked={alertPest}
                  onChange={e => setAlertPest(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-5 h-5"
                />
              </label>

              {/* Weather warnings toggle */}
              <label className="flex items-center justify-between cursor-pointer p-1">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-250">
                    {language === 'hi' ? 'मौसम की चेतावनी' : 'Weather Warnings'}
                  </span>
                  <p className="text-[10px] text-gray-400">{language === 'hi' ? 'आंधी, तूफान या भारी बारिश की चेतावनी।' : 'Warnings for heavy rainfall or extreme temperatures.'}</p>
                </div>
                <input 
                  type="checkbox"
                  checked={alertWeather}
                  onChange={e => setAlertWeather(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-5 h-5"
                />
              </label>

              {/* Mandi warnings toggle */}
              <div className="space-y-2 p-1 bg-gray-50 dark:bg-gray-850/50 rounded-2xl border border-gray-100 dark:border-gray-850/40 p-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-250">
                      {language === 'hi' ? 'मंडी के भाव में भारी गिरावट' : 'Mandi Price Warnings'}
                    </span>
                    <p className="text-[10px] text-gray-400">{language === 'hi' ? 'फसल की कीमतों में गिरावट होने पर अलर्ट।' : 'Get notified of sudden mandi crop price drops.'}</p>
                  </div>
                  <input 
                    type="checkbox"
                    checked={alertMandi}
                    onChange={e => setAlertMandi(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-5 h-5"
                  />
                </label>
                
                {alertMandi && (
                  <div className="pt-2 space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-gray-500">
                      <span>Threshold Drop Percent:</span>
                      <span className="text-primary-600 flex items-center"><FiPercent /> {alertMandiThreshold}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="25" 
                      step="5"
                      value={alertMandiThreshold}
                      onChange={e => setAlertMandiThreshold(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                  </div>
                )}
              </div>

              {/* Government Schemes warnings toggle */}
              <label className="flex items-center justify-between cursor-pointer p-1">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-250">
                    {language === 'hi' ? 'सरकारी योजनाएं और अपडेट' : 'Govt Schemes Updates'}
                  </span>
                  <p className="text-[10px] text-gray-400">{language === 'hi' ? 'नई योजनाओं और आवेदन की समय सीमा की जानकारी।' : 'Notifications for new state and central agriculture policies.'}</p>
                </div>
                <input 
                  type="checkbox"
                  checked={alertSchemes}
                  onChange={e => setAlertSchemes(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-5 h-5"
                />
              </label>

            </div>

          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-850" />

          {/* Success toast inside settings box */}
          {success && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900 rounded-xl text-xs font-bold text-center">
              ✓ {language === 'hi' ? 'प्राथमिकताएं सफलतापूर्वक सहेजी गईं!' : 'Preferences saved successfully!'}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 transition-all text-sm"
          >
            {saving ? '...' : (language === 'hi' ? 'सेटिंग्स सहेजें' : 'Save Alert Configurations')}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Settings;
