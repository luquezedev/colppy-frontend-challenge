import React, { memo } from 'react';
import clsx from 'clsx';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ChartContainerProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  error?: Error | null;
  onRefresh?: () => void;
  actions?: React.ReactNode;
}

export const ChartContainer = memo<ChartContainerProps>(
  ({ title, children, className, isLoading = false, error, onRefresh, actions }) => {
    const { t } = useTranslation();

    const containerClasses = clsx(
      'card',
      'relative',
      {
        'animate-pulse': isLoading,
      },
      className
    );

    return (
      <div className={containerClasses}>
        <div className="card-body">
          {/* Header */}
          {(title || actions || onRefresh) && (
            <div className="flex items-center justify-between mb-4">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
                  {title}
                </h3>
              )}
              <div className="flex items-center gap-2">
                {actions}
                {onRefresh && !isLoading && (
                  <button
                    onClick={onRefresh}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
                    aria-label={t('tooltips.refreshData')}
                    disabled={isLoading}
                  >
                    <RefreshCw
                      className={clsx('w-4 h-4 text-gray-600 dark:text-dark-text-secondary', {
                        'animate-spin': isLoading,
                      })}
                    />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="relative">
            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-dark-bg-secondary/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <div className="spinner" />
                  <span className="text-sm text-gray-600 dark:text-dark-text-secondary">
                    {t('dashboard.loading')}
                  </span>
                </div>
              </div>
            )}

            {/* Error state */}
            {error && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-red-500 dark:text-red-400 mb-2">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 dark:text-dark-text-secondary text-center">
                  {error.message || t('errors.generic')}
                </p>
                {onRefresh && (
                  <button onClick={onRefresh} className="btn btn-primary mt-4">
                    {t('actions.retry')}
                  </button>
                )}
              </div>
            )}

            {/* Chart content */}
            {!error && children}
          </div>
        </div>
      </div>
    );
  }
);

ChartContainer.displayName = 'ChartContainer';
