import { useTranslation } from 'react-i18next';
import { TimeSeriesChart, RegionalBarChart, ChartContainer } from '@/components/charts';
import { SummaryStatistics } from './SummaryStatistics';
import type { Metrics, AggregatedMetrics } from '@/types/metrics';

interface ChartsSectionProps {
  metrics: Metrics[];
  latestMetrics: Metrics | null;
  aggregatedMetrics: AggregatedMetrics | null;
  isValidating: boolean;
  onRefresh: () => void;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  metrics,
  latestMetrics,
  aggregatedMetrics,
  isValidating,
  onRefresh,
}) => {
  const { t } = useTranslation();

  return (
    <div className="chart-grid">
      {/* Time series chart - Full width on desktop */}
      <ChartContainer
        title={t('chart.timeEvolution')}
        isLoading={isValidating}
        error={null}
        onRefresh={onRefresh}
        className="lg:col-span-2"
      >
        {metrics && metrics.length > 0 && (
          <TimeSeriesChart
            data={metrics.slice(-20)} // Show last 20 data points
            height={400}
          />
        )}
        {(!metrics || metrics.length === 0) && !isValidating && (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 dark:text-dark-text-tertiary">{t('chart.noData')}</p>
          </div>
        )}
      </ChartContainer>

      {/* Regional bar chart - Left side on desktop */}
      <ChartContainer
        title={t('regions.title')}
        isLoading={isValidating}
        error={null}
        onRefresh={onRefresh}
      >
        {latestMetrics?.regions && (
          <RegionalBarChart data={latestMetrics.regions} height={400} orientation="vertical" />
        )}
        {!latestMetrics?.regions && !isValidating && (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 dark:text-dark-text-tertiary">{t('chart.noData')}</p>
          </div>
        )}
      </ChartContainer>

      {/* Summary Statistics - Right side on desktop */}
      {aggregatedMetrics && <SummaryStatistics aggregatedMetrics={aggregatedMetrics} />}
    </div>
  );
};
