import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations directly for better bundling
import enTranslation from './locales/en/translation.json';
import esTranslation from './locales/es/translation.json';
import ptTranslation from './locales/pt/translation.json';
import frTranslation from './locales/fr/translation.json';
import deTranslation from './locales/de/translation.json';
import jaTranslation from './locales/ja/translation.json';
import zhTranslation from './locales/zh/translation.json';

const resources = {
  en: { translation: enTranslation },
  es: { translation: esTranslation },
  pt: { translation: ptTranslation },
  fr: { translation: frTranslation },
  de: { translation: deTranslation },
  ja: { translation: jaTranslation },
  zh: { translation: zhTranslation },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'pt', 'fr', 'de', 'ja', 'zh'],

    debug: import.meta.env.DEV,

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    ns: ['translation'],
    defaultNS: 'translation',

    react: {
      useSuspense: false, // Disable suspense mode for better control
    },
  });

export default i18n;

// Helper function to format dates according to locale
export const formatDate = (date: Date | string, locale: string = i18n.language): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

// Helper function to format numbers according to locale
export const formatNumber = (
  value: number,
  locale: string = i18n.language,
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat(locale, options).format(value);
};

// Helper function to format currency
export const formatCurrency = (
  value: number,
  currency: string = 'USD',
  locale: string = i18n.language
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Helper function to format percentages
export const formatPercentage = (
  value: number,
  locale: string = i18n.language,
  decimals: number = 1
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};
