import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useLocation } from '../context/LocationContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { isOnline } from '../services/api';
import VoiceAssistant from './VoiceAssistant';
import OnboardingTour from './OnboardingTour';
import CallExpertModal from './CallExpertModal';
import { 
  FiHome, FiChevronLeft, FiMenu, FiSun, FiMoon, FiGlobe, 
  FiLogOut, FiActivity, FiCloudRain, FiDollarSign, FiAward, 
  FiAlertTriangle, FiPlusCircle, FiDroplet, FiBriefcase, FiCpu, FiTrendingUp, FiTruck,
  FiCalendar, FiShoppingCart, FiSettings, FiPhoneCall, FiInfo
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';


interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage, setActivePage }) => {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { stateName, districtName } = useLocation();
  const { fontSize, setFontSize, highContrast, setHighContrast } = useAccessibility();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expertModalOpen, setExpertModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(isOnline());

  // Listen to network changes
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    { id: 'dashboard', name: t('dashboard'), icon: <FiHome className="w-5 h-5" />, roles: ['farmer', 'admin'] },
    { id: 'crop', name: t('cropRecommendation'), icon: <FiCpu className="w-5 h-5" />, roles: ['farmer', 'admin'] },
    { id: 'calendar', name: language === 'hi' ? 'फसल कैलेंडर' : 'Crop Calendar', icon: <FiCalendar className="w-5 h-5" />, roles: ['farmer', 'admin'] },
    { id: 'yield-predictor', name: t('yieldPredictor'), icon: <FiTrendingUp className="w-5 h-5 text-amber-500" />, roles: ['farmer', 'admin'] },
    { id: 'disease', name: t('diseaseDetection'), icon: <FiActivity className="w-5 h-5" />, roles: ['farmer', 'admin'] },
    { id: 'weather', name: t('weather'), icon: <FiCloudRain className="w-5 h-5" />, roles: ['farmer', 'admin'] },
    { id: 'satellite-map', name: t('satelliteMap'), icon: <FiGlobe className="w-5 h-5 text-indigo-550" />, roles: ['farmer', 'admin'] },
    { id: 'machinery', name: t('machineryTracker'), icon: <FiTruck className="w-5 h-5 text-teal-500" />, roles: ['farmer', 'admin'] },
    { id: 'mandi', name: t('mandiPrices'), icon: <FiDollarSign className="w-5 h-5" />, roles: ['farmer', 'admin'] },
    { id: 'marketplace', name: language === 'hi' ? 'कृषि व्यापार' : 'Marketplace', icon: <FiShoppingCart className="w-5 h-5" />, roles: ['farmer', 'admin'] },
    { id: 'irrigation', name: t('irrigationPlanner'), icon: <FiDroplet className="w-5 h-5" />, roles: ['farmer', 'admin'] },
    { id: 'resource-opt', name: t('resourceOpt'), icon: <FiDroplet className="w-5 h-5 text-blue-550" />, roles: ['farmer', 'admin'] },
    { id: 'fertilizer', name: t('fertilizerRecommend'), icon: <FiPlusCircle className="w-5 h-5" />, roles: ['farmer', 'admin'] },
    { id: 'soil-card', name: t('soilHealthCard'), icon: <FiPlusCircle className="w-5 h-5 text-emerald-500" />, roles: ['farmer', 'admin'] },
    { id: 'profit', name: t('profitCalculator'), icon: <FiBriefcase className="w-5 h-5" />, roles: ['farmer', 'admin'] },
    { id: 'schemes', name: t('schemeFinder'), icon: <FiAward className="w-5 h-5" />, roles: ['farmer', 'admin'] },
    { id: 'pests', name: t('pestAlerts'), icon: <FiAlertTriangle className="w-5 h-5" />, roles: ['farmer', 'admin'] },
    { id: 'settings', name: language === 'hi' ? 'सेटिंग्स' : 'Settings', icon: <FiSettings className="w-5 h-5" />, roles: ['farmer', 'admin'] },
    { id: 'admin', name: t('adminPanel'), icon: <FiPlusCircle className="w-5 h-5 text-accent-500" />, roles: ['admin'] },
  ];

  const visibleNavItems = navItems.filter(item => user && item.roles.includes(user.role));

  const handleNavClick = (id: string) => {
    setActivePage(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 font-sans">
      
      {/* SIDEBAR - DESKTOP */}
      <motion.aside 
        animate={{ width: sidebarOpen ? 260 : 70 }}
        transition={{ duration: 0.2 }}
        className="hidden md:flex flex-col flex-shrink-0 h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm relative z-20"
      >
        {/* Brand Logo */}
        <div className="flex items-center justify-between p-4 h-16 border-b border-gray-100 dark:border-gray-850">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-3xl">🌱</span>
            {sidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-xl text-primary-700 dark:text-primary-400 whitespace-nowrap"
              >
                {t('appName')}
              </motion.span>
            )}
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <FiChevronLeft className={`w-5 h-5 transition-transform duration-200 ${!sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleNavItems.map(item => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-primary-600 text-white font-medium shadow-sm shadow-primary-500/30' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-gray-800 dark:hover:text-primary-400'
                }`}
              >
                {item.icon}
                {sidebarOpen && <span className="text-sm whitespace-nowrap">{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* Profile Card / Logout */}
        <div className="p-3 border-t border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          {sidebarOpen && user && (
            <div className="flex items-center gap-3 mb-3 p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-150 dark:border-gray-700">
              <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm">
                {user.displayName.substring(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{user.displayName}</p>
                <span className="px-2 py-0.5 text-[9px] rounded-full font-bold bg-primary-50 text-primary-700 border border-primary-100 dark:bg-primary-950 dark:text-primary-300 dark:border-primary-900 uppercase">
                  {user.role === 'admin' ? 'ADMIN' : 'FARMER'}
                </span>
              </div>
            </div>
          )}
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition"
          >
            <FiLogOut className="w-4 h-4" />
            {sidebarOpen && <span className="text-xs font-semibold">{t('logout')}</span>}
          </button>
        </div>
      </motion.aside>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* HEADER */}
        <header className="flex items-center justify-between px-4 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 relative z-30">
          
          {/* Left: Mobile menu triggers */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <FiMenu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 md:hidden">
              <span className="text-2xl">🌱</span>
              <span className="font-bold text-lg text-primary-700 dark:text-primary-400">{t('appName')}</span>
            </div>
            
            {/* Online/Offline Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition ${
              onlineStatus 
                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900' 
                : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-900 pulse-button'
            }`}>
              <span className={`w-2 h-2 rounded-full ${onlineStatus ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span>{onlineStatus ? t('onlineMode') : t('offlineMode')}</span>
            </div>
          </div>

          {/* Right: Quick actions (Location, Language selector, Theme switcher, Voice trigger) */}
          <div className="flex items-center gap-2.5">
            
            {/* Location display */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold border border-gray-150 dark:border-gray-750">
              <span>📍</span>
              <span>{districtName}, {stateName}</span>
            </div>

            {/* Language Selector */}
            <button 
              onClick={() => {
                const langs: ('en' | 'hi' | 'pa')[] = ['en', 'hi', 'pa'];
                const nextIdx = (langs.indexOf(language) + 1) % langs.length;
                setLanguage(langs[nextIdx]);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-750 transition"
              title="Change Language / भाषा बदलें / ਭਾਸ਼ਾ ਬਦਲੋ"
            >
              <FiGlobe className="w-4 h-4" />
              <span>
                {language === 'en' ? 'EN' : language === 'hi' ? 'हिं' : 'ਪੰ'}
              </span>
            </button>

            {/* Dark Mode Switcher */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
              title={theme === 'light' ? t('darkMode') : t('lightMode')}
            >
              {theme === 'light' ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
            </button>

            {/* Accessibility Scale Toggle */}
            <div className="flex bg-gray-150 dark:bg-gray-800 p-0.5 rounded-xl border border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => setFontSize('normal')}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${fontSize === 'normal' ? 'bg-white dark:bg-gray-900 text-primary-650 shadow-sm' : 'text-gray-500'}`}
                title="Normal Text Sizing"
              >
                A
              </button>
              <button 
                onClick={() => setFontSize('large')}
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-all ${fontSize === 'large' ? 'bg-white dark:bg-gray-900 text-primary-650 shadow-sm' : 'text-gray-500'}`}
                title="Large Sizing"
              >
                A+
              </button>
              <button 
                onClick={() => setFontSize('xlarge')}
                className={`px-2 py-1 text-[12px] font-bold rounded-lg transition-all ${fontSize === 'xlarge' ? 'bg-white dark:bg-gray-900 text-primary-650 shadow-sm' : 'text-gray-500'}`}
                title="Extra Large Sizing"
              >
                A++
              </button>
            </div>

            {/* Contrast Mode Toggle */}
            <button 
              onClick={() => setHighContrast(!highContrast)}
              className={`p-2 rounded-xl border transition-all ${
                highContrast 
                  ? 'bg-yellow-50 text-yellow-800 border-yellow-350 dark:bg-yellow-950/20 dark:border-yellow-900' 
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title="High Contrast Color Modes"
            >
              🌓
            </button>

            
            {/* Mobile Profile Display */}
            {user && (
              <div className="w-8 h-8 md:hidden rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-xs">
                {user.displayName.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </header>

        {/* MOBILE SIDEBAR DROPDOWN */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black z-40 md:hidden"
              />
              {/* Sidebar Menu */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-2xl z-50 md:hidden flex flex-col p-4"
              >
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-150 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">🌱</span>
                    <span className="font-bold text-xl text-primary-700 dark:text-primary-400">{t('appName')}</span>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-500"
                  >
                    <FiChevronLeft className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-1">
                  {visibleNavItems.map(item => {
                    const isActive = activePage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                          isActive 
                            ? 'bg-primary-600 text-white font-medium' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {item.icon}
                        <span className="text-sm font-semibold">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
                {user && (
                  <div className="mt-auto pt-4 border-t border-gray-150 dark:border-gray-800 flex flex-col gap-3">
                    <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-xs">
                        {user.displayName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">{user.displayName}</p>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">{user.role}</span>
                      </div>
                    </div>
                    <button 
                      onClick={logout}
                      className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span className="text-xs font-semibold">{t('logout')}</span>
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* CONTAINER CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-950 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
              className="h-full max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>

      {/* Floating Voice Assistant FAB */}
      <VoiceAssistant activePage={activePage} setActivePage={handleNavClick} />

      {/* Interactive Joyride Onboarding Tour */}
      <OnboardingTour />

      {/* Call an Expert Floating FAB */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setExpertModalOpen(true)}
          className={`flex items-center gap-2 px-4 py-3.5 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-black shadow-lg shadow-orange-500/35 hover:shadow-orange-500/50 transition-all ${
            activePage === 'disease' || activePage === 'pests' ? 'scale-110' : 'scale-90 opacity-80 hover:opacity-100'
          }`}
          title="Call an Expert Helpline"
          id="call-expert-fab"
        >
          <FiPhoneCall className="w-5 h-5" />
          {(activePage === 'disease' || activePage === 'pests') && (
            <span className="text-xs uppercase tracking-wider">
              {language === 'hi' ? 'किसान सहायता' : 'Call Expert'}
            </span>
          )}
        </button>
      </div>

      {/* Call an Expert Form Modal */}
      {expertModalOpen && (
        <CallExpertModal 
          isOpen={expertModalOpen} 
          onClose={() => setExpertModalOpen(false)} 
          pageContext={activePage}
        />
      )}

    </div>
  );
};
