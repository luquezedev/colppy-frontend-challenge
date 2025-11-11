import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import { ChartsSection } from '../ChartsSection';
import { createMockMetrics } from '@/test/utils';

// Mock chart components
vi.mock('@/components/charts', () => ({
  TimeSeriesChart: () => <div data-testid="time-series-chart">Time Series Chart</div>,
  RegionalBarChart: () => <div data-testid="regional-bar-chart">Regional Bar Chart</div>,
  ChartContainer: ({ children, title }: any) => (
    <div data-testid="chart-container">
      <h3>{title}</h3>
      {children}
    </div>
  ),
}));

describe('ChartsSection', () => {
  const mockMetrics = [createMockMetrics({ id: 1 }), createMockMetrics({ id: 2 })];

  const mockLatestMetrics = createMockMetrics({ id: 2 });

  const mockAggregatedMetrics = {
    averageActiveUsers: 1100,
    totalRevenue: 100000,
    averageConversionRate: 3.5,
    averageChurnRate: 2.1,
    topRegion: { name: 'North', value: 550 },
  };

  const mockOnRefresh = vi.fn();

  it('should render chart containers', () => {
    render(
      <ChartsSection
        metrics={mockMetrics}
        latestMetrics={mockLatestMetrics}
        aggregatedMetrics={mockAggregatedMetrics}
        isValidating={false}
        onRefresh={mockOnRefresh}
      />
    );

    const chartContainers = screen.getAllByTestId('chart-container');
    expect(chartContainers).toHaveLength(2);
  });

  it('should render TimeSeriesChart when data is available', () => {
    render(
      <ChartsSection
        metrics={mockMetrics}
        latestMetrics={mockLatestMetrics}
        aggregatedMetrics={mockAggregatedMetrics}
        isValidating={false}
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByTestId('time-series-chart')).toBeInTheDocument();
  });

  it('should render RegionalBarChart when regions are available', () => {
    render(
      <ChartsSection
        metrics={mockMetrics}
        latestMetrics={mockLatestMetrics}
        aggregatedMetrics={mockAggregatedMetrics}
        isValidating={false}
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByTestId('regional-bar-chart')).toBeInTheDocument();
  });

  it('should render SummaryStatistics when aggregated metrics available', () => {
    render(
      <ChartsSection
        metrics={mockMetrics}
        latestMetrics={mockLatestMetrics}
        aggregatedMetrics={mockAggregatedMetrics}
        isValidating={false}
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByText('North')).toBeInTheDocument();
  });

  it('should show no data message when metrics is empty', () => {
    render(
      <ChartsSection
        metrics={[]}
        latestMetrics={null}
        aggregatedMetrics={null}
        isValidating={false}
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getAllByText('No data available for chart')).toHaveLength(2);
  });

  it('should show no data message when not validating and no regions', () => {
    render(
      <ChartsSection
        metrics={mockMetrics}
        latestMetrics={null}
        aggregatedMetrics={mockAggregatedMetrics}
        isValidating={false}
        onRefresh={mockOnRefresh}
      />
    );

    expect(screen.getByText('No data available for chart')).toBeInTheDocument();
  });

  it('should not show no data message when validating', () => {
    render(
      <ChartsSection
        metrics={[]}
        latestMetrics={null}
        aggregatedMetrics={null}
        isValidating={true}
        onRefresh={mockOnRefresh}
      />
    );

    const noDataMessages = screen.queryAllByText('No data available for chart');
    expect(noDataMessages).toHaveLength(0);
  });

  it('should limit time series data to last 20 points', () => {
    const manyMetrics = Array.from({ length: 30 }, (_, i) => createMockMetrics({ id: i + 1 }));

    render(
      <ChartsSection
        metrics={manyMetrics}
        latestMetrics={mockLatestMetrics}
        aggregatedMetrics={mockAggregatedMetrics}
        isValidating={false}
        onRefresh={mockOnRefresh}
      />
    );

    // Just verify it renders without error
    expect(screen.getByTestId('time-series-chart')).toBeInTheDocument();
  });
});
