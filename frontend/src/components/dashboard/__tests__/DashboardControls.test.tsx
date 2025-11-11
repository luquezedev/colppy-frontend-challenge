import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import { DashboardControls } from '../DashboardControls';

describe('DashboardControls', () => {
  const defaultProps = {
    autoRefreshEnabled: false,
    isValidating: false,
    onToggleAutoRefresh: vi.fn(),
    onRefresh: vi.fn(),
    onExport: vi.fn(),
  };

  it('should render auto-refresh toggle', () => {
    render(<DashboardControls {...defaultProps} />);

    const toggle = screen.getByRole('switch');
    expect(toggle).toBeInTheDocument();
  });

  it('should show OFF when auto-refresh is disabled', () => {
    render(<DashboardControls {...defaultProps} autoRefreshEnabled={false} />);

    expect(screen.getByText('OFF')).toBeInTheDocument();
  });

  it('should show ON when auto-refresh is enabled', () => {
    render(<DashboardControls {...defaultProps} autoRefreshEnabled={true} />);

    expect(screen.getByText('ON')).toBeInTheDocument();
  });

  it('should call onToggleAutoRefresh when toggle is clicked', () => {
    const onToggle = vi.fn();
    render(<DashboardControls {...defaultProps} onToggleAutoRefresh={onToggle} />);

    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('should render refresh button', () => {
    render(<DashboardControls {...defaultProps} />);

    const refreshButton = screen.getByLabelText('Refresh');
    expect(refreshButton).toBeInTheDocument();
  });

  it('should call onRefresh when refresh button is clicked', () => {
    const onRefresh = vi.fn();
    render(<DashboardControls {...defaultProps} onRefresh={onRefresh} />);

    const refreshButton = screen.getByLabelText('Refresh');
    fireEvent.click(refreshButton);

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('should disable refresh button when validating', () => {
    render(<DashboardControls {...defaultProps} isValidating={true} />);

    const refreshButton = screen.getByLabelText('Refresh');
    expect(refreshButton).toBeDisabled();
  });

  it('should render export button', () => {
    render(<DashboardControls {...defaultProps} />);

    const exportButton = screen.getByLabelText('Export');
    expect(exportButton).toBeInTheDocument();
  });

  it('should call onExport when export button is clicked', () => {
    const onExport = vi.fn();
    render(<DashboardControls {...defaultProps} onExport={onExport} />);

    const exportButton = screen.getByLabelText('Export');
    fireEvent.click(exportButton);

    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it('should apply spin animation to refresh icon when validating', () => {
    const { container } = render(<DashboardControls {...defaultProps} isValidating={true} />);

    const refreshIcon = container.querySelector('.animate-spin');
    expect(refreshIcon).toBeInTheDocument();
  });
});
