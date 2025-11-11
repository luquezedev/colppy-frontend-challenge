import { useMemo, useState, useCallback } from 'react';
import { useSWRMetrics } from '@/hooks/useSWRMetrics';
import { useMetricsHistory } from '@/hooks/useMetricsHistory';
import { useThresholdAlerts } from '@/hooks/useThresholdAlerts';
import { Header } from '@/components/ui';
import { KPIGrid } from '@/components/kpi';
import { AlertList } from '@/components/alerts';
import { DashboardHeader } from './DashboardHeader';
import { DashboardFilters, type FilterState } from './DashboardFilters';
import { HistoricalData } from './HistoricalData';
import { ChartsSection } from './ChartsSection';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

const Dashboard = () => {
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { from: null, to: null },
    regions: [],
  });

  const {
    metrics: currentFetchMetrics,
    latestMetrics,
    aggregatedMetrics,
    isLoading,
    isError,
    error,
    isValidating,
    refresh,
  } = useSWRMetrics({
    refreshInterval: autoRefreshEnabled ? 5000 : 0,
  });

  // Use history hook to accumulate metrics over time (only for Historical Data table)
  // Pass all current fetch metrics to accumulate them in history
  const { history, clearHistory } = useMetricsHistory(currentFetchMetrics || []);

  // Get threshold alerts
  const alerts = useThresholdAlerts(latestMetrics);

  // Calculate previous metrics for trend comparison (from current fetch)
  const previousMetrics = useMemo(() => {
    if (!currentFetchMetrics || currentFetchMetrics.length < 2) return null;
    return currentFetchMetrics[currentFetchMetrics.length - 2] ?? null;
  }, [currentFetchMetrics]);

  // ✅ OPTIMIZED: Memoize export handler (exports history)
  const handleExport = useCallback(() => {
    if (!history || history.length === 0) return;

    // Create CSV content
    const headers = ['Timestamp', 'Active Users', 'Revenue', 'Churn Rate', 'Conversion Rate'];
    const rows = history.map((m) => [
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
    a.download = `metrics-export-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [history]);

  // ✅ OPTIMIZED: Memoize toggle auto-refresh handler
  const handleToggleAutoRefresh = useCallback(() => {
    setAutoRefreshEnabled((prev) => !prev);
  }, []);

  // ✅ OPTIMIZED: Memoize filter change handler
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  // Get available regions from current fetch data
  const availableRegions = useMemo(() => {
    if (!latestMetrics?.regions) return [];
    return latestMetrics.regions.map((r) => r.name).sort();
  }, [latestMetrics]);

  // Filter current fetch metrics by region only (charts show current data)
  const filteredCurrentMetrics = useMemo(() => {
    if (!currentFetchMetrics || currentFetchMetrics.length === 0) return currentFetchMetrics;

    const hasRegionFilter = filters.regions.length > 0;
    if (!hasRegionFilter) return currentFetchMetrics;

    // Filter each metric and recalculate values based on selected regions
    return currentFetchMetrics.map((metric) => {
      const filteredRegions = metric.regions.filter((region) =>
        filters.regions.includes(region.name)
      );

      // If no regions match, return the metric with zero values
      if (filteredRegions.length === 0) {
        return {
          ...metric,
          activeUsers: 0,
          revenue: 0,
          regions: [],
        };
      }

      // Calculate proportion of filtered regions vs total
      const totalRegionValue = metric.regions.reduce((sum, r) => sum + r.value, 0);
      const filteredRegionValue = filteredRegions.reduce((sum, r) => sum + r.value, 0);
      const proportion = totalRegionValue > 0 ? filteredRegionValue / totalRegionValue : 0;

      // Recalculate metrics based on proportion
      return {
        ...metric,
        activeUsers: Math.round(metric.activeUsers * proportion),
        revenue: metric.revenue * proportion,
        churnRate: metric.churnRate, // Rates remain the same
        conversionRate: metric.conversionRate, // Rates remain the same
        regions: filteredRegions,
      };
    });
  }, [currentFetchMetrics, filters.regions]);

  // Get filtered latest metrics for charts and KPIs
  const filteredLatestMetrics = useMemo(() => {
    if (!filteredCurrentMetrics || filteredCurrentMetrics.length === 0) return latestMetrics;
    return filteredCurrentMetrics[filteredCurrentMetrics.length - 1] ?? latestMetrics;
  }, [filteredCurrentMetrics, latestMetrics]);

  // Calculate filtered previous metrics for trend comparison
  const filteredPreviousMetrics = useMemo(() => {
    if (!filteredCurrentMetrics || filteredCurrentMetrics.length < 2) return previousMetrics;
    return filteredCurrentMetrics[filteredCurrentMetrics.length - 2] ?? previousMetrics;
  }, [filteredCurrentMetrics, previousMetrics]);

  // Recalculate aggregated metrics from filtered current data
  const filteredAggregatedMetrics = useMemo(() => {
    // Validate that filteredCurrentMetrics is a valid array
    if (
      !filteredCurrentMetrics ||
      !Array.isArray(filteredCurrentMetrics) ||
      filteredCurrentMetrics.length === 0
    ) {
      return aggregatedMetrics;
    }

    if (filteredCurrentMetrics === currentFetchMetrics) return aggregatedMetrics; // No filtering applied

    // Recalculate aggregated metrics for filtered data
    const sum = filteredCurrentMetrics.reduce(
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
    filteredCurrentMetrics.forEach((metric) => {
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
      averageActiveUsers: Math.round(sum.activeUsers / filteredCurrentMetrics.length),
      totalRevenue: sum.revenue,
      averageConversionRate: Number(
        (sum.conversionRate / filteredCurrentMetrics.length).toFixed(2)
      ),
      averageChurnRate: Number((sum.churnRate / filteredCurrentMetrics.length).toFixed(2)),
      topRegion,
    };
  }, [filteredCurrentMetrics, currentFetchMetrics, aggregatedMetrics]);

  // Filter history for Historical Data table (by date and region)
  const filteredHistory = useMemo(() => {
    if (!history || history.length === 0) return history;

    const hasDateFilter = filters.dateRange.from || filters.dateRange.to;
    const hasRegionFilter = filters.regions.length > 0;

    if (!hasDateFilter && !hasRegionFilter) return history;

    return history.filter((metric) => {
      // Date filter
      let matchesDate = true;
      if (hasDateFilter) {
        const metricDate = new Date(metric.timestamp).getTime();
        const fromTime = filters.dateRange.from ? new Date(filters.dateRange.from).getTime() : 0;
        const toTime = filters.dateRange.to
          ? new Date(filters.dateRange.to).setHours(23, 59, 59, 999)
          : Infinity;
        matchesDate = metricDate >= fromTime && metricDate <= toTime;
      }

      // Region filter
      let matchesRegion = true;
      if (hasRegionFilter) {
        // Check if any of the metric's regions match selected regions
        matchesRegion = metric.regions.some((region) => filters.regions.includes(region.name));
      }

      return matchesDate && matchesRegion;
    });
  }, [history, filters]);

  // Loading state
  if (isLoading && !latestMetrics) {
    return <LoadingState />;
  }

  // Error state
  if (isError && !latestMetrics) {
    return <ErrorState error={error} onRetry={refresh} />;
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-dark-bg-primary">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <DashboardHeader
          lastUpdated={latestMetrics?.timestamp}
          autoRefreshEnabled={autoRefreshEnabled}
          isValidating={isValidating}
          onToggleAutoRefresh={handleToggleAutoRefresh}
          onRefresh={refresh}
          onExport={handleExport}
        />

        <AlertList alerts={alerts} />

        {/* Filters section */}
        <div className="mb-6">
          <DashboardFilters
            onFilterChange={handleFilterChange}
            availableRegions={availableRegions}
          />
        </div>

        <div className="mb-8">
          <KPIGrid
            currentMetrics={filteredLatestMetrics}
            previousMetrics={filteredPreviousMetrics}
            isLoading={isValidating}
          />
        </div>

        <ChartsSection
          metrics={filteredCurrentMetrics || []}
          latestMetrics={filteredLatestMetrics}
          aggregatedMetrics={filteredAggregatedMetrics}
          isValidating={isValidating}
          onRefresh={refresh}
        />

        {/* Historical data section */}
        <div className="mt-8">
          <HistoricalData metrics={filteredHistory || []} onClearHistory={clearHistory} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
