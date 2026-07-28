import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { api } from '../services/api';
import MapContainer, { MapMarkerItem } from '../components/MapContainer';
import { FiAlertTriangle, FiPlusCircle, FiX, FiMail, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export const PestAlerts: React.FC = () => {
  const { t, language } = useLanguage();
  const { stateName, districtName, getCoordinates } = useLocation();

  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Reporting outbreak form
  const [reportOpen, setReportOpen] = useState(false);
  const [pestName, setPestName] = useState('Fall Armyworm');
  const [cropAffected, setCropAffected] = useState('Maize');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [state, setState] = useState(stateName);
  const [district, setDistrict] = useState(districtName);
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState('30.901');
  const [lon, setLon] = useState('75.857');

  // SMS alerts trigger
  const [smsOpen, setSmsOpen] = useState<any>(null); // holds target alert
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsSent, setSmsSent] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/api/alerts/pest?state=${stateName}&district=${districtName}`, `alerts-${districtName}`);
      setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    setState(stateName);
    setDistrict(districtName);
    const { lat: newLat, lon: newLon } = getCoordinates();
    setLat(newLat.toFixed(3));
    setLon(newLon.toFixed(3));
  }, [stateName, districtName]);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/alerts/pest/report', {
        pestName, cropAffected, severity, state, district, description,
        latitude: parseFloat(lat), longitude: parseFloat(lon)
      }, 'report-pest');
      
      setReportOpen(false);
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsOpen) return;
    try {
      const msg = `[KrishiMitra Alert] Severe infestation of ${smsOpen.pestName} reported on ${smsOpen.cropAffected} in ${smsOpen.district}. Control: ${smsOpen.controlMeasures || 'Consult local agriculture department'}`;
      await api.post('/api/alerts/sms/trigger', { phoneNumber, message: msg });
      setSmsSent(true);
      setTimeout(() => {
        setSmsSent(false);
        setSmsOpen(null);
        setPhoneNumber('');
      }, 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const mapMarkers: MapMarkerItem[] = alerts.map(a => ({
    id: a._id,
    latitude: a.latitude || 22.719,
    longitude: a.longitude || 75.857,
    label: `${a.pestName} (${a.severity})`,
    info: `Crop: ${a.cropAffected} | District: ${a.district}`,
    severity: a.severity
  }));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            ⚠️ {t('pestAlerts')}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {language === 'hi' 
              ? 'आसपास के कीट प्रकोपों ​​की निगरानी करें। अपने खेत की सुरक्षा के लिए एसएमएस चेतावनी सक्रिय करें।' 
              : 'Monitor crop pest outbreaks in your area. Set up automated SMS warnings for real-time agricultural safety.'}
          </p>
        </div>

        <button 
          onClick={() => setReportOpen(true)}
          className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-2xl transition flex items-center gap-1.5 shadow-sm shadow-red-500/10"
        >
          <FiPlusCircle className="w-4 h-4" /> {t('reportOutbreak')}
        </button>
      </div>

      {/* Map view */}
      {mapMarkers.length > 0 && (
        <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-150 dark:border-gray-800">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-xs flex items-center gap-1.5 mb-3">
            <FiAlertTriangle className="text-red-500 w-4 h-4" /> Pest Outbreak Locations Overlay
          </h3>
          <MapContainer items={mapMarkers} />
        </div>
      )}

      {/* Grid: Alerts cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((alert) => (
          <div key={alert._id} className={`p-6 rounded-3xl border flex flex-col justify-between ${
            alert.severity === 'HIGH' 
              ? 'bg-red-50/20 border-red-200 dark:bg-red-950/10 dark:border-red-900/50 text-red-900 dark:text-red-300' 
              : 'bg-amber-50/20 border-amber-200 dark:bg-amber-950/10 dark:border-amber-900/50 text-amber-900 dark:text-amber-300'
          }`}>
            <div className="space-y-3.5">
              <div className="flex justify-between items-center">
                <h4 className="text-base font-extrabold text-gray-800 dark:text-gray-200">{alert.pestName}</h4>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-white dark:bg-gray-900 uppercase border ${
                  alert.severity === 'HIGH' ? 'border-red-300' : 'border-amber-300'
                }`}>
                  {alert.severity} Risk
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wider">Crop Damaged: {alert.cropAffected}</p>
              <p className="text-xs text-gray-500 dark:text-gray-450 leading-relaxed">{alert.description}</p>
              
              <div className="p-3 bg-white/70 dark:bg-gray-900/60 rounded-xl text-xs space-y-1.5 border border-white/50">
                <p className="font-extrabold text-gray-700 dark:text-gray-300">Control Actions:</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-normal">{alert.controlMeasures || 'Spray Azadirachtin 5% Neem extract immediately.'}</p>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button 
                onClick={() => { setSmsOpen(alert); setSmsSent(false); }}
                className="w-full py-2.5 bg-gray-850 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <FiMail className="w-4 h-4" /> Subscribe SMS Alerts
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Outbreak reporter modal */}
      <AnimatePresence>
        {reportOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setReportOpen(false)} className="fixed inset-0 bg-black z-40" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-20 max-w-md mx-auto bg-white dark:bg-gray-900 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-2xl p-6 z-50 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-855 pb-3">
                <h3 className="font-bold text-gray-850 dark:text-gray-150 text-sm">Report Regional Bug Outbreak</h3>
                <button onClick={() => setReportOpen(false)} className="p-1 rounded bg-gray-50 text-gray-400 hover:text-gray-650 dark:bg-gray-950"><FiX className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-4 text-xs font-medium">
                <div>
                  <label className="block text-gray-500 mb-1">Insect / Pest Name</label>
                  <input type="text" value={pestName} onChange={(e) => setPestName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:bg-gray-950 dark:border-gray-850 rounded-xl outline-none" required />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1">Affected Crop</label>
                  <input type="text" value={cropAffected} onChange={(e) => setCropAffected(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:bg-gray-950 dark:border-gray-855 rounded-xl outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-500 mb-1">District</label>
                    <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:bg-gray-950 dark:border-gray-855 rounded-xl outline-none" required />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">Severity Risk</label>
                    <select value={severity} onChange={(e) => setSeverity(e.target.value as any)} className="w-full px-3 py-2 border border-gray-200 dark:bg-gray-950 dark:border-gray-855 rounded-xl outline-none">
                      <option value="LOW">Low Risk</option>
                      <option value="MEDIUM">Medium Risk</option>
                      <option value="HIGH">High Risk</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-500 mb-1">Latitude</label>
                    <input type="text" value={lat} onChange={(e) => setLat(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:bg-gray-950 dark:border-gray-855 rounded-xl outline-none" />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">Longitude</label>
                    <input type="text" value={lon} onChange={(e) => setLon(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:bg-gray-950 dark:border-gray-855 rounded-xl outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-500 mb-1">Visual Symptoms Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-200 dark:bg-gray-950 dark:border-gray-855 rounded-xl outline-none" placeholder="e.g. Leaf holes, rosette flowers, brown spots..." />
                </div>
                <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition shadow-sm">Report Outbreak</button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* SMS alert modal */}
      <AnimatePresence>
        {smsOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setSmsOpen(null)} className="fixed inset-0 bg-black z-40" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/4 max-w-sm mx-auto bg-white dark:bg-gray-900 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-2xl p-6 z-50 space-y-4 text-center"
            >
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-855 pb-2">
                <h3 className="font-bold text-gray-850 dark:text-gray-150 text-xs uppercase tracking-wider">SMS Warning System</h3>
                <button onClick={() => setSmsOpen(null)} className="p-1 rounded bg-gray-50 text-gray-400 hover:text-gray-650 dark:bg-gray-950"><FiX className="w-5 h-5" /></button>
              </div>

              {smsSent ? (
                <div className="py-6 space-y-3 flex flex-col items-center">
                  <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-xl font-extrabold animate-bounce">
                    <FiCheck className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-200">Warning Alert Subscription Active!</p>
                  <p className="text-[10px] text-gray-450">Check the backend console for the simulated gateway dispatch logs.</p>
                </div>
              ) : (
                <form onSubmit={handleTriggerSMS} className="space-y-4 text-xs font-medium text-left">
                  <p className="text-[11px] text-gray-450 leading-relaxed">
                    Subscribe your cell number to get instant crop warnings, biological treatment recipes, and chemical controls.
                  </p>
                  <div>
                    <label className="block text-gray-500 mb-1">Farmer Phone Number</label>
                    <input 
                      type="tel" 
                      required 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-4 py-2.5 border border-gray-200 dark:bg-gray-950 dark:border-gray-855 rounded-xl outline-none font-bold text-sm text-gray-700" 
                    />
                  </div>
                  <button type="submit" className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition shadow-sm">
                    Activate Warnings
                  </button>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PestAlerts;
