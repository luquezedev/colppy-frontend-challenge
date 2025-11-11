import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { AlertBanner } from '../AlertBanner';
import type { ThresholdAlert } from '@/types/alerts';

describe('AlertBanner', () => {
  const warningAlert: ThresholdAlert = {
    id: 'warning-1',
    metric: 'churnRate',
    value: 6.5,
    threshold: 5,
    level: 'warning',
    message: 'Churn rate is high',
  };

  const criticalAlert: ThresholdAlert = {
    id: 'critical-1',
    metric: 'conversionRate',
    value: 1.2,
    threshold: 2,
    level: 'critical',
    message: 'Conversion rate is critical',
  };

  it('should render warning alert', () => {
    render(<AlertBanner alert={warningAlert} />);

    expect(screen.getByText('Churn rate is high')).toBeInTheDocument();
    expect(screen.getByText(/Churn Rate: 6.5%/)).toBeInTheDocument();
  });

  it('should render critical alert', () => {
    render(<AlertBanner alert={criticalAlert} />);

    expect(screen.getByText('Conversion rate is critical')).toBeInTheDocument();
    expect(screen.getByText(/Conversion Rate: 1.2%/)).toBeInTheDocument();
  });

  it('should apply warning class for warning level', () => {
    const { container } = render(<AlertBanner alert={warningAlert} />);
    const alertElement = container.querySelector('.alert-warning');
    expect(alertElement).toBeInTheDocument();
  });

  it('should apply danger class for critical level', () => {
    const { container } = render(<AlertBanner alert={criticalAlert} />);
    const alertElement = container.querySelector('.alert-danger');
    expect(alertElement).toBeInTheDocument();
  });
});
