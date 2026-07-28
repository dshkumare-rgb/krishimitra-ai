import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { generateDiseasePDF } from '../utils/pdfGenerator';
import { FiUploadCloud, FiCheck, FiDownload, FiInfo, FiLayers } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import VideoGuidesSection from '../components/VideoGuidesSection';


export const DiseaseDetection: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'organic' | 'chemical' | 'prevention'>('organic');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null); // Clear old results
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('userFirebaseId', user?.firebaseId || '');

    try {
      const response = await api.upload('/api/ai/disease-detection', formData);
      setResult(response);
      if (previewUrl) {
        localStorage.setItem('km-last-diagnosed-image', previewUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    generateDiseasePDF({
      diseaseName: result.diseaseName,
      confidence: result.confidence,
      symptoms: result.symptoms,
      treatment: result.treatment,
      organicSolution: result.organicSolution,
      chemicalSolution: result.chemicalSolution,
      prevention: result.prevention
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          🔍 {t('diseaseDetection')}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {language === 'hi' 
            ? 'बीमार पत्ती की फोटो अपलोड करें। हमारा एआई रोग की पहचान करेगा और कार्बनिक व रासायनिक उपचार बताएगा।' 
            : 'Upload a picture of an infected crop leaf. The GenAI diagnostic scanner identifies pathogens and drafts organic/chemical control measures.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left 2 columns: Image dropzone */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800">
            <form onSubmit={handleUploadSubmit} className="space-y-5">
              
              {/* File Dropzone wrapper */}
              <div className="relative border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[220px] bg-gray-50/50 dark:bg-gray-950/20 hover:bg-gray-50 hover:dark:bg-gray-950/50 transition">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Leaf preview" 
                    className="max-h-[200px] object-contain rounded-xl shadow-sm"
                  />
                ) : (
                  <div className="text-center p-4">
                    <FiUploadCloud className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400">Click to Select Leaf Image</p>
                    <p className="text-[10px] text-gray-400 mt-1">Supports PNG, JPG up to 5MB</p>
                  </div>
                )}
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-850 rounded-xl text-xs">
                  <span className="font-semibold text-gray-600 dark:text-gray-400 truncate max-w-[180px]">{selectedFile.name}</span>
                  <span className="font-medium text-gray-400">{(selectedFile.size / 1024).toFixed(0)} KB</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedFile || loading}
                className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md shadow-primary-500/10 transition disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Diagnosing leaf structures...</span>
                  </>
                ) : (
                  <>
                    <span>🔍 {t('analyze')}</span>
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

        {/* Right 3 columns: Results panel */}
        <div className="lg:col-span-3 space-y-4">
          {result ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Header card */}
              <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-150 dark:border-gray-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 rounded-full">
                    Diagnosis Complete
                  </span>
                  <h3 className="text-xl font-extrabold text-gray-800 dark:text-gray-100 mt-1">{result.diseaseName}</h3>
                </div>
                
                <button 
                  onClick={handleDownloadPDF}
                  className="p-2.5 bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-950/30 dark:text-primary-400 dark:hover:bg-primary-950/60 rounded-xl text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto"
                >
                  <FiDownload className="w-4 h-4" /> Download PDF Report
                </button>
              </div>

              {/* Scanner Subject & Crop parameters Grid */}
              <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-150 dark:border-gray-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {result.detectedObject ? (
                  <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-850">
                    <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Detected Subject</span>
                    <span className="text-xs font-black text-gray-800 dark:text-gray-200">{result.detectedObject}</span>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-850">
                    <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Detected Subject</span>
                    <span className="text-xs font-black text-gray-800 dark:text-gray-200">Crop Leaf</span>
                  </div>
                )}
                {result.cropName && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-850">
                    <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Crop Name</span>
                    <span className="text-xs font-black text-gray-800 dark:text-gray-200">{result.cropName}</span>
                    {result.scientificName && (
                      <span className="text-[9px] block italic text-gray-400 mt-0.5">{result.scientificName}</span>
                    )}
                  </div>
                )}
                {result.healthStatus && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-850">
                    <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Health Status</span>
                    <span className={`text-xs font-black flex items-center gap-1 ${
                      result.healthStatus.toLowerCase().includes('healthy') 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-650 dark:text-red-400'
                    }`}>
                      {result.healthStatus}
                    </span>
                  </div>
                )}
                {result.severity && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-850">
                    <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Severity</span>
                    <span className="text-xs font-black text-gray-800 dark:text-gray-200">{result.severity}</span>
                  </div>
                )}
              </div>

              {/* Economic Impact & Pathogens Grid */}
              {(result.cause || result.estimatedYieldLoss || result.similarDiseases) && (
                <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-150 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {result.cause && (
                    <div>
                      <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider mb-1">Pathogen / Cause</span>
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-semibold">{result.cause}</p>
                    </div>
                  )}
                  {result.estimatedYieldLoss && (
                    <div>
                      <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider mb-1">Est. Yield Loss</span>
                      <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed font-black">{result.estimatedYieldLoss}</p>
                    </div>
                  )}
                  {result.similarDiseases && (
                    <div>
                      <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider mb-1">Similar Pathogens</span>
                      <p className="text-xs text-gray-550 dark:text-gray-400 leading-relaxed italic">{result.similarDiseases}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Stats card */}
              <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-150 dark:border-gray-800">
                <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-sm mb-2.5">
                  <FiInfo className="w-4 h-4" />
                  <span>{t('confidence')}: {(result.confidence * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{t('symptoms')}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{result.symptoms}</p>
                </div>
              </div>

              {/* Tabs control */}
              <div className="bg-white dark:bg-gray-900 p-1 rounded-2xl border border-gray-150 dark:border-gray-800 flex">
                <button
                  onClick={() => setActiveTab('organic')}
                  className={`flex-1 py-3 text-xs font-bold rounded-xl transition ${
                    activeTab === 'organic' 
                      ? 'bg-primary-600 text-white shadow-sm' 
                      : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                  }`}
                >
                  🍃 {t('organicSolution')}
                </button>
                <button
                  onClick={() => setActiveTab('chemical')}
                  className={`flex-1 py-3 text-xs font-bold rounded-xl transition ${
                    activeTab === 'chemical' 
                      ? 'bg-primary-600 text-white shadow-sm' 
                      : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                  }`}
                >
                  🧪 {t('chemicalSolution')}
                </button>
                <button
                  onClick={() => setActiveTab('prevention')}
                  className={`flex-1 py-3 text-xs font-bold rounded-xl transition ${
                    activeTab === 'prevention' 
                      ? 'bg-primary-600 text-white shadow-sm' 
                      : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
                  }`}
                >
                  🛡️ {t('prevention')}
                </button>
              </div>

              {/* Tab Content Display */}
              <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800 min-h-[160px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-3"
                  >
                    {activeTab === 'organic' && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-1.5">Biological Controls</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{result.organicSolution}</p>
                      </div>
                    )}
                    {activeTab === 'chemical' && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-1.5">Chemical Spray Advice</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{result.chemicalSolution}</p>
                      </div>
                    )}
                    {activeTab === 'prevention' && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-1.5">Proactive Farm Hygiene</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{result.prevention}</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

            </motion.div>
          ) : (
            <div className="h-[420px] border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl flex flex-col items-center justify-center p-6 text-center">
              <span className="text-5xl mb-3">🔍</span>
              <h3 className="font-bold text-gray-700 dark:text-gray-300">No Leaf Image Diagnosed</h3>
              <p className="text-xs text-gray-450 mt-1 max-w-sm">
                Drop an image in the left panel to scan plant anatomy. The AI will look for leaf spot damage, necrotic tissue, downy rust, or curled veins.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Video Guides Section */}
      <div className="pt-8 border-t border-gray-150 dark:border-gray-800">
        <VideoGuidesSection context="disease" />
      </div>

    </div>
  );
};

export default DiseaseDetection;
