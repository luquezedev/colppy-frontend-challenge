import { useState, useMemo, useCallback } from 'react';
import { History, ChevronDown, Download, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatPercentage, formatDate } from '@/i18n/config';
import type { Metrics } from '@/types/metrics';
import clsx from 'clsx';

interface HistoricalDataProps {
  metrics: Metrics[];
  onClearHistory?: () => void;
  className?: string;
}

export const HistoricalData: React.FC<HistoricalDataProps> = ({
  metrics,
  onClearHistory,
  className,
}) => {
  const { t, i18n } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  // Sort metrics by date (most recent first)
  const sortedMetrics = useMemo(() => {
    return [...metrics].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [metrics]);

  // Export to CSV
  const handleExport = useCallback(() => {
    if (sortedMetrics.length === 0) return;

    // Create CSV content
    const headers = ['Timestamp', 'Active Users', 'Revenue', 'Churn Rate', 'Conversion Rate'];
    const rows = sortedMetrics.map((m) => [
      m.timestamp,
      m.activeUsers,
      m.revenue,
      m.churnRate,
      m.conversionRate,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historical-metrics-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sortedMetrics]);

  // Clear history with confirmation
  const handleClear = useCallback(() => {
    if (!onClearHistory) return;

    if (window.confirm(t('historical.confirmClear'))) {
      onClearHistory();
      setCurrentPage(0);
    }
  }, [onClearHistory, t]);

  // Paginate metrics
  const paginatedMetrics = useMemo(() => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedMetrics.slice(start, end);
  }, [sortedMetrics, currentPage]);

  const totalPages = Math.ceil(sortedMetrics.length / itemsPerPage);
  const hasData = metrics.length > 0;

  if (!hasData) return null;

  return (
    <div
      className={clsx(
        'bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm border border-gray-200 dark:border-gray-700',
        className
      )}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-gray-600 dark:text-dark-text-secondary" />
          <span className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
            {t('historical.title')} ({sortedMetrics.length})
          </span>
          <ChevronDown
            className={clsx('w-4 h-4 text-gray-400 transition-transform', {
              'rotate-180': isExpanded,
            })}
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={handleExport}
            disabled={sortedMetrics.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-dark-text-primary bg-gray-100 dark:bg-dark-bg-tertiary hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={t('actions.exportCSV')}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('actions.export')}</span>
          </button>
          {onClearHistory && (
            <button
              onClick={handleClear}
              disabled={sortedMetrics.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={t('actions.clearHistory')}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('actions.clear')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-dark-bg-tertiary">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 dark:text-dark-text-secondary uppercase tracking-wider">
                    {t('historical.timestamp')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-dark-text-secondary uppercase tracking-wider">
                    {t('metrics.activeUsers')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-dark-text-secondary uppercase tracking-wider">
                    {t('metrics.revenue')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-dark-text-secondary uppercase tracking-wider">
                    {t('metrics.churnRate')}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 dark:text-dark-text-secondary uppercase tracking-wider">
                    {t('metrics.conversionRate')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedMetrics.map((metric, index) => (
                  <tr
                    key={metric.id}
                    className={clsx(
                      'hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors',
                      {
                        'bg-primary-50 dark:bg-primary-900/10': index === 0,
                      }
                    )}
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-gray-900 dark:text-dark-text-primary">
                      {formatDate(metric.timestamp, i18n.language)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900 dark:text-dark-text-primary font-medium">
                      {metric.activeUsers.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900 dark:text-dark-text-primary font-medium">
                      {formatCurrency(metric.revenue, 'USD', i18n.language)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900 dark:text-dark-text-primary font-medium">
                      {formatPercentage(metric.churnRate, i18n.language)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-gray-900 dark:text-dark-text-primary font-medium">
                      {formatPercentage(metric.conversionRate, i18n.language)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 dark:text-dark-text-secondary">
                  {t('historical.showing', {
                    from: currentPage * itemsPerPage + 1,
                    to: Math.min((currentPage + 1) * itemsPerPage, sortedMetrics.length),
                    total: sortedMetrics.length,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-dark-text-primary bg-gray-100 dark:bg-dark-bg-tertiary hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('historical.previous')}
                </button>
                <span className="text-xs text-gray-600 dark:text-dark-text-secondary">
                  {currentPage + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-dark-text-primary bg-gray-100 dark:bg-dark-bg-tertiary hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('historical.next')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
