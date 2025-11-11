import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { AlertList } from '../AlertList';
import type { ThresholdAlert } from '@/types/alerts';

describe('AlertList', () => {
  const mockAlerts: ThresholdAlert[] = [
    {
      id: 'alert-1',
      metric: 'churnRate',
      value: 6.5,
      threshold: 5,
      level: 'warning',
      message: 'Churn rate is above acceptable threshold',
    },
    {
      id: 'alert-2',
      metric: 'conversionRate',
      value: 1.5,
      threshold: 2,
      level: 'critical',
      message: 'Conversion rate needs attention',
    },
  ];

  it('should render alert list with multiple alerts', () => {
    render(<AlertList alerts={mockAlerts} />);

    expect(screen.getByText('Churn rate is above acceptable threshold')).toBeInTheDocument();
    expect(screen.getByText('Conversion rate needs attention')).toBeInTheDocument();
  });

  it('should return null when alerts array is empty', () => {
    const { container } = render(<AlertList alerts={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render alerts with proper styling classes', () => {
    const { container } = render(<AlertList alerts={mockAlerts} />);
    const alertContainer = container.querySelector('.mb-6.space-y-2');
    expect(alertContainer).toBeInTheDocument();
  });
});
