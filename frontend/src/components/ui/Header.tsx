import React, { useState, useRef, useEffect } from 'react';
import { Globe, Moon, Sun, Menu, X, ChevronDown } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, showMenuButton = false }) => {
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0]!;

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setLangMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const handleToggleTheme = () => {
    toggleTheme();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section */}
          <div className="flex items-center gap-4">
            {showMenuButton && (
              <button
                onClick={onMenuClick}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors lg:hidden"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5 text-gray-700 dark:text-dark-text-primary" />
              </button>
            )}
            <h1 className="text-xl font-bold text-gradient">{t('dashboard.title')}</h1>
          </div>

          {/* Desktop controls */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language selector */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-all duration-200"
                aria-label={t('settings.language')}
              >
                <Globe className="w-4 h-4 text-gray-600 dark:text-dark-text-secondary" />
                <span className="text-sm font-medium text-gray-700 dark:text-dark-text-primary hidden md:inline">
                  {currentLanguage.flag} {currentLanguage.name}
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-dark-text-primary md:hidden">
                  {currentLanguage.flag}
                </span>
                <ChevronDown
                  className={clsx(
                    'w-3 h-3 text-gray-500 dark:text-dark-text-tertiary transition-transform duration-200',
                    { 'rotate-180': langMenuOpen }
                  )}
                />
              </button>

              {/* Language dropdown */}
              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-bg-secondary rounded-lg shadow-lg dark:shadow-dark-lg border border-gray-200 dark:border-gray-700 animate-slide-down">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={clsx(
                        'w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors flex items-center gap-3',
                        {
                          'bg-primary-50 dark:bg-primary-900/20': lang.code === i18n.language,
                          'first:rounded-t-lg last:rounded-b-lg': true,
                        }
                      )}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span className="text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                        {lang.name}
                      </span>
                      {lang.code === i18n.language && (
                        <span className="ml-auto text-primary-600 dark:text-primary-400">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={handleToggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-all duration-200"
              aria-label={t('settings.theme')}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500 animate-fade-in" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 animate-fade-in" />
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-700 dark:text-dark-text-primary" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700 dark:text-dark-text-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg-secondary animate-slide-down">
          <div className="px-4 py-3 space-y-2">
            {/* Language selector - Mobile */}
            <div className="pb-2 border-b border-gray-200 dark:border-gray-700">
              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-dark-text-tertiary mb-2">
                {t('settings.language')}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={clsx('p-2 rounded-lg text-center transition-colors', {
                      'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300':
                        lang.code === i18n.language,
                      'hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary':
                        lang.code !== i18n.language,
                    })}
                  >
                    <span className="block text-xl mb-1">{lang.flag}</span>
                    <span className="block text-xs">{lang.code.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme toggle - Mobile */}
            <button
              onClick={handleToggleTheme}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-dark-text-primary">
                {t('settings.theme')}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-dark-text-tertiary">
                  {theme === 'dark' ? t('settings.dark') : t('settings.light')}
                </span>
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-yellow-500" />
                ) : (
                  <Moon className="w-4 h-4 text-gray-600" />
                )}
              </div>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
