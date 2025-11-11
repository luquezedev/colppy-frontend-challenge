import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { SummaryStatistics } from '../SummaryStatistics';

describe('SummaryStatistics', () => {
  const mockAggregatedMetrics = {
    averageActiveUsers: 1234,
    totalRevenue: 98765,
    averageConversionRate: 3.5,
    averageChurnRate: 2.1,
    topRegion: { name: 'North', value: 550 },
  };

  it('should render all statistics', () => {
    render(<SummaryStatistics aggregatedMetrics={mockAggregatedMetrics} />);

    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('$98,765')).toBeInTheDocument();
    expect(screen.getByText('3.5%')).toBeInTheDocument();
    expect(screen.getByText('2.1%')).toBeInTheDocument();
    expect(screen.getByText('North')).toBeInTheDocument();
  });

  it('should render fallback when topRegion is null', () => {
    const metricsWithoutRegion = {
      ...mockAggregatedMetrics,
      topRegion: null,
    };

    render(<SummaryStatistics aggregatedMetrics={metricsWithoutRegion} />);

    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('should format large numbers with commas', () => {
    const largeMetrics = {
      averageActiveUsers: 1234567,
      totalRevenue: 9876543,
      averageConversionRate: 3.5,
      averageChurnRate: 2.1,
      topRegion: { name: 'North', value: 550 },
    };

    render(<SummaryStatistics aggregatedMetrics={largeMetrics} />);

    expect(screen.getByText('1,234,567')).toBeInTheDocument();
    expect(screen.getByText('$9,876,543')).toBeInTheDocument();
  });

  it('should handle zero values', () => {
    const zeroMetrics = {
      averageActiveUsers: 0,
      totalRevenue: 0,
      averageConversionRate: 0,
      averageChurnRate: 0,
      topRegion: null,
    };

    render(<SummaryStatistics aggregatedMetrics={zeroMetrics} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('$0')).toBeInTheDocument();
  });
});
