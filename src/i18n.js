import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationVI from './locales/vi/translation.json';
import translationEN from './locales/en/translation.json';

const resources = {
  vi: {
    translation: translationVI
  },
  en: {
    translation: translationEN
  }
};

function getSavedLanguage() {
  try {
    const lang = localStorage.getItem('selectedLang')?.toLowerCase();
    return lang === 'en' ? 'en' : 'vi';
  } catch {
    // Some browsers/privacy modes can block storage access.
    return 'vi';
  }
}

const savedLang = getSavedLanguage();

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: savedLang, // language to use
    fallbackLng: 'vi',

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
