import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { MetricsHistoryProvider } from '@/contexts/MetricsHistoryContext';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Initialize i18n for tests
i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['translation'],
  defaultNS: 'translation',
  resources: {
    en: {
      translation: {
        dashboard: {
          title: 'Metrics Dashboard',
          subtitle: 'Real-time Performance Monitoring',
          lastUpdated: 'Last updated: {{time}}',
          loading: 'Loading dashboard...',
          error: 'Error loading dashboard',
        },
        metrics: {
          activeUsers: 'Active Users',
          revenue: 'Revenue',
          churnRate: 'Churn Rate',
          conversionRate: 'Conversion Rate',
        },
        alerts: {
          warning: 'Warning',
          criticalLevel: 'Critical level reached',
          churnHigh: 'Churn rate is above acceptable threshold',
        },
        actions: {
          refresh: 'Refresh',
          export: 'Export',
          retry: 'Retry',
        },
        trends: {
          vsLastPeriod: 'vs last period',
        },
        settings: {
          theme: 'Theme',
          language: 'Language',
          light: 'Light',
          dark: 'Dark',
          autoRefresh: 'Auto Refresh',
        },
        errors: {
          fetchFailed: 'Failed to fetch data',
          generic: 'Something went wrong',
        },
        chart: {
          noData: 'No data available for chart',
          timeEvolution: 'Time Evolution',
          comparison: 'Comparison',
          dataPoint: 'Data Point',
          xAxis: 'Time',
          yAxis: 'Users',
        },
        regions: {
          title: 'Regional Distribution',
          north: 'North',
          south: 'South',
          east: 'East',
          west: 'West',
        },
        summary: {
          title: 'Summary Statistics',
          averageActiveUsers: 'Average Active Users',
          totalRevenue: 'Total Revenue',
          avgConversionRate: 'Avg Conversion Rate',
          avgChurnRate: 'Avg Churn Rate',
          topRegion: 'Top Region',
        },
        tooltips: {
          refreshData: 'Click to refresh data',
        },
      },
    },
  },
  react: {
    useSuspense: false,
  },
  interpolation: {
    escapeValue: false,
  },
});

// Create a wrapper component with all providers
interface AllTheProvidersProps {
  children: React.ReactNode;
  swrConfig?: any;
  theme?: 'light' | 'dark';
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({
  children,
  swrConfig = {
    dedupingInterval: 0,
    provider: () => new Map(),
  },
  theme = 'light',
}) => {
  return (
    <I18nextProvider i18n={i18n}>
      <SWRConfig value={swrConfig}>
        <ThemeProvider defaultTheme={theme}>
          <MetricsHistoryProvider>{children}</MetricsHistoryProvider>
        </ThemeProvider>
      </SWRConfig>
    </I18nextProvider>
  );
};

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    swrConfig?: any;
    theme?: 'light' | 'dark';
  }
) => {
  const { swrConfig, theme, ...renderOptions } = options || {};
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders swrConfig={swrConfig} theme={theme}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Mock data generators
export const createMockMetrics = (overrides = {}) => ({
  id: 1,
  timestamp: new Date().toISOString(),
  activeUsers: 1234,
  revenue: 98765,
  conversionRate: 3.5,
  churnRate: 2.1,
  regions: [
    { name: 'North', value: 450 },
    { name: 'South', value: 320 },
    { name: 'East', value: 280 },
    { name: 'West', value: 184 },
  ],
  ...overrides,
});

export const createMockKPIData = (overrides = {}) => ({
  title: 'activeUsers',
  value: 1234,
  format: 'number' as const,
  trend: {
    direction: 'up' as const,
    percentage: 5.2,
    isPositive: true,
  },
  ...overrides,
});

// Wrapper for hooks
export const createWrapper = (swrConfig?: any) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AllTheProviders swrConfig={swrConfig}>{children}</AllTheProviders>
  );
  return Wrapper;
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render, i18n as testI18n };
