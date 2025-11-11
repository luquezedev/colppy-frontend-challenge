import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Metrics } from '@/types/metrics';
import type { ThresholdAlert } from '@/types/alerts';

export const useThresholdAlerts = (latestMetrics: Metrics | null): ThresholdAlert[] => {
  const { t } = useTranslation();

  return useMemo<ThresholdAlert[]>(() => {
    if (!latestMetrics) return [];

    const alertList: ThresholdAlert[] = [];

    // Check churn rate threshold
    if (latestMetrics.churnRate > 5) {
      alertList.push({
        id: 'churn-warning',
        metric: 'churnRate',
        value: latestMetrics.churnRate,
        threshold: 5,
        level: latestMetrics.churnRate > 10 ? 'critical' : 'warning',
        message: t('alerts.churnHigh'),
      });
    }

    // Check conversion rate threshold
    if (latestMetrics.conversionRate < 3) {
      alertList.push({
        id: 'conversion-warning',
        metric: 'conversionRate',
        value: latestMetrics.conversionRate,
        threshold: 3,
        level: latestMetrics.conversionRate < 2 ? 'critical' : 'warning',
        message: t('alerts.conversionLow'),
      });
    }

    return alertList;
  }, [latestMetrics, t]);
};
