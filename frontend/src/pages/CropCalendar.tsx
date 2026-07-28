import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FiCalendar, FiChevronRight, FiCheck, FiBell, FiPlus, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';

interface CropRecord {
  _id?: string;
  cropName: string;
  sowingDate: string;
}

interface Stage {
  name: string;
  hiName: string;
  range: string;
  actions: string[];
  hiActions: string[];
}

export const CropCalendar: React.FC = () => {
  const { t, language } = useLanguage();
  const [records, setRecords] = useState<CropRecord[]>([]);
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeRecord, setActiveRecord] = useState<CropRecord | null>(null);
  const [notifGranted, setNotifGranted] = useState(false);

  const userId = localStorage.getItem('userId') || 'default-farmer';

  // Available crop options
  const cropOptions = ['Wheat', 'Paddy (Rice)', 'Soybean', 'Cotton', 'Mustard', 'Sugarcane', 'Barley'];

  // Stages definitions
  const stages: Stage[] = [
    {
      name: 'Sowing',
      hiName: 'बुवाई',
      range: 'Days 0-5',
      actions: [
        'Prepare soil bed with fine tilth.',
        'Apply baseline NPK (Nitrogen-Phosphorus-Potassium) fertilizer.',
        'Sow treated certified seeds at recommended depth.'
      ],
      hiActions: [
        'मिट्टी की अच्छी जुताई कर क्यारियां तैयार करें।',
        'आधार खुराक के रूप में एनपीके उर्वरक डालें।',
        'अनुशंसित गहराई पर उपचारित प्रमाणित बीज बोएं।'
      ]
    },
    {
      name: 'Germination',
      hiName: 'अंकुरण',
      range: 'Days 6-15',
      actions: [
        'Conduct initial light sprinkler irrigation.',
        'Inspect fields for early weed germination.',
        'Monitor seed sprout density per square meter.'
      ],
      hiActions: [
        'हल्की फव्वारा सिंचाई करें।',
        'शुरुआती खरपतवारों की जांच करें।',
        'प्रति वर्ग मीटर अंकुरित बीजों के घनत्व की निगरानी करें।'
      ]
    },
    {
      name: 'Vegetative',
      hiName: 'वानस्पतिक विकास',
      range: 'Days 16-60',
      actions: [
        'Apply first top-dressing of Urea/Nitrogen.',
        'Conduct secondary weeding or apply selective herbicide.',
        'Actively scout leaves for pests (Aphids, Caterpillars).'
      ],
      hiActions: [
        'यूरिया/नाइट्रोजन की पहली टॉप-ड्रेसिंग करें।',
        'खरपतवार निकालें या चुनिंदा शाकनाशी का छिड़काव करें।',
        'कीटों (माहू, इल्ली) के लिए पत्तियों की बारीकी से जांच करें।'
      ]
    },
    {
      name: 'Flowering',
      hiName: 'फूल आना',
      range: 'Days 61-90',
      actions: [
        'Maintain critical irrigation (drought stress reduces yield).',
        'Apply Potassium/Boron sprays to enhance grain filling.',
        'Scout for fungal disease symptoms (Rust, Blast).'
      ],
      hiActions: [
        'महत्वपूर्ण सिंचाई चक्र बनाए रखें (सूखा पड़ने से उपज घटती है)।',
        'दाने भरने को बढ़ाने के लिए पोटेशियम/बोरॉन का छिड़काव करें।',
        'फफूंद जनित रोगों (रतुआ, ब्लास्ट) के लक्षणों की निगरानी करें।'
      ]
    },
    {
      name: 'Harvest',
      hiName: 'कटाई',
      range: 'Days 91+',
      actions: [
        'Test grain moisture content (should be < 14% for storage).',
        'Harvest crops during clear sunny days.',
        'Prepare clean storage bags or coordinate mandi transport.'
      ],
      hiActions: [
        'अनाज की नमी की जांच करें (भंडारण के लिए १४% से कम होनी चाहिए)।',
        'साफ धूप वाले दिनों में फसल की कटाई करें।',
        'भंडारण बैग तैयार करें या मंडी परिवहन की व्यवस्था करें।'
      ]
    }
  ];

  useEffect(() => {
    fetchRecords();
    if ('Notification' in window) {
      setNotifGranted(Notification.permission === 'granted');
    }
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await axios.get(`/api/crop-calendar/records?userId=${userId}`);
      setRecords(response.data);
      if (response.data.length > 0) {
        setActiveRecord(response.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch crop calendar records:', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/crop-calendar/records', {
        userId,
        cropName: selectedCrop,
        sowingDate
      });
      fetchRecords();
    } catch (err) {
      console.error('Failed to save sowing record:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/crop-calendar/records/${id}`);
      fetchRecords();
      if (activeRecord?._id === id) {
        setActiveRecord(null);
      }
    } catch (err) {
      console.error('Failed to delete sowing record:', err);
    }
  };

  const requestNotifPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotifGranted(permission === 'granted');
        if (permission === 'granted') {
          new Notification('KrishiMitra Calendar', {
            body: 'Reminders enabled! We will notify you of upcoming crop stages.',
            icon: '/favicon.ico'
          });
        }
      });
    }
  };

  // Calculate current stage details based on sowing date
  const calculateCurrentStage = (sDateStr: string) => {
    const sDate = new Date(sDateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - sDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let activeIdx = 0;
    if (diffDays <= 5) activeIdx = 0;
    else if (diffDays <= 15) activeIdx = 1;
    else if (diffDays <= 60) activeIdx = 2;
    else if (diffDays <= 90) activeIdx = 3;
    else activeIdx = 4;

    return { diffDays, activeIdx };
  };

  const activeStageDetails = activeRecord ? calculateCurrentStage(activeRecord.sowingDate) : null;

  return (
    <div className="space-y-8 p-6 max-w-6xl mx-auto">
      
      {/* Title Header */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-3xl shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 flex items-center gap-2">
            🌱 {language === 'hi' ? 'मेरी फसल योजना कैलेंडर' : 'My Crop Calendar'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {language === 'hi' 
              ? 'सटीक कृषि सलाह और कटाई चक्र की योजना बनाएं।' 
              : 'Track growth stages and receive contextual smart advisory.'}
          </p>
        </div>

        {/* Notifications Toggle */}
        <button
          onClick={requestNotifPermission}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
            notifGranted 
              ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-900 dark:text-green-400' 
              : 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/20 dark:border-orange-900 dark:text-orange-400'
          }`}
        >
          <FiBell className={notifGranted ? 'animate-swing' : ''} />
          {notifGranted 
            ? (language === 'hi' ? 'रिमाइंडर सक्रिय' : 'Reminders Active') 
            : (language === 'hi' ? 'रिमाइंडर चालू करें' : 'Enable Reminders')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Add/Select Crops */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 text-sm uppercase tracking-wider">
              <FiPlus className="text-primary-600" />
              {language === 'hi' ? 'नई फसल जोड़ें' : 'Add New Crop'}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                  {language === 'hi' ? 'फसल चुनें' : 'Select Crop'}
                </label>
                <select 
                  value={selectedCrop}
                  onChange={e => setSelectedCrop(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-100"
                >
                  {cropOptions.map(crop => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                  {language === 'hi' ? 'बुवाई की तारीख' : 'Sowing Date'}
                </label>
                <input 
                  type="date" 
                  value={sowingDate}
                  onChange={e => setSowingDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all text-sm flex items-center justify-center gap-2"
              >
                <FiPlus /> {language === 'hi' ? 'कैलेंडर में जोड़ें' : 'Add to Calendar'}
              </button>
            </form>
          </div>

          {/* Active Crops List */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm uppercase tracking-wider">
              {language === 'hi' ? 'मेरी फसलें' : 'My Active Crops'}
            </h3>
            
            {records.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                {language === 'hi' ? 'कोई सक्रिय फसल नहीं।' : 'No crops registered yet.'}
              </p>
            ) : (
              <div className="space-y-2">
                {records.map(rec => (
                  <div 
                    key={rec._id}
                    onClick={() => setActiveRecord(rec)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                      activeRecord?._id === rec._id
                        ? 'bg-primary-50/50 border-primary-200 dark:bg-primary-950/10 dark:border-primary-900'
                        : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-850 hover:bg-gray-50 dark:hover:bg-gray-850'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">{rec.cropName}</h4>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <FiCalendar /> {new Date(rec.sowingDate).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (rec._id) handleDelete(rec._id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Growth Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {activeRecord && activeStageDetails ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-3xl shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xs text-primary-600 dark:text-primary-400 font-black uppercase tracking-widest bg-primary-50 dark:bg-primary-950/20 px-3 py-1 rounded-full border border-primary-100 dark:border-primary-900">
                    {activeRecord.cropName}
                  </span>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-2">
                    {language === 'hi' ? 'फसल चक्र की वर्तमान स्थिति' : 'Crop Growth Progress'}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-primary-600 dark:text-primary-400">
                    {activeStageDetails.diffDays}
                  </span>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    {language === 'hi' ? 'बुवाई के दिन' : 'Days from Sowing'}
                  </p>
                </div>
              </div>

              {/* Stepper Timeline */}
              <div className="flex items-center w-full justify-between pt-4 overflow-x-auto gap-4 pb-2">
                {stages.map((stg, index) => {
                  const isActive = index === activeStageDetails.activeIdx;
                  const isCompleted = index < activeStageDetails.activeIdx;
                  return (
                    <div key={stg.name} className="flex-1 min-w-[80px] flex flex-col items-center relative text-center">
                      
                      {/* Step Circle */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 z-10 transition-all ${
                        isActive
                          ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/20'
                          : isCompleted
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-400'
                      }`}>
                        {isCompleted ? <FiCheck /> : index + 1}
                      </div>

                      {/* Text */}
                      <span className={`text-[10px] font-bold mt-2 ${isActive ? 'text-primary-600' : 'text-gray-500'}`}>
                        {language === 'hi' ? stg.hiName : stg.name}
                      </span>
                      <span className="text-[9px] text-gray-400 mt-0.5">{stg.range}</span>
                    </div>
                  );
                })}
              </div>

              <div className="h-px bg-gray-100 dark:bg-gray-850" />

              {/* Stage Advisory Card */}
              <div className="space-y-4">
                <div className="bg-primary-50/30 dark:bg-primary-950/5 border border-primary-100 dark:border-primary-900/50 p-6 rounded-2xl">
                  <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-primary-600 rounded-full" />
                    {language === 'hi' ? 'वर्तमान चरण: ' : 'Current Stage: '}
                    {language === 'hi' 
                      ? stages[activeStageDetails.activeIdx].hiName 
                      : stages[activeStageDetails.activeIdx].name}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {language === 'hi' ? 'इस चरण में निम्नलिखित अनुशंसित कार्य करें:' : 'Recommended tasks for maximum yield:'}
                  </p>

                  <div className="mt-4 space-y-2">
                    {(language === 'hi' 
                      ? stages[activeStageDetails.activeIdx].hiActions 
                      : stages[activeStageDetails.activeIdx].actions
                    ).map((action, i) => (
                      <div key={i} className="flex gap-2 text-xs text-gray-600 dark:text-gray-450 items-start">
                        <FiChevronRight className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-12 rounded-3xl shadow-sm text-center flex flex-col items-center justify-center gap-3">
              <span className="text-4xl">🗓️</span>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                {language === 'hi' ? 'कोई फसल चयनित नहीं है' : 'Select a crop to view calendar timeline'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
                {language === 'hi' 
                  ? 'अपनी बुवाई की योजना शुरू करने के लिए बाईं ओर की सूची से कोई फसल चुनें या नई फसल जोड़ें।' 
                  : 'Add a crop on the left panel or select an existing one to generate your custom stage-based timeline.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CropCalendar;
