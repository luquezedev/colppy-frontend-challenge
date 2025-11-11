import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import Dashboard from '../Dashboard';
import { createMockMetrics } from '@/test/utils';
import * as useSWRMetricsModule from '@/hooks/useSWRMetrics';
import * as useThresholdAlertsModule from '@/hooks/useThresholdAlerts';

// Mock chart components to avoid Highcharts issues
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

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('Dashboard', () => {
  const mockMetrics = [
    createMockMetrics({ id: 1, activeUsers: 1000 }),
    createMockMetrics({ id: 2, activeUsers: 1200 }),
  ];

  const mockAggregatedMetrics = {
    averageActiveUsers: 1100,
    totalRevenue: 100000,
    averageConversionRate: 3.5,
    averageChurnRate: 2.1,
    topRegion: { name: 'North', value: 550 },
  };

  const mockRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(useSWRMetricsModule, 'useSWRMetrics').mockReturnValue({
      metrics: mockMetrics,
      latestMetrics: mockMetrics[1] ?? null,
      aggregatedMetrics: mockAggregatedMetrics,
      isLoading: false,
      isError: false,
      error: null,
      isValidating: false,
      refresh: mockRefresh,
    });

    vi.spyOn(useThresholdAlertsModule, 'useThresholdAlerts').mockReturnValue([]);
  });

  it('should render LoadingState when loading', () => {
    vi.spyOn(useSWRMetricsModule, 'useSWRMetrics').mockReturnValue({
      metrics: [],
      latestMetrics: null,
      aggregatedMetrics: {
        averageActiveUsers: 0,
        totalRevenue: 0,
        averageConversionRate: 0,
        averageChurnRate: 0,
        topRegion: null,
      },
      isLoading: true,
      isError: false,
      error: null,
      isValidating: false,
      refresh: vi.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('should render ErrorState when error occurs', () => {
    const error = new Error('Failed to fetch');

    vi.spyOn(useSWRMetricsModule, 'useSWRMetrics').mockReturnValue({
      metrics: [],
      latestMetrics: null,
      aggregatedMetrics: {
        averageActiveUsers: 0,
        totalRevenue: 0,
        averageConversionRate: 0,
        averageChurnRate: 0,
        topRegion: null,
      },
      isLoading: false,
      isError: true,
      error,
      isValidating: false,
      refresh: vi.fn(),
    });

    render(<Dashboard />);

    expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
  });

  it('should render dashboard with metrics', () => {
    render(<Dashboard />);

    expect(screen.getByText('Real-time Performance Monitoring')).toBeInTheDocument();
  });

  it('should render KPI grid', () => {
    render(<Dashboard />);

    // KPIs should be rendered
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });

  it('should render chart section', () => {
    render(<Dashboard />);

    // Charts should be rendered
    expect(screen.getAllByTestId('chart-container')).toHaveLength(2);
  });

  it('should display auto-refresh toggle', () => {
    render(<Dashboard />);

    const toggle = screen.getByRole('switch');
    expect(toggle).toBeInTheDocument();
  });
});
