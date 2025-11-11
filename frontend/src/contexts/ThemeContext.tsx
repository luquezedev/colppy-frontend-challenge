import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'light',
  storageKey = 'app-theme',
}) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check for stored theme preference
    const storedTheme = localStorage.getItem(storageKey) as Theme | null;
    if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
      return storedTheme;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return defaultTheme;
  });

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      localStorage.setItem(storageKey, newTheme);
    },
    [storageKey]
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  useEffect(() => {
    const root = document.documentElement;

    // Remove previous theme class
    root.classList.remove('light', 'dark');

    // Add current theme class
    root.classList.add(theme);

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#ffffff');
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if no user preference is stored
      const storedTheme = localStorage.getItem(storageKey);
      if (!storedTheme) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    // Check if addEventListener is available (modern browsers)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [storageKey]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Custom hook for theme-aware class names
export const useThemeClasses = () => {
  const { theme } = useTheme();

  return useCallback(
    (lightClasses: string, darkClasses: string) => {
      return theme === 'dark' ? darkClasses : lightClasses;
    },
    [theme]
  );
};

// Utility function to get theme-aware colors for Highcharts
export const getChartTheme = (theme: Theme) => {
  const isDark = theme === 'dark';

  return {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    textColor: isDark ? '#f8fafc' : '#0f172a',
    gridLineColor: isDark ? '#334155' : '#e2e8f0',
    tooltipBackgroundColor: isDark ? '#334155' : '#f8fafc',
    tooltipTextColor: isDark ? '#f8fafc' : '#0f172a',
    legendTextColor: isDark ? '#cbd5e1' : '#475569',
    axisLabelColor: isDark ? '#94a3b8' : '#64748b',
  };
};
