import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n, t } = useTranslation();
  const [language, setLangState] = useState('en');

  useEffect(() => {
    // 1. Check local storage cache
    const cached = localStorage.getItem('km-language');
    if (cached) {
      setLangState(cached);
      i18n.changeLanguage(cached);
    } else {
      // 2. Check location state trigger (defaults to Hindi for Indian states/districts)
      const locStr = localStorage.getItem('userLocation');
      if (locStr) {
        try {
          const loc = JSON.parse(locStr);
          // Indian states list/defaults mapping
          if (loc.state || loc.district) {
            setLangState('hi');
            i18n.changeLanguage('hi');
            localStorage.setItem('km-language', 'hi');
          }
        } catch (e) {
          console.error('Failed to parse location for default language:', e);
        }
      }
    }
  }, [i18n]);

  const setLanguage = (lang: string) => {
    setLangState(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('km-language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
