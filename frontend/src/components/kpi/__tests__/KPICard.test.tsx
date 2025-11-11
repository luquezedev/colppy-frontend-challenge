import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import { KPICard } from '../KPICard';

describe('KPICard', () => {
  const defaultProps = {
    title: 'activeUsers',
    value: 1234,
  };

  it('should render the KPI card with title and value', () => {
    render(<KPICard {...defaultProps} />);

    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('should format currency values correctly', () => {
    render(<KPICard title="revenue" value={98765} format="currency" />);

    const currencyText = screen.getByText(/\$98,765/);
    expect(currencyText).toBeInTheDocument();
  });

  it('should format percentage values correctly', () => {
    render(<KPICard title="churnRate" value={5.5} format="percentage" />);

    expect(screen.getByText('5.5%')).toBeInTheDocument();
  });

  it('should display trend information when provided', () => {
    const trend = {
      direction: 'up' as const,
      percentage: 10.5,
      isPositive: true,
    };

    render(<KPICard {...defaultProps} trend={trend} />);

    expect(screen.getByText(/10.5%/)).toBeInTheDocument();
    expect(screen.getByText('vs last period')).toBeInTheDocument();
  });

  it('should show warning alert when threshold is exceeded', () => {
    const threshold = {
      metric: 'churnRate' as const,
      warning: 5,
      critical: 10,
      comparison: 'above' as const,
    };

    render(<KPICard title="churnRate" value={7} threshold={threshold} />);

    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('should show critical alert when critical threshold is exceeded', () => {
    const threshold = {
      metric: 'churnRate' as const,
      warning: 5,
      critical: 10,
      comparison: 'above' as const,
    };

    render(<KPICard title="churnRate" value={12} threshold={threshold} />);

    expect(screen.getByText('Critical level reached')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<KPICard {...defaultProps} onClick={handleClick} />);

    const card = screen.getByRole('button');
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should handle keyboard events for accessibility', () => {
    const handleClick = vi.fn();
    render(<KPICard {...defaultProps} onClick={handleClick} />);

    const card = screen.getByRole('button');

    // Test Enter key
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Test Space key
    fireEvent.keyDown(card, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);

    // Test other keys (should not trigger)
    fireEvent.keyDown(card, { key: 'Escape' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('should show loading state', () => {
    const { container } = render(<KPICard {...defaultProps} isLoading={true} />);

    const loadingElements = container.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('should apply custom className', () => {
    const { container } = render(<KPICard {...defaultProps} className="custom-class" />);

    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });

  it('should handle null and undefined values gracefully', () => {
    render(<KPICard title="metric" value={null as any} />);
    expect(screen.getByText('—')).toBeInTheDocument();

    render(<KPICard title="metric" value={undefined as any} />);
    expect(screen.getAllByText('—')).toHaveLength(2);
  });

  it('should correctly determine threshold status for below comparison', () => {
    const threshold = {
      metric: 'conversionRate' as const,
      warning: 3,
      critical: 2,
      comparison: 'below' as const,
    };

    // Value below warning threshold
    const { rerender } = render(
      <KPICard title="conversionRate" value={2.5} threshold={threshold} />
    );
    expect(screen.getByText('Warning')).toBeInTheDocument();

    // Value below critical threshold
    rerender(<KPICard title="conversionRate" value={1.5} threshold={threshold} />);
    expect(screen.getByText('Critical level reached')).toBeInTheDocument();

    // Value above thresholds (normal)
    rerender(<KPICard title="conversionRate" value={4} threshold={threshold} />);
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('should show downward trend correctly', () => {
    const trend = {
      direction: 'down' as const,
      percentage: 15.2,
      isPositive: false,
    };

    render(<KPICard {...defaultProps} trend={trend} />);

    expect(screen.getByText(/-15.2%/)).toBeInTheDocument();
  });

  it('should show stable trend correctly', () => {
    const trend = {
      direction: 'stable' as const,
      percentage: 0,
      isPositive: true,
    };

    render(<KPICard {...defaultProps} trend={trend} />);

    // Should still show the percentage and vs last period text
    expect(screen.getByText('0.0%')).toBeInTheDocument();
    expect(screen.getByText('vs last period')).toBeInTheDocument();
  });
});
