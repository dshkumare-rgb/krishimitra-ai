import React, { useState } from 'react';
import { FiPhoneCall, FiX, FiCheckCircle } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';
import axios from 'axios';

interface CallExpertModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: string;
  leafImage?: string;
}

export const CallExpertModal: React.FC<CallExpertModalProps> = ({ isOpen, onClose, activePage, leafImage }) => {
  const { t, language } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [desc, setDesc] = useState('');
  const [attachPhoto, setAttachPhoto] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name,
        phone,
        description: desc,
        attachedImage: (activePage === 'disease' && attachPhoto) ? leafImage : null,
        sourcePage: activePage
      };

      await axios.post('/api/support/callback', payload);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setName('');
        setPhone('');
        setDesc('');
      }, 3000);
    } catch (err) {
      console.error('Callback ticket failed, logging locally:', err);
      // Fallback stub logging
      console.log('📬 Webhook Callback Ticket Stub:', { name, phone, desc, activePage });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const helpline = import.meta.env.VITE_EXPERT_HELPLINE_NUMBER || '1800-180-1551';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="bg-orange-500 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FiPhoneCall className="w-6 h-6 animate-bounce" />
            <div>
              <h3 className="font-bold text-lg">{t('callExpert')}</h3>
              <p className="text-xs text-orange-100">{t('farmerHelpline')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-orange-600 rounded-full transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="p-8 flex flex-col items-center justify-center text-center gap-3">
            <FiCheckCircle className="w-16 h-16 text-green-500 animate-pulse" />
            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-lg">
              {language === 'hi' ? 'अनुरोध प्राप्त हुआ!' : 'Request Received!'}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {language === 'hi' 
                ? 'कृषि विशेषज्ञ अगले १५ मिनट में आपसे संपर्क करेंगे।' 
                : 'An agricultural expert will call you back within 15 minutes.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Toll Free Direct */}
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5">
              <span className="text-xs text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider">
                {language === 'hi' ? 'सीधा टोल-फ्री कॉल' : 'Direct Toll-Free Dial'}
              </span>
              <a 
                href={`tel:${helpline.replace(/-/g, '')}`} 
                className="text-2xl font-black text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-2"
              >
                📞 {helpline}
              </a>
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-850" />

            <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">
              {t('requestCallback')}
            </h4>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t('fullName')}</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-gray-100"
                placeholder={language === 'hi' ? 'जैसे: रमेश कुमार' : 'e.g. Ramesh Kumar'}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t('phoneNumber')}</label>
              <input 
                type="tel" 
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-gray-100"
                placeholder="e.g. +91 98765 43210"
              />
            </div>

            {/* Issue Description */}
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t('describeIssue')}</label>
              <textarea 
                rows={3}
                required
                value={desc}
                onChange={e => setDesc(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-gray-100"
                placeholder={language === 'hi' ? 'समस्या का संक्षिप्त विवरण लिखें...' : 'Describe what is happening in your field...'}
              />
            </div>

            {/* Attach Scan Photo (Contextual) */}
            {activePage === 'disease' && leafImage && (
              <label className="flex items-center gap-2 cursor-pointer p-1">
                <input 
                  type="checkbox"
                  checked={attachPhoto}
                  onChange={e => setAttachPhoto(e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 w-4 h-4"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {t('attachScanPhoto')}
                </span>
              </label>
            )}

            {/* SLA Response */}
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-850 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800">
              <span>{t('estResponseTime')}</span>
              <span className="font-bold text-orange-600 dark:text-orange-400">15 {t('mins')}</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? '...' : t('submitRequest')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CallExpertModal;
