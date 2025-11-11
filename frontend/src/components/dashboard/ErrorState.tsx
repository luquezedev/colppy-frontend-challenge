import { AlertCircle, ServerOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/ui';
import axios from 'axios';

interface ErrorStateProps {
  error?: Error | null;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  const { t } = useTranslation();

  // Detect if it's a connection error (API not running)
  const isConnectionError =
    axios.isAxiosError(error) &&
    (error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNREFUSED' ||
      error.message.includes('Network Error') ||
      !error.response);

  const Icon = isConnectionError ? ServerOff : AlertCircle;
  const errorMessage = isConnectionError
    ? t('errors.serverNotRunning')
    : error?.message || t('errors.fetchFailed');

  return (
    <div className="min-h-screen bg-surface dark:bg-dark-bg-primary">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md">
            <Icon className="w-12 h-12 text-metric-danger mx-auto mb-4" />
            <p className="text-gray-900 dark:text-dark-text-primary font-semibold mb-2">
              {isConnectionError ? t('errors.serverOffline') : t('dashboard.error')}
            </p>
            <p className="text-gray-600 dark:text-dark-text-secondary mb-4">{errorMessage}</p>
            {isConnectionError && (
              <p className="text-sm text-gray-500 dark:text-dark-text-tertiary mb-4">
                {t('errors.checkApiServer')}
              </p>
            )}
            <button onClick={onRetry} className="btn btn-primary">
              {t('actions.retry')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
