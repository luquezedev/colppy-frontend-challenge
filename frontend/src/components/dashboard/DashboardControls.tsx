import { RefreshCw, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

interface DashboardControlsProps {
  autoRefreshEnabled: boolean;
  isValidating: boolean;
  onToggleAutoRefresh: () => void;
  onRefresh: () => void;
  onExport: () => void;
}

export const DashboardControls: React.FC<DashboardControlsProps> = ({
  autoRefreshEnabled,
  isValidating,
  onToggleAutoRefresh,
  onRefresh,
  onExport,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      {/* Auto-refresh toggle switch */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="hidden xs:inline text-sm text-gray-600 dark:text-dark-text-secondary whitespace-nowrap">
          {t('settings.autoRefresh')}
        </span>
        <button
          onClick={onToggleAutoRefresh}
          className={clsx(
            'relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
            {
              'bg-metric-success': autoRefreshEnabled,
              'bg-gray-300 dark:bg-gray-600': !autoRefreshEnabled,
            }
          )}
          role="switch"
          aria-checked={autoRefreshEnabled}
          aria-label={t('settings.autoRefresh')}
        >
          <span
            className={clsx(
              'inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out',
              {
                'translate-x-6': autoRefreshEnabled,
                'translate-x-1': !autoRefreshEnabled,
              }
            )}
          />
        </button>
        <span className="text-xs font-medium text-gray-500 dark:text-dark-text-tertiary whitespace-nowrap min-w-[28px]">
          {autoRefreshEnabled ? 'ON' : 'OFF'}
        </span>
      </div>

      {/* Action buttons */}
      <button
        onClick={onRefresh}
        disabled={isValidating}
        className="btn btn-secondary flex-shrink-0"
        aria-label={t('actions.refresh')}
      >
        <RefreshCw
          className={clsx('w-4 h-4 sm:mr-2', {
            'animate-spin': isValidating,
          })}
        />
        <span className="hidden sm:inline">{t('actions.refresh')}</span>
      </button>

      <button
        onClick={onExport}
        className="btn btn-secondary flex-shrink-0"
        aria-label={t('actions.export')}
      >
        <Download className="w-4 h-4 sm:mr-2" />
        <span className="hidden sm:inline">{t('actions.export')}</span>
      </button>
    </div>
  );
};
