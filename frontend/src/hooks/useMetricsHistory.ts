import { useEffect } from 'react';
import { useMetricsHistoryContext } from '@/contexts/MetricsHistoryContext';
import type { Metrics } from '@/types/metrics';

export function useMetricsHistory(currentMetrics: Metrics[]) {
  const { history, addMetrics, clearHistory } = useMetricsHistoryContext();

  // Add ALL new metrics to history when they arrive
  useEffect(() => {
    if (!currentMetrics || currentMetrics.length === 0) return;
    addMetrics(currentMetrics);
  }, [currentMetrics, addMetrics]);

  return { history, clearHistory };
}
