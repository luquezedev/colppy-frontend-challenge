import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import { DashboardHeader } from '../DashboardHeader';

describe('DashboardHeader', () => {
  const defaultProps = {
    autoRefreshEnabled: false,
    isValidating: false,
    onToggleAutoRefresh: vi.fn(),
    onRefresh: vi.fn(),
    onExport: vi.fn(),
  };

  it('should render dashboard subtitle', () => {
    render(<DashboardHeader {...defaultProps} />);

    expect(screen.getByText('Real-time Performance Monitoring')).toBeInTheDocument();
  });

  it('should render last updated time when provided', () => {
    const lastUpdated = '2024-01-01T12:00:00Z';
    render(<DashboardHeader {...defaultProps} lastUpdated={lastUpdated} />);

    const lastUpdatedText = screen.getByText(/Last updated:/);
    expect(lastUpdatedText).toBeInTheDocument();
  });

  it('should not render last updated when not provided', () => {
    render(<DashboardHeader {...defaultProps} />);

    const lastUpdatedText = screen.queryByText(/Last updated:/);
    expect(lastUpdatedText).not.toBeInTheDocument();
  });

  it('should render DashboardControls with correct props', () => {
    render(<DashboardHeader {...defaultProps} autoRefreshEnabled={true} />);

    // Check that the toggle shows ON
    expect(screen.getByText('ON')).toBeInTheDocument();
  });

  it('should pass through callback props to DashboardControls', () => {
    const onToggle = vi.fn();
    const onRefresh = vi.fn();
    const onExport = vi.fn();

    render(
      <DashboardHeader
        {...defaultProps}
        onToggleAutoRefresh={onToggle}
        onRefresh={onRefresh}
        onExport={onExport}
      />
    );

    // The controls are rendered (tested by checking for buttons)
    expect(screen.getByLabelText('Refresh')).toBeInTheDocument();
    expect(screen.getByLabelText('Export')).toBeInTheDocument();
  });
});
