import React, { memo, useMemo, useCallback } from 'react';
import { KPICard } from './KPICard';
import type { Metrics, KPIData, TrendDirection, Trend } from '@/types/metrics';

interface KPIGridProps {
  currentMetrics: Metrics | null;
  previousMetrics?: Metrics | null;
  isLoading?: boolean;
  onCardClick?: (metric: string) => void;
}

// Helper function to calculate trend
const calculateTrend = (current: number, previous: number | undefined): Trend | undefined => {
  if (previous === undefined || previous === 0) return undefined;

  const percentage = ((current - previous) / previous) * 100;
  const direction: TrendDirection = percentage > 0.5 ? 'up' : percentage < -0.5 ? 'down' : 'stable';

  return {
    direction,
    percentage: Math.abs(percentage),
    isPositive: percentage > 0,
  };
};

export const KPIGrid = memo<KPIGridProps>(
  ({ currentMetrics, previousMetrics, isLoading = false, onCardClick }) => {
    // Memoize KPI data array
    const kpiData = useMemo<KPIData[]>(() => {
      if (!currentMetrics) {
        // Return skeleton data for loading state
        return [
          { title: 'activeUsers', value: 0 },
          { title: 'revenue', value: 0, format: 'currency' },
          { title: 'churnRate', value: 0, format: 'percentage' },
          { title: 'conversionRate', value: 0, format: 'percentage' },
        ];
      }

      return [
        {
          title: 'activeUsers',
          value: currentMetrics.activeUsers,
          format: 'number',
          trend: calculateTrend(currentMetrics.activeUsers, previousMetrics?.activeUsers),
        },
        {
          title: 'revenue',
          value: currentMetrics.revenue,
          format: 'currency',
          trend: calculateTrend(currentMetrics.revenue, previousMetrics?.revenue),
        },
        {
          title: 'churnRate',
          value: currentMetrics.churnRate,
          format: 'percentage',
          trend: calculateTrend(currentMetrics.churnRate, previousMetrics?.churnRate),
          threshold: {
            metric: 'churnRate',
            warning: 5,
            critical: 10,
            comparison: 'above',
          },
        },
        {
          title: 'conversionRate',
          value: currentMetrics.conversionRate,
          format: 'percentage',
          trend: calculateTrend(currentMetrics.conversionRate, previousMetrics?.conversionRate),
          threshold: {
            metric: 'conversionRate',
            warning: 3,
            critical: 2,
            comparison: 'below',
          },
        },
      ];
    }, [currentMetrics, previousMetrics]);

    // ✅ OPTIMIZED: Create memoized click handlers for each KPI
    const handlers = useMemo(() => {
      if (!onCardClick) return {};

      return {
        activeUsers: () => onCardClick('activeUsers'),
        revenue: () => onCardClick('revenue'),
        churnRate: () => onCardClick('churnRate'),
        conversionRate: () => onCardClick('conversionRate'),
      };
    }, [onCardClick]);

    return (
      <div className="dashboard-grid">
        {kpiData.map((kpi) => (
          <KPICard
            key={kpi.title}
            {...kpi}
            isLoading={isLoading}
            onClick={onCardClick ? handlers[kpi.title as keyof typeof handlers] : undefined}
            className="h-full"
          />
        ))}
      </div>
    );
  }
);

KPIGrid.displayName = 'KPIGrid';
