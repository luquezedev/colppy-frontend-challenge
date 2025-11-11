import { describe, it, expect, vi } from 'vitest';
import { render } from '@/test/utils';
import { TimeSeriesChart } from '../TimeSeriesChart';
import { createMockMetrics } from '@/test/utils';

// Mock Highcharts
vi.mock('highcharts-react-official', () => ({
  default: ({ options }: any) => (
    <div data-testid="highcharts-mock">
      <div data-testid="chart-title">{options?.title?.text}</div>
      <div data-testid="chart-type">{options?.chart?.type}</div>
      <div data-testid="series-count">{options?.series?.length}</div>
    </div>
  ),
}));

vi.mock('highcharts', () => ({
  default: {
    dateFormat: (format: string, timestamp: number) => new Date(timestamp).toISOString(),
  },
}));

describe('TimeSeriesChart', () => {
  const mockData = [
    createMockMetrics({ id: 1, timestamp: '2024-01-01T10:00:00Z' }),
    createMockMetrics({ id: 2, timestamp: '2024-01-01T11:00:00Z' }),
    createMockMetrics({ id: 3, timestamp: '2024-01-01T12:00:00Z' }),
  ];

  it('should render chart', () => {
    const { getByTestId } = render(<TimeSeriesChart data={mockData} />);

    expect(getByTestId('highcharts-mock')).toBeInTheDocument();
  });

  it('should render with correct chart type', () => {
    const { getByTestId } = render(<TimeSeriesChart data={mockData} />);

    expect(getByTestId('chart-type')).toHaveTextContent('line');
  });

  it('should render all series (4 metrics)', () => {
    const { getByTestId } = render(<TimeSeriesChart data={mockData} />);

    expect(getByTestId('series-count')).toHaveTextContent('4');
  });

  it('should handle empty data', () => {
    const { getByTestId } = render(<TimeSeriesChart data={[]} />);

    expect(getByTestId('series-count')).toHaveTextContent('4');
  });

  it('should apply custom height', () => {
    render(<TimeSeriesChart data={mockData} height={500} />);
    // Just testing that it renders without errors
  });

  it('should respect showLegend prop', () => {
    render(<TimeSeriesChart data={mockData} showLegend={false} />);
    // Just testing that it renders without errors
  });

  it('should render with duplicate timestamps (index mode)', () => {
    const duplicateData = [
      createMockMetrics({ id: 1, timestamp: '2024-01-01T10:00:00Z' }),
      createMockMetrics({ id: 2, timestamp: '2024-01-01T10:00:00Z' }),
      createMockMetrics({ id: 3, timestamp: '2024-01-01T10:00:00Z' }),
    ];

    const { getByTestId } = render(<TimeSeriesChart data={duplicateData} />);

    expect(getByTestId('highcharts-mock')).toBeInTheDocument();
  });

  it('should update when data changes', () => {
    const { rerender, getByTestId } = render(<TimeSeriesChart data={mockData} />);

    const newData = [...mockData, createMockMetrics({ id: 4, timestamp: '2024-01-01T13:00:00Z' })];

    rerender(<TimeSeriesChart data={newData} />);

    expect(getByTestId('highcharts-mock')).toBeInTheDocument();
  });

  it('should work with different theme', () => {
    const { getByTestId } = render(<TimeSeriesChart data={mockData} />, { theme: 'dark' });

    expect(getByTestId('highcharts-mock')).toBeInTheDocument();
  });
});
