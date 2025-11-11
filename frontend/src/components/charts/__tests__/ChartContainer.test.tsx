import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import { ChartContainer } from '../ChartContainer';

describe('ChartContainer', () => {
  it('should render children', () => {
    render(
      <ChartContainer>
        <div data-testid="chart-content">Chart Content</div>
      </ChartContainer>
    );

    expect(screen.getByTestId('chart-content')).toBeInTheDocument();
  });

  it('should render title when provided', () => {
    render(
      <ChartContainer title="Test Chart">
        <div>Content</div>
      </ChartContainer>
    );

    expect(screen.getByText('Test Chart')).toBeInTheDocument();
  });

  it('should show loading overlay when isLoading is true', () => {
    render(
      <ChartContainer isLoading={true}>
        <div>Content</div>
      </ChartContainer>
    );

    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('should show error state when error is provided', () => {
    const error = new Error('Test error message');

    render(
      <ChartContainer error={error}>
        <div>Content</div>
      </ChartContainer>
    );

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('should show generic error message when error has no message', () => {
    const error = new Error();

    render(
      <ChartContainer error={error}>
        <div>Content</div>
      </ChartContainer>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should render refresh button when onRefresh is provided', () => {
    const onRefresh = vi.fn();

    render(
      <ChartContainer onRefresh={onRefresh}>
        <div>Content</div>
      </ChartContainer>
    );

    const refreshButton = screen.getByLabelText('Click to refresh data');
    expect(refreshButton).toBeInTheDocument();
  });

  it('should call onRefresh when refresh button is clicked', () => {
    const onRefresh = vi.fn();

    render(
      <ChartContainer onRefresh={onRefresh}>
        <div>Content</div>
      </ChartContainer>
    );

    const refreshButton = screen.getByLabelText('Click to refresh data');
    fireEvent.click(refreshButton);

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('should hide refresh button when loading', () => {
    const onRefresh = vi.fn();

    render(
      <ChartContainer onRefresh={onRefresh} isLoading={true}>
        <div>Content</div>
      </ChartContainer>
    );

    const refreshButton = screen.queryByLabelText('Click to refresh data');
    expect(refreshButton).not.toBeInTheDocument();
  });

  it('should render retry button in error state', () => {
    const onRefresh = vi.fn();
    const error = new Error('Test error');

    render(
      <ChartContainer error={error} onRefresh={onRefresh}>
        <div>Content</div>
      </ChartContainer>
    );

    const retryButton = screen.getByText('Retry');
    expect(retryButton).toBeInTheDocument();
  });

  it('should call onRefresh when retry button is clicked', () => {
    const onRefresh = vi.fn();
    const error = new Error('Test error');

    render(
      <ChartContainer error={error} onRefresh={onRefresh}>
        <div>Content</div>
      </ChartContainer>
    );

    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('should not render children when error is present', () => {
    const error = new Error('Test error');

    render(
      <ChartContainer error={error}>
        <div data-testid="chart-content">Content</div>
      </ChartContainer>
    );

    expect(screen.queryByTestId('chart-content')).not.toBeInTheDocument();
  });

  it('should render custom actions', () => {
    render(
      <ChartContainer actions={<button data-testid="custom-action">Custom Action</button>}>
        <div>Content</div>
      </ChartContainer>
    );

    expect(screen.getByTestId('custom-action')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ChartContainer className="custom-class">
        <div>Content</div>
      </ChartContainer>
    );

    const chartContainer = container.querySelector('.custom-class');
    expect(chartContainer).toBeInTheDocument();
  });

  it('should apply animate-pulse class when loading', () => {
    const { container } = render(
      <ChartContainer isLoading={true}>
        <div>Content</div>
      </ChartContainer>
    );

    const chartContainer = container.querySelector('.animate-pulse');
    expect(chartContainer).toBeInTheDocument();
  });
});
