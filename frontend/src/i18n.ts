import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import pa from './locales/pa.json';

// Helper to safely unpack JSON resources across development (Vite) and production (Rollup)
const resolveResource = (res: any) => {
  if (res && res.default) {
    return res.default;
  }
  return res;
};

const resources = {
  en: { translation: resolveResource(en) },
  hi: { translation: resolveResource(hi) },
  pa: { translation: resolveResource(pa) }
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
