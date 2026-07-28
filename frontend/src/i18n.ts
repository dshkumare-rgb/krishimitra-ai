import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import pa from './locales/pa.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  pa: { translation: pa }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language is fallback-configured dynamically by context
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
