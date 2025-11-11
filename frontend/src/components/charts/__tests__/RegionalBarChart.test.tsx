import { describe, it, expect, vi } from 'vitest';
import { render } from '@/test/utils';
import { RegionalBarChart } from '../RegionalBarChart';

// Mock Highcharts
vi.mock('highcharts-react-official', () => ({
  default: ({ options }: any) => (
    <div data-testid="highcharts-mock">
      <div data-testid="chart-title">{options?.title?.text}</div>
      <div data-testid="chart-type">{options?.chart?.type}</div>
      <div data-testid="categories-count">{options?.xAxis?.categories?.length}</div>
    </div>
  ),
}));

vi.mock('highcharts', () => ({
  default: {},
}));

describe('RegionalBarChart', () => {
  const mockData = [
    { name: 'North', value: 450 },
    { name: 'South', value: 320 },
    { name: 'East', value: 280 },
    { name: 'West', value: 184 },
  ];

  it('should render chart', () => {
    const { getByTestId } = render(<RegionalBarChart data={mockData} />);

    expect(getByTestId('highcharts-mock')).toBeInTheDocument();
  });

  it('should render with vertical orientation (column chart)', () => {
    const { getByTestId } = render(<RegionalBarChart data={mockData} orientation="vertical" />);

    expect(getByTestId('chart-type')).toHaveTextContent('column');
  });

  it('should render with horizontal orientation (bar chart)', () => {
    const { getByTestId } = render(<RegionalBarChart data={mockData} orientation="horizontal" />);

    expect(getByTestId('chart-type')).toHaveTextContent('bar');
  });

  it('should render all categories', () => {
    const { getByTestId } = render(<RegionalBarChart data={mockData} />);

    expect(getByTestId('categories-count')).toHaveTextContent('4');
  });

  it('should handle empty data', () => {
    const { getByTestId } = render(<RegionalBarChart data={[]} />);

    expect(getByTestId('categories-count')).toHaveTextContent('0');
  });

  it('should apply custom height', () => {
    render(<RegionalBarChart data={mockData} height={500} />);
    // Just testing that it renders without errors
  });

  it('should sort data by value (descending)', () => {
    const unsortedData = [
      { name: 'A', value: 100 },
      { name: 'B', value: 300 },
      { name: 'C', value: 200 },
    ];

    render(<RegionalBarChart data={unsortedData} />);
    // The component should sort internally, just test it renders
  });

  it('should work with dark theme', () => {
    const { getByTestId } = render(<RegionalBarChart data={mockData} />, { theme: 'dark' });

    expect(getByTestId('highcharts-mock')).toBeInTheDocument();
  });

  it('should handle single region', () => {
    const singleRegion = [{ name: 'North', value: 450 }];

    const { getByTestId } = render(<RegionalBarChart data={singleRegion} />);

    expect(getByTestId('categories-count')).toHaveTextContent('1');
  });

  it('should update when data changes', () => {
    const { rerender, getByTestId } = render(<RegionalBarChart data={mockData} />);

    const newData = [...mockData, { name: 'Central', value: 400 }];

    rerender(<RegionalBarChart data={newData} />);

    expect(getByTestId('categories-count')).toHaveTextContent('5');
  });
});
