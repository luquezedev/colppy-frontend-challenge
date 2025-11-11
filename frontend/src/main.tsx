import React from 'react';
import ReactDOM from 'react-dom/client';
import { SWRConfig } from 'swr';
import { ErrorBoundary } from 'react-error-boundary';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { MetricsHistoryProvider } from './contexts/MetricsHistoryContext';
import { swrConfig } from './config/swr';
import './i18n/config';
import './styles/globals.css';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-red-900/10">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          Something went wrong
        </h2>
        <pre className="text-sm text-gray-700 dark:text-gray-300 mb-4">{error.message}</pre>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reload page
        </button>
      </div>
    </div>
  );
}

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <SWRConfig value={swrConfig}>
        <ThemeProvider>
          <MetricsHistoryProvider>
            <App />
          </MetricsHistoryProvider>
        </ThemeProvider>
      </SWRConfig>
    </ErrorBoundary>
  </React.StrictMode>
);
