import React, { memo, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { formatCurrency, formatNumber, formatPercentage } from '@/i18n/config';
import type { KPIData, TrendDirection } from '@/types/metrics';

interface KPICardProps extends KPIData {
  className?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

// Memoized trend icon component
const TrendIcon = memo(
  ({ direction, className }: { direction: TrendDirection; className?: string }) => {
    switch (direction) {
      case 'up':
        return <TrendingUp className={clsx('w-4 h-4', className)} />;
      case 'down':
        return <TrendingDown className={clsx('w-4 h-4', className)} />;
      default:
        return <Minus className={clsx('w-4 h-4', className)} />;
    }
  }
);

TrendIcon.displayName = 'TrendIcon';

export const KPICard = memo<KPICardProps>(
  ({
    title,
    value,
    format = 'number',
    trend,
    threshold,
    className,
    onClick,
    isLoading = false,
  }) => {
    const { t, i18n } = useTranslation();

    // Memoize formatted value
    const formattedValue = useMemo(() => {
      if (isLoading || value === null || value === undefined) return '—';

      switch (format) {
        case 'currency':
          return formatCurrency(value, 'USD', i18n.language);
        case 'percentage':
          return formatPercentage(value, i18n.language);
        default:
          return formatNumber(value, i18n.language);
      }
    }, [value, format, i18n.language, isLoading]);

    // Memoize threshold status
    const thresholdStatus = useMemo(() => {
      if (!threshold || value === null || value === undefined) return null;

      const exceedsWarning =
        threshold.comparison === 'above' ? value > threshold.warning : value < threshold.warning;

      const exceedsCritical =
        threshold.comparison === 'above' ? value > threshold.critical : value < threshold.critical;

      if (exceedsCritical) return 'critical';
      if (exceedsWarning) return 'warning';
      return 'normal';
    }, [threshold, value]);

    // Memoize trend classes
    const trendClasses = useMemo(() => {
      if (!trend) return '';

      const isPositive = trend.isPositive;
      return clsx('flex items-center gap-1 text-sm font-medium', {
        'text-metric-success dark:text-metric-success-light': isPositive,
        'text-metric-danger dark:text-metric-danger-light': !isPositive,
      });
    }, [trend]);

    // Memoize card classes
    const cardClasses = useMemo(() => {
      return clsx(
        'metric-card',
        'relative overflow-hidden',
        {
          'cursor-pointer': onClick,
          'animate-pulse': isLoading,
          'border-metric-warning dark:border-metric-warning': thresholdStatus === 'warning',
          'border-metric-danger dark:border-metric-danger': thresholdStatus === 'critical',
          'border-metric-success dark:border-metric-success':
            thresholdStatus === 'normal' && threshold,
        },
        className
      );
    }, [className, onClick, isLoading, thresholdStatus, threshold]);

    return (
      <div
        className={cardClasses}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
      >
        <div className="card-body">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="metric-label truncate flex-1">{t(`metrics.${title}`)}</h3>
            {thresholdStatus && !isLoading && (
              <span
                className={clsx('px-2 py-0.5 text-2xs font-medium rounded-full', {
                  'badge-warning': thresholdStatus === 'warning',
                  'badge-danger': thresholdStatus === 'critical',
                  'badge-success': thresholdStatus === 'normal',
                })}
              >
                {thresholdStatus === 'critical' && t('alerts.criticalLevel')}
                {thresholdStatus === 'warning' && t('alerts.warning')}
                {thresholdStatus === 'normal' && 'OK'}
              </span>
            )}
          </div>

          {/* Value */}
          <div className="mb-3">
            {isLoading ? (
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ) : (
              <p className="metric-value tabular-nums">{formattedValue}</p>
            )}
          </div>

          {/* Trend */}
          {trend && !isLoading && (
            <div className={trendClasses}>
              <TrendIcon
                direction={trend.direction}
                className={trend.isPositive ? 'text-current' : 'text-current'}
              />
              <span className="tabular-nums">
                {trend.direction === 'up' && '+'}
                {trend.direction === 'down' && '-'}
                {formatPercentage(Math.abs(trend.percentage), i18n.language, 1)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t('trends.vsLastPeriod')}
              </span>
            </div>
          )}

          {/* Loading indicator for trend */}
          {isLoading && (
            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          )}
        </div>

        {/* Alert indicator */}
        {thresholdStatus === 'critical' && !isLoading && (
          <div className="absolute top-0 right-0 w-2 h-2 m-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-metric-danger opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-metric-danger" />
          </div>
        )}
      </div>
    );
  },
  // Custom comparison function for better performance
  (prevProps, nextProps) => {
    return (
      prevProps.value === nextProps.value &&
      prevProps.title === nextProps.title &&
      prevProps.format === nextProps.format &&
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.trend?.percentage === nextProps.trend?.percentage &&
      prevProps.trend?.direction === nextProps.trend?.direction &&
      prevProps.threshold?.warning === nextProps.threshold?.warning &&
      prevProps.threshold?.critical === nextProps.threshold?.critical &&
      prevProps.className === nextProps.className
    );
  }
);

KPICard.displayName = 'KPICard';
