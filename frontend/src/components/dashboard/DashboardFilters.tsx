import { useState, useCallback } from 'react';
import { Calendar, Filter, X, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

export interface DateRange {
  from: string | null;
  to: string | null;
}

export interface FilterState {
  dateRange: DateRange;
  regions: string[];
}

interface DashboardFiltersProps {
  onFilterChange?: (filters: FilterState) => void;
  className?: string;
  availableRegions?: string[];
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  onFilterChange,
  className,
  availableRegions = ['US', 'EU', 'LATAM', 'APAC'],
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);

  // Single function to update filters and notify parent
  const updateFilters = useCallback(
    (newDateRange: DateRange, newRegions: string[]) => {
      setDateRange(newDateRange);
      setSelectedRegions(newRegions);
      onFilterChange?.({ dateRange: newDateRange, regions: newRegions });
    },
    [onFilterChange]
  );

  const handleDateRangeChange = useCallback(
    (type: 'from' | 'to', value: string) => {
      const newDateRange = { ...dateRange, [type]: value || null };
      updateFilters(newDateRange, selectedRegions);
    },
    [dateRange, selectedRegions, updateFilters]
  );

  // Fixed: Update both from and to in a single operation
  const handleQuickDateRange = useCallback(
    (from: string, to: string) => {
      updateFilters({ from, to }, selectedRegions);
    },
    [selectedRegions, updateFilters]
  );

  const handleRegionToggle = useCallback(
    (region: string) => {
      const newRegions = selectedRegions.includes(region)
        ? selectedRegions.filter((r) => r !== region)
        : [...selectedRegions, region];
      updateFilters(dateRange, newRegions);
    },
    [selectedRegions, dateRange, updateFilters]
  );

  const handleClearFilters = useCallback(() => {
    updateFilters({ from: null, to: null }, []);
  }, [updateFilters]);

  const hasActiveFilters = dateRange.from || dateRange.to || selectedRegions.length > 0;

  return (
    <div
      className={clsx(
        'bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm border border-gray-200 dark:border-gray-700',
        className
      )}
    >
      {/* Filter header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600 dark:text-dark-text-secondary" />
          <span className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
            {t('filters.title')}
          </span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full">
              {t('filters.active')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearFilters();
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title={t('filters.clear')}
            >
              <X className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            </button>
          )}
          <svg
            className={clsx('w-4 h-4 text-gray-400 transition-transform', {
              'rotate-180': isExpanded,
            })}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Filter content */}
      {isExpanded && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 space-y-4">
          {/* Date range filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
              <Calendar className="w-4 h-4 inline mr-1.5" />
              {t('filters.dateRange')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-dark-text-tertiary mb-1">
                  {t('filters.from')}
                </label>
                <input
                  type="date"
                  value={dateRange.from || ''}
                  onChange={(e) => handleDateRangeChange('from', e.target.value)}
                  max={dateRange.to || undefined}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-dark-text-tertiary mb-1">
                  {t('filters.to')}
                </label>
                <input
                  type="date"
                  value={dateRange.to || ''}
                  onChange={(e) => handleDateRangeChange('to', e.target.value)}
                  min={dateRange.from || undefined}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-bg-tertiary dark:text-dark-text-primary"
                />
              </div>
            </div>
          </div>

          {/* Quick date range presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
              {t('filters.quickSelect')}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0]!;
                  handleQuickDateRange(today, today);
                }}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-dark-text-primary bg-gray-100 dark:bg-dark-bg-tertiary hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                {t('filters.today')}
              </button>
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                  handleQuickDateRange(
                    lastWeek.toISOString().split('T')[0]!,
                    today.toISOString().split('T')[0]!
                  );
                }}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-dark-text-primary bg-gray-100 dark:bg-dark-bg-tertiary hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                {t('filters.lastWeek')}
              </button>
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                  handleQuickDateRange(
                    lastMonth.toISOString().split('T')[0]!,
                    today.toISOString().split('T')[0]!
                  );
                }}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-dark-text-primary bg-gray-100 dark:bg-dark-bg-tertiary hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                {t('filters.lastMonth')}
              </button>
            </div>
          </div>

          {/* Region filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-2">
              <MapPin className="w-4 h-4 inline mr-1.5" />
              {t('filters.regions')}
            </label>
            <div className="flex flex-wrap gap-2">
              {availableRegions.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => handleRegionToggle(region)}
                  className={clsx(
                    'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                    selectedRegions.includes(region)
                      ? 'bg-primary-500 text-white hover:bg-primary-600'
                      : 'bg-gray-100 dark:bg-dark-bg-tertiary text-gray-700 dark:text-dark-text-primary hover:bg-gray-200 dark:hover:bg-gray-600'
                  )}
                >
                  {region}
                </button>
              ))}
            </div>
            {selectedRegions.length > 0 && (
              <p className="mt-2 text-xs text-gray-500 dark:text-dark-text-tertiary">
                {selectedRegions.length}{' '}
                {selectedRegions.length === 1
                  ? t('filters.regionSelected')
                  : t('filters.regionsSelected')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
