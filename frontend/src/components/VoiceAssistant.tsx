import React, { useState, useEffect, useRef } from 'react';
import { FiMic, FiMicOff, FiCheck, FiX } from 'react-icons/fi';
import { useLanguage } from '../context/LanguageContext';

interface VoiceAssistantProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ activePage, setActivePage }) => {
  const { language, t } = useLanguage();
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [pendingCommand, setPendingCommand] = useState<{ targetPage: string; speakText: string; commandLabel: string } | null>(null);
  const [timerCount, setTimerCount] = useState(5);
  
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recObj = new SpeechRecognition();
      recObj.continuous = false;
      recObj.interimResults = false;
      
      recObj.onstart = () => {
        setListening(true);
        speakResponse(language === 'hi' ? 'बोलिए, मैं सुन रहा हूँ।' : 'I am listening. Please speak.');
      };

      recObj.onend = () => {
        setListening(false);
      };

      recObj.onerror = (event: any) => {
        console.error('Speech Recognition Error:', event.error);
        setListening(false);
      };

      recObj.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log('🎤 Speech recognized:', transcript);
        processVoiceCommand(transcript);
      };

      recognitionRef.current = recObj;
    }
  }, [language]);

  // Handle countdown for auto-confirm
  useEffect(() => {
    if (pendingCommand) {
      setTimerCount(5);
      timerRef.current = setInterval(() => {
        setTimerCount((prev) => {
          if (prev <= 1) {
            handleConfirm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pendingCommand]);

  const speakResponse = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const processVoiceCommand = (text: string) => {
    let targetPage = '';
    let speakText = '';
    let commandLabel = '';

    if (text.includes('weather') || text.includes('forecast') || text.includes('rain') || text.includes('मौसम') || text.includes('बारिश')) {
      targetPage = 'weather';
      commandLabel = language === 'hi' ? 'मौसम पूर्वानुमान' : 'Weather Forecast';
      speakText = language === 'hi' ? 'मौसम विभाग की जानकारी खोल रहे हैं।' : 'Opening weather forecasting updates.';
    } 
    else if (text.includes('recommend') || text.includes('suggest') || text.includes('crop') || text.includes('फसल') || text.includes('सुझाव') || text.includes('बुवाई')) {
      targetPage = 'crop';
      commandLabel = language === 'hi' ? 'फसल सुझाव' : 'Crop Recommendation';
      speakText = language === 'hi' ? 'फसल सुझाव केंद्र खोल रहे हैं।' : 'Opening crop recommendation system.';
    } 
    else if (text.includes('disease') || text.includes('leaf') || text.includes('plant') || text.includes('बीमारी') || text.includes('पत्ता') || text.includes('पौधा') || text.includes('कीट')) {
      targetPage = 'disease';
      commandLabel = language === 'hi' ? 'फसल रोग पहचान' : 'Disease Detection';
      speakText = language === 'hi' ? 'पौधा रोग पहचान केंद्र खोल रहे हैं।' : 'Opening plant disease scanner.';
    } 
    else if (text.includes('mandi') || text.includes('price') || text.includes('rate') || text.includes('भाव') || text.includes('दाम') || text.includes('रेट')) {
      targetPage = 'mandi';
      commandLabel = language === 'hi' ? 'मंडी बाजार भाव' : 'Mandi Prices';
      speakText = language === 'hi' ? 'मंडी बाजार भाव लोड हो रहे हैं।' : 'Opening Mandi prices dashboard.';
    } 
    else if (text.includes('irrigation') || text.includes('water') || text.includes('schedule') || text.includes('सिंचाई') || text.includes('पानी')) {
      targetPage = 'irrigation';
      commandLabel = language === 'hi' ? 'सिंचाई योजक' : 'Irrigation Planner';
      speakText = language === 'hi' ? 'सिंचाई योजक कार्यक्रम खोल रहे हैं।' : 'Opening irrigation scheduler.';
    }
    else if (text.includes('fertilizer') || text.includes('urea') || text.includes('npk') || text.includes('खाद') || text.includes('उर्वरक')) {
      targetPage = 'fertilizer';
      commandLabel = language === 'hi' ? 'खाद कैलकुलेटर' : 'Fertilizer Calculator';
      speakText = language === 'hi' ? 'खाद खुराक कैलकुलेटर लोड हो रहा है।' : 'Opening fertilizer recommendations.';
    }
    else if (text.includes('profit') || text.includes('calculator') || text.includes('money') || text.includes('कमाई') || text.includes('मुनाफा') || text.includes('बजट')) {
      targetPage = 'profit';
      commandLabel = language === 'hi' ? 'लाभ कैलकुलेटर' : 'Profit Calculator';
      speakText = language === 'hi' ? 'लाभ और लागत कैलकुलेटर खोल रहे हैं।' : 'Opening profit calculator dashboard.';
    }
    else if (text.includes('scheme') || text.includes('government') || text.includes('yojana') || text.includes('योजना') || text.includes('सरकारी')) {
      targetPage = 'schemes';
      commandLabel = language === 'hi' ? 'सरकारी योजनाएं' : 'Government Schemes';
      speakText = language === 'hi' ? 'सरकारी योजना खोज बोर्ड खोल रहे हैं।' : 'Opening government schemes browser.';
    }
    else if (text.includes('pest') || text.includes('alert') || text.includes('worm') || text.includes('कीड़ा') || text.includes('चेतावनी')) {
      targetPage = 'pests';
      commandLabel = language === 'hi' ? 'कीट चेतावनी' : 'Pest Alerts';
      speakText = language === 'hi' ? 'कीट चेतावनी बोर्ड खोल रहे हैं।' : 'Opening active pest alerts.';
    }
    else if (text.includes('calendar') || text.includes('growth') || text.includes('stage') || text.includes('कैलेंडर')) {
      targetPage = 'calendar';
      commandLabel = language === 'hi' ? 'फसल योजना कैलेंडर' : 'Crop Calendar';
      speakText = language === 'hi' ? 'फसल विकास कैलेंडर खोल रहे हैं।' : 'Opening crop growth calendar.';
    }
    else if (text.includes('market') || text.includes('trade') || text.includes('sell') || text.includes('खरीद') || text.includes('व्यापार')) {
      targetPage = 'marketplace';
      commandLabel = language === 'hi' ? 'कृषि व्यापार केंद्र' : 'Marketplace';
      speakText = language === 'hi' ? 'कृषि व्यापार मंडी खोल रहे हैं।' : 'Opening produce listings marketplace.';
    }
    else if (text.includes('settings') || text.includes('preferences') || text.includes('सेटिंग्स') || text.includes('प्राथमिकताएं')) {
      targetPage = 'settings';
      commandLabel = language === 'hi' ? 'सेटिंग्स मेनू' : 'Settings Preferences';
      speakText = language === 'hi' ? 'सिस्टम सेटिंग्स खोल रहे हैं।' : 'Opening settings panel.';
    }
    else if (text.includes('dashboard') || text.includes('home') || text.includes('डैशबोर्ड') || text.includes('मुख्य')) {
      targetPage = 'dashboard';
      commandLabel = language === 'hi' ? 'मुख्य डैशबोर्ड' : 'Dashboard';
      speakText = language === 'hi' ? 'मुख्य डैशबोर्ड पर वापस जा रहे हैं।' : 'Returning to main dashboard.';
    }

    if (targetPage) {
      setPendingCommand({ targetPage, speakText, commandLabel });
    } else {
      speakResponse(language === 'hi' 
        ? `मुझे समझ नहीं आया। आप बोल सकते हैं: मंडी भाव, फसल कैलेंडर, मौसम या पत्ता रोग।` 
        : `Command not recognized. Try saying: crop calendar, mandi prices, or weather.`);
    }
  };

  const handleConfirm = () => {
    if (pendingCommand) {
      setActivePage(pendingCommand.targetPage);
      speakResponse(pendingCommand.speakText);
    }
    setPendingCommand(null);
  };

  const handleCancel = () => {
    speakResponse(language === 'hi' ? 'आदेश निरस्त किया गया।' : 'Command cancelled.');
    setPendingCommand(null);
  };

  const toggleListen = () => {
    if (!speechSupported || !recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      recognitionRef.current.start();
    }
  };

  if (!speechSupported) return null;

  return (
    <>
      {/* Floating Voice Assistant FAB */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        <button 
          onClick={toggleListen}
          className={`w-14 h-14 rounded-full text-white transition-all flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 ${
            listening 
              ? 'bg-red-500 hover:bg-red-650 shadow-red-500/35 animate-pulse' 
              : 'bg-primary-600 hover:bg-primary-700 shadow-primary-500/35'
          }`}
          title={listening ? 'Stop listening' : 'Start Voice Assistant'}
          id="voice-assistant-fab"
        >
          {listening ? (
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-white/40" />
              <FiMicOff className="w-6 h-6 z-10" />
            </div>
          ) : (
            <FiMic className="w-6 h-6" />
          )}
        </button>
        
        {listening && (
          <div className="bg-red-550 border border-red-400 text-white font-black py-2 px-4 rounded-2xl shadow-lg text-[10px] uppercase tracking-wider">
            {language === 'hi' ? 'सहायक सुन रहा है...' : 'Voice input active...'}
          </div>
        )}
      </div>

      {/* Speech Confirmation Modal Dialog */}
      {pendingCommand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="text-center space-y-2">
              <span className="text-4xl">🎙️</span>
              <h4 className="font-extrabold text-base text-gray-850 dark:text-gray-100">
                {language === 'hi' ? 'आदेश की पुष्टि करें' : 'Confirm Navigation'}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'hi' 
                  ? `क्या आप "${pendingCommand.commandLabel}" पर जाना चाहते हैं?` 
                  : `Do you want to switch to "${pendingCommand.commandLabel}"?`}
              </p>
            </div>

            {/* Countdown Slider Bar */}
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-primary-600 h-full transition-all duration-1000"
                style={{ width: `${(timerCount / 5) * 100}%` }}
              />
            </div>

            <div className="text-[10px] text-center text-gray-400">
              {language === 'hi' 
                ? `${timerCount} सेकंड में स्वतः पुष्टि हो जाएगी...` 
                : `Auto-redirecting in ${timerCount} seconds...`}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-855 rounded-2xl text-xs font-bold text-gray-650 dark:text-gray-300 flex items-center justify-center gap-1.5 transition-all"
              >
                <FiX /> {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-primary-500/25"
              >
                <FiCheck /> {language === 'hi' ? 'हाँ, जाएं' : 'Proceed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceAssistant;
