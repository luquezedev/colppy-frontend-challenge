import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import { KPIGrid } from '../KPIGrid';
import { createMockMetrics } from '@/test/utils';

describe('KPIGrid', () => {
  const currentMetrics = createMockMetrics({
    activeUsers: 5000,
    revenue: 150000,
    churnRate: 3.5,
    conversionRate: 4.2,
  });

  const previousMetrics = createMockMetrics({
    activeUsers: 4500,
    revenue: 140000,
    churnRate: 4.0,
    conversionRate: 3.8,
  });

  it('should render all 4 KPI cards', () => {
    render(<KPIGrid currentMetrics={currentMetrics} previousMetrics={previousMetrics} />);

    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Churn Rate')).toBeInTheDocument();
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
  });

  it('should display current metric values', () => {
    render(<KPIGrid currentMetrics={currentMetrics} previousMetrics={previousMetrics} />);

    expect(screen.getByText('5,000')).toBeInTheDocument();
    expect(screen.getByText(/\$150,000/)).toBeInTheDocument();
    expect(screen.getByText('3.5%')).toBeInTheDocument();
    expect(screen.getByText('4.2%')).toBeInTheDocument();
  });

  it('should calculate and display trends', () => {
    render(<KPIGrid currentMetrics={currentMetrics} previousMetrics={previousMetrics} />);

    // Active Users increased from 4500 to 5000 (11.11% increase)
    expect(screen.getByText(/11.1%/)).toBeInTheDocument();
  });

  it('should render loading state when isLoading is true', () => {
    const { container } = render(
      <KPIGrid currentMetrics={null} previousMetrics={null} isLoading={true} />
    );

    const loadingElements = container.querySelectorAll('.animate-pulse');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('should render skeleton data when no currentMetrics', () => {
    render(<KPIGrid currentMetrics={null} previousMetrics={null} />);

    // Should still render the 4 cards with skeleton data
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });

  it('should call onCardClick when card is clicked', () => {
    const handleClick = vi.fn();
    render(
      <KPIGrid
        currentMetrics={currentMetrics}
        previousMetrics={previousMetrics}
        onCardClick={handleClick}
      />
    );

    // Get all buttons (KPI cards)
    const cards = screen.getAllByRole('button');
    fireEvent.click(cards[0]!);

    expect(handleClick).toHaveBeenCalledWith('activeUsers');
  });

  it('should not add click handler when onCardClick is not provided', () => {
    const { container } = render(
      <KPIGrid currentMetrics={currentMetrics} previousMetrics={previousMetrics} />
    );

    // Cards should not have role="button" when not clickable
    const buttons = container.querySelectorAll('[role="button"]');
    expect(buttons.length).toBe(0);
  });

  it('should display threshold alerts for churn rate', () => {
    const highChurnMetrics = createMockMetrics({
      churnRate: 6.5, // Above warning threshold (5)
    });

    render(<KPIGrid currentMetrics={highChurnMetrics} previousMetrics={previousMetrics} />);

    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('should display threshold alerts for conversion rate', () => {
    const lowConversionMetrics = createMockMetrics({
      conversionRate: 2.5, // Below warning threshold (3)
    });

    render(<KPIGrid currentMetrics={lowConversionMetrics} previousMetrics={previousMetrics} />);

    expect(screen.getByText('Warning')).toBeInTheDocument();
  });
});
