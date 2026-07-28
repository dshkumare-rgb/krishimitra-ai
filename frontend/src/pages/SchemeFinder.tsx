import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { api } from '../services/api';
import { FiAward, FiSearch, FiCheck, FiX, FiExternalLink, FiHelpCircle, FiFileText, FiClock, FiCheckSquare, FiPlus, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

interface AppliedScheme {
  _id: string;
  schemeId: string;
  schemeName: string;
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';
  appliedDate: string;
  documentChecklist: { name: string; isUploaded: boolean }[];
  notes?: string;
  followUpReminderDate?: string;
}

export const SchemeFinder: React.FC = () => {
  const { t, language } = useLanguage();
  const { stateName } = useLocation();

  const [activeTab, setActiveTab] = useState<'browse' | 'my-applications'>('browse');
  const [schemes, setSchemes] = useState<any[]>([]);
  const [applications, setApplications] = useState<AppliedScheme[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState(stateName || 'All');
  const [loading, setLoading] = useState(false);

  // Application Logger Modal States
  const [logModalOpen, setLogModalOpen] = useState<any | null>(null);
  const [notes, setNotes] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [checklistState, setChecklistState] = useState<{ [key: string]: boolean }>({});

  // Eligibility Checker variables
  const [checkerOpen, setCheckerOpen] = useState<string | null>(null);
  const [hasLand, setHasLand] = useState(true);
  const [isTaxpayer, setIsTaxpayer] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<'eligible' | 'ineligible' | null>(null);

  const userId = localStorage.getItem('userId') || 'default-farmer';

  // Document checklist mapped per category
  const getDocumentChecklist = (category: string) => {
    switch (category) {
      case 'Insurance':
        return ['Land Record (Khasra/Khatauni)', 'Sowing Certificate', 'Aadhaar Card', 'Bank Passbook Copy'];
      case 'Financial Aid':
        return ['Land Ownership Records', 'Aadhaar Card', 'Self-Declaration Form', 'Bank Passbook Copy'];
      case 'Technology':
      case 'Subsidy':
        return ['Aadhaar Card', 'Farmer Registration Card', 'Land Registry Copy', 'Quotations from Authorized Dealer'];
      default:
        return ['Aadhaar Card', 'Land Records'];
    }
  };

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const url = `/api/admin/schemes?state=${selectedState}${selectedCategory !== 'All' ? `&category=${selectedCategory}` : ''}`;
      const data = await api.get(url, 'schemes');
      setSchemes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`/api/schemes/applications?userId=${userId}`);
      setApplications(response.data);
    } catch (err) {
      console.error('Failed to retrieve scheme logs:', err);
    }
  };

  useEffect(() => {
    setSelectedState(stateName);
  }, [stateName]);

  useEffect(() => {
    fetchSchemes();
    fetchApplications();
  }, [selectedCategory, selectedState]);

  const filteredSchemes = schemes.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleCheckEligibility = (schemeName: string) => {
    if (schemeName.includes('PM-KISAN')) {
      if (hasLand && !isTaxpayer) {
        setEligibilityResult('eligible');
      } else {
        setEligibilityResult('ineligible');
      }
    } else {
      if (hasLand) {
        setEligibilityResult('eligible');
      } else {
        setEligibilityResult('ineligible');
      }
    }
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logModalOpen) return;

    try {
      const docList = getDocumentChecklist(logModalOpen.category).map(doc => ({
        name: doc,
        isUploaded: !!checklistState[doc]
      }));

      await axios.post('/api/schemes/applications', {
        userId,
        schemeId: logModalOpen._id,
        schemeName: logModalOpen.name,
        status: 'Submitted',
        checklist: docList,
        notes,
        followUpDate: reminderDate || null
      });

      setLogModalOpen(null);
      setNotes('');
      setReminderDate('');
      setChecklistState({});
      fetchApplications();
      setActiveTab('my-applications');
    } catch (err) {
      console.error('Failed to log application:', err);
    }
  };

  const categories = ['All', 'Financial Aid', 'Insurance', 'Technology', 'Subsidy'];

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-gray-900 p-6 border border-gray-150 dark:border-gray-800 rounded-3xl shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            🏆 {t('eligibleSchemes')}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {language === 'hi' 
              ? 'नवीनतम सरकारी योजनाओं की खोज करें, पात्रता जांचें और सीधे आवेदन करें।' 
              : 'Search active government agriculture subsidies, insurance, and direct cash benefit schemes.'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-gray-50 dark:bg-gray-850 p-1 rounded-xl border border-gray-100 dark:border-gray-800 self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${
              activeTab === 'browse'
                ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {language === 'hi' ? 'योजनाएं खोजें' : 'Browse Schemes'}
          </button>
          <button
            onClick={() => setActiveTab('my-applications')}
            className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${
              activeTab === 'my-applications'
                ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {language === 'hi' ? 'मेरे आवेदन' : 'My Applications'}
          </button>
        </div>
      </div>

      {activeTab === 'browse' ? (
        <div className="space-y-6">
          {/* Filters row */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Categories slider */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
                    selectedCategory === cat 
                      ? 'bg-primary-600 text-white shadow-sm' 
                      : 'bg-white border border-gray-200 text-gray-600 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* State selector */}
            <select 
              value={selectedState} 
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 rounded-xl outline-none text-xs font-bold text-gray-700 dark:text-gray-200"
            >
              <option value="All">All States</option>
              <option value="Punjab">Punjab</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Gujarat">Gujarat</option>
            </select>
          </div>

          {/* Search Bar */}
          <div className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl border border-gray-150 dark:border-gray-800 flex items-center gap-3">
            <FiSearch className="text-gray-450 w-5 h-5 flex-shrink-0" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search schemes by name, eligibility keywords..."
              className="bg-transparent border-none outline-none text-xs font-semibold text-gray-800 dark:text-gray-200 w-full"
            />
          </div>

          {/* Schemes list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSchemes.map((scheme) => (
              <div key={scheme._id} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-400 border border-primary-100 dark:border-primary-900 uppercase">
                      {scheme.category}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">State: {scheme.state}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-gray-850 dark:text-gray-150 leading-snug">{scheme.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{scheme.description}</p>
                  
                  {/* Document Checklist Panel */}
                  <div className="bg-gray-50 dark:bg-gray-850/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800/40 space-y-2">
                    <p className="font-bold text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                      <FiFileText className="text-primary-600" />
                      {language === 'hi' ? 'आवश्यक दस्तावेज चेकलिस्ट' : 'Required Documents Checklist'}
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {getDocumentChecklist(scheme.category).map((doc, idx) => (
                        <li key={idx} className="text-[10px] text-gray-650 dark:text-gray-400 flex items-center gap-1">
                          <span className="w-1 h-1 bg-primary-500 rounded-full" />
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 text-xs">
                    <p className="font-bold text-gray-700 dark:text-gray-300">Key Benefits:</p>
                    <p className="text-[11px] text-gray-550 dark:text-gray-400 mt-0.5">{scheme.benefits}</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <button 
                    onClick={() => setLogModalOpen(scheme)}
                    className="flex-1 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 shadow-sm shadow-primary-500/10"
                  >
                    {language === 'hi' ? 'आवेदन लॉग करें' : 'Log Application'} <FiExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => { setCheckerOpen(scheme.name); setEligibilityResult(null); }}
                    className="py-2.5 px-4 bg-gray-50 hover:bg-gray-100 dark:bg-gray-950 dark:hover:bg-gray-800 text-gray-650 dark:text-gray-300 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-800 transition flex items-center justify-center gap-1"
                  >
                    <FiHelpCircle className="w-3.5 h-3.5" /> Check Eligibility
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* My Applications Tab */
        <div className="space-y-6">
          {applications.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-16 rounded-3xl shadow-sm text-center flex flex-col items-center justify-center gap-2">
              <span className="text-4xl">🏛️</span>
              <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">
                {language === 'hi' ? 'कोई सक्रिय आवेदन नहीं' : 'No applications logged yet'}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'hi' 
                  ? 'अपनी योजनाओं के सबमिशन विवरण दर्ज करने के लिए ब्राउज़ टैब से लॉग करें।' 
                  : 'Submit crop insurance or subsidies logs from the browse tab.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {applications.map(app => (
                <div 
                  key={app._id} 
                  className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-extrabold text-sm text-gray-800 dark:text-gray-150 leading-snug">
                        {app.schemeName}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        app.status === 'Approved'
                          ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                          : app.status === 'Rejected'
                            ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                            : 'bg-orange-50 text-orange-755 dark:bg-orange-950/20 dark:text-orange-400'
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                      <FiClock /> Logged: {new Date(app.appliedDate).toLocaleDateString()}
                    </p>

                    {/* Stepper Timeline UI */}
                    <div className="flex items-center justify-between w-full pt-4">
                      {['Submitted', 'Under Review', 'Approved'].map((step, idx) => {
                        const isCurrent = app.status === step;
                        const isPassed = app.status === 'Approved' || (app.status === 'Under Review' && idx === 0);
                        const isRejected = app.status === 'Rejected' && step === 'Approved';

                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center relative">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                              isCurrent 
                                ? 'bg-primary-600 border-primary-600 text-white'
                                : isPassed 
                                  ? 'bg-green-500 border-green-500 text-white'
                                  : isRejected 
                                    ? 'bg-red-500 border-red-500 text-white'
                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400'
                            }`}>
                              {isPassed ? '✓' : isRejected ? '✗' : idx + 1}
                            </div>
                            <span className="text-[9px] text-gray-500 mt-1 font-semibold">{step}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Documents checklist logged */}
                    {app.documentChecklist && app.documentChecklist.length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-850 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1.5 mt-2">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                          {language === 'hi' ? 'संलग्न दस्तावेज' : 'Attached Documents Status'}
                        </p>
                        <ul className="space-y-1">
                          {app.documentChecklist.map((doc, idx) => (
                            <li key={idx} className="text-[10px] text-gray-600 dark:text-gray-450 flex items-center gap-1.5">
                              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                                doc.isUploaded ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500 dark:bg-gray-800'
                              }`}>
                                {doc.isUploaded ? '✓' : '×'}
                              </span>
                              <span>{doc.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {app.followUpReminderDate && (
                    <div className="bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/40 p-3 rounded-2xl flex items-center gap-2 text-xs text-orange-700 dark:text-orange-400">
                      <FiAlertCircle className="shrink-0" />
                      <span>
                        {language === 'hi' ? 'अगला फॉलो-अप रिमाइंडर: ' : 'Next Follow-up Reminder: '}
                        {new Date(app.followUpReminderDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Log Application Modal */}
      <AnimatePresence>
        {logModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
              <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-850 pb-3">
                <div>
                  <h3 className="font-extrabold text-sm text-gray-850 dark:text-gray-150">Log Application Submit</h3>
                  <span className="text-[10px] text-primary-600 font-bold">{logModalOpen.name}</span>
                </div>
                <button onClick={() => setLogModalOpen(null)} className="p-1 rounded bg-gray-50 text-gray-400 hover:text-gray-650 dark:bg-gray-950"><FiX className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleLogSubmit} className="space-y-4">
                
                {/* Checklist uploads verification */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400">
                    {language === 'hi' ? 'दस्तावेज अपलोड सत्यापन' : 'Verify Document Uploads'}
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-850 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                    {getDocumentChecklist(logModalOpen.category).map(doc => (
                      <label key={doc} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={!!checklistState[doc]}
                          onChange={(e) => setChecklistState(prev => ({ ...prev, [doc]: e.target.checked }))}
                          className="rounded border-gray-300 text-primary-650 focus:ring-primary-500 w-4 h-4"
                        />
                        <span className="text-xs text-gray-650 dark:text-gray-400">{doc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Reminder Date */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                    {language === 'hi' ? 'फॉलो-अप रिमाइंडर तारीख' : 'Follow-up Reminder Date'}
                  </label>
                  <input 
                    type="date"
                    value={reminderDate}
                    onChange={e => setReminderDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-100"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{language === 'hi' ? 'आवेदन नोट्स' : 'Application Notes / Ref ID'}</label>
                  <textarea 
                    rows={2}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-100"
                    placeholder="Enter application ID or status comments..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs"
                >
                  Log Submission Status
                </button>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Eligibility check modal */}
      <AnimatePresence>
        {checkerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setCheckerOpen(null)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 top-1/4 max-w-md mx-auto bg-white dark:bg-gray-900 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-2xl p-6 z-50 space-y-5"
            >
              <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-850 pb-3">
                <h3 className="font-extrabold text-sm text-gray-850 dark:text-gray-150">Check Eligibility</h3>
                <button onClick={() => setCheckerOpen(null)} className="p-1 rounded bg-gray-50 text-gray-400 hover:text-gray-650 dark:bg-gray-950"><FiX className="w-5 h-5" /></button>
              </div>

              <div className="space-y-4 text-xs font-medium text-gray-700 dark:text-gray-300">
                <p className="font-bold text-gray-500 mb-2">Scheme: {checkerOpen}</p>
                
                <div className="flex items-center justify-between">
                  <span>Do you own cultivable agricultural land?</span>
                  <input 
                    type="checkbox" 
                    checked={hasLand} 
                    onChange={(e) => { setHasLand(e.target.checked); setEligibilityResult(null); }}
                    className="w-4 h-4 text-primary-600 rounded" 
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span>Are you or any family member an income tax payer?</span>
                  <input 
                    type="checkbox" 
                    checked={isTaxpayer} 
                    onChange={(e) => { setIsTaxpayer(e.target.checked); setEligibilityResult(null); }}
                    className="w-4 h-4 text-primary-600 rounded" 
                  />
                </div>

                <button 
                  onClick={() => handleCheckEligibility(checkerOpen)}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition mt-2 shadow-sm"
                >
                  Verify Status
                </button>

                {eligibilityResult && (
                  <div className={`p-4 rounded-2xl border flex gap-3 items-start mt-4 ${
                    eligibilityResult === 'eligible' 
                      ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-900' 
                      : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900'
                  }`}>
                    {eligibilityResult === 'eligible' ? (
                      <>
                        <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">You are Eligible!</p>
                          <p className="text-[10px] mt-0.5 opacity-90">Based on your parameters, you meet the initial qualifications. Apply online to proceed.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <FiX className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">Not Eligible</p>
                          <p className="text-[10px] mt-0.5 opacity-90">Taxpayers and institutional landowners are excluded from financial benefit allocations under this scheme.</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SchemeFinder;
