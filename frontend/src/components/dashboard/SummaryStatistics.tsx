import { useTranslation } from 'react-i18next';
import type { AggregatedMetrics } from '@/types/metrics';

interface SummaryStatisticsProps {
  aggregatedMetrics: AggregatedMetrics;
}

export const SummaryStatistics: React.FC<SummaryStatisticsProps> = ({ aggregatedMetrics }) => {
  const { t } = useTranslation();

  return (
    <div className="p-6 bg-white dark:bg-dark-bg-secondary rounded-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-6">
        {t('summary.title')}
      </h3>
      <div className="flex-1 flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
            {t('summary.averageActiveUsers')}
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-dark-text-primary">
            {aggregatedMetrics.averageActiveUsers.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
            {t('summary.totalRevenue')}
          </p>
          <p className="text-lg font-bold text-metric-success dark:text-metric-success-light">
            ${aggregatedMetrics.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
            {t('summary.avgConversionRate')}
          </p>
          <p className="text-lg font-bold text-metric-info dark:text-metric-info-light">
            {aggregatedMetrics.averageConversionRate}%
          </p>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
            {t('summary.avgChurnRate')}
          </p>
          <p className="text-lg font-bold text-metric-warning dark:text-metric-warning-light">
            {aggregatedMetrics.averageChurnRate}%
          </p>
        </div>
        <div className="flex items-center justify-between py-3">
          <p className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary">
            {t('summary.topRegion')}
          </p>
          <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
            {aggregatedMetrics.topRegion?.name || '—'}
          </p>
        </div>
      </div>
    </div>
  );
};
