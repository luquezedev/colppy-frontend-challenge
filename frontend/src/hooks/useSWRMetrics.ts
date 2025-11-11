import { useMemo } from 'react';
import useSWR from 'swr';
import { api } from '@/services/api';
import type { Metrics, MetricsResponse } from '@/types/metrics';

interface UseSWRMetricsOptions {
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  shouldRetryOnError?: boolean;
}

export function useSWRMetrics(options: UseSWRMetricsOptions = {}) {
  const {
    refreshInterval = 5000, // Default 5 seconds polling
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    shouldRetryOnError = true,
  } = options;

  const { data, error, isLoading, isValidating, mutate } = useSWR<MetricsResponse>(
    '/api/metrics',
    () => api.metrics.getAll(),
    {
      refreshInterval,
      revalidateOnFocus,
      revalidateOnReconnect,
      shouldRetryOnError,
      dedupingInterval: 2000,
      keepPreviousData: true,
      onSuccess: (data) => {
        // Check for threshold alerts
        if (data && data.length > 0) {
          const latestMetrics = data[data.length - 1];
          if (latestMetrics) {
            checkThresholds(latestMetrics);
          }
        }
      },
    }
  );

  // ✅ OPTIMIZED: Memoize latest metrics calculation
  const latestMetrics = useMemo(() => {
    return data && data.length > 0 ? (data[data.length - 1] ?? null) : null;
  }, [data]);

  // ✅ OPTIMIZED: Memoize aggregated metrics calculation
  const aggregatedMetrics = useMemo(() => {
    // Always return a valid object, even when there's no data
    if (!data || !Array.isArray(data)) {
      return {
        averageActiveUsers: 0,
        totalRevenue: 0,
        averageConversionRate: 0,
        averageChurnRate: 0,
        topRegion: null,
      };
    }
    return calculateAggregatedMetrics(data);
  }, [data]);

  return {
    metrics: data && Array.isArray(data) ? data : [],
    latestMetrics,
    aggregatedMetrics,
    isLoading,
    isValidating,
    isError: !!error,
    error,
    refresh: mutate,
  };
}

// Helper function to calculate aggregated metrics
function calculateAggregatedMetrics(metrics: MetricsResponse) {
  // Validate that metrics is an array
  if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
    return {
      averageActiveUsers: 0,
      totalRevenue: 0,
      averageConversionRate: 0,
      averageChurnRate: 0,
      topRegion: null,
    };
  }

  const sum = metrics.reduce(
    (acc, metric) => ({
      activeUsers: acc.activeUsers + metric.activeUsers,
      revenue: acc.revenue + metric.revenue,
      conversionRate: acc.conversionRate + metric.conversionRate,
      churnRate: acc.churnRate + metric.churnRate,
    }),
    { activeUsers: 0, revenue: 0, conversionRate: 0, churnRate: 0 }
  );

  // Get all regions and find the top one
  const regionMap = new Map<string, number>();
  metrics.forEach((metric) => {
    metric.regions.forEach((region) => {
      const current = regionMap.get(region.name) || 0;
      regionMap.set(region.name, current + region.value);
    });
  });

  const topRegion = Array.from(regionMap.entries()).reduce(
    (max, [name, value]) => (value > (max?.value || 0) ? { name, value } : max),
    null as { name: string; value: number } | null
  );

  return {
    averageActiveUsers: Math.round(sum.activeUsers / metrics.length),
    totalRevenue: sum.revenue,
    averageConversionRate: Number((sum.conversionRate / metrics.length).toFixed(2)),
    averageChurnRate: Number((sum.churnRate / metrics.length).toFixed(2)),
    topRegion,
  };
}

// Helper function to check thresholds
function checkThresholds(metrics: Metrics) {
  const thresholds = [
    { metric: 'churnRate', value: metrics.churnRate, warning: 5, critical: 10 },
    { metric: 'conversionRate', value: metrics.conversionRate, warning: 2, critical: 1 },
  ];

  thresholds.forEach(({ metric, value, warning, critical }) => {
    if (metric === 'churnRate' && value > warning) {
      console.warn(`⚠️ ${metric} threshold exceeded: ${value}%`);
      if (value > critical) {
        console.error(`🚨 ${metric} critical level: ${value}%`);
      }
    }
    if (metric === 'conversionRate' && value < warning) {
      console.warn(`⚠️ ${metric} below threshold: ${value}%`);
      if (value < critical) {
        console.error(`🚨 ${metric} critical level: ${value}%`);
      }
    }
  });
}

// Hook for getting just the latest metrics
export function useLatestMetrics(options?: UseSWRMetricsOptions) {
  const { latestMetrics, isLoading, isError, error, refresh } = useSWRMetrics(options);

  return {
    metrics: latestMetrics,
    isLoading,
    isError,
    error,
    refresh,
  };
}
