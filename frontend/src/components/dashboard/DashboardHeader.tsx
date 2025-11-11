import { useTranslation } from 'react-i18next';
import { formatDate } from '@/i18n/config';
import { DashboardControls } from './DashboardControls';

interface DashboardHeaderProps {
  lastUpdated?: string;
  autoRefreshEnabled: boolean;
  isValidating: boolean;
  onToggleAutoRefresh: () => void;
  onRefresh: () => void;
  onExport: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  lastUpdated,
  autoRefreshEnabled,
  isValidating,
  onToggleAutoRefresh,
  onRefresh,
  onExport,
}) => {
  const { t, i18n } = useTranslation();

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Title and last updated */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-dark-text-primary truncate">
              {t('dashboard.subtitle')}
            </h2>
            {lastUpdated && (
              <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-dark-text-secondary">
                {t('dashboard.lastUpdated', {
                  time: formatDate(lastUpdated, i18n.language),
                })}
              </p>
            )}
          </div>

          {/* Controls moved to same line on larger screens */}
          <div className="flex sm:flex-shrink-0">
            <DashboardControls
              autoRefreshEnabled={autoRefreshEnabled}
              isValidating={isValidating}
              onToggleAutoRefresh={onToggleAutoRefresh}
              onRefresh={onRefresh}
              onExport={onExport}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
