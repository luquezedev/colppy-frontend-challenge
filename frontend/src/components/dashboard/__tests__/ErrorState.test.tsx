import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import { ErrorState } from '../ErrorState';

describe('ErrorState', () => {
  it('should render error message', () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);

    expect(screen.getByText('Error loading dashboard')).toBeInTheDocument();
  });

  it('should render custom error message from error object', () => {
    const onRetry = vi.fn();
    const error = new Error('Custom error message');

    render(<ErrorState error={error} onRetry={onRetry} />);

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should render retry button', () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);

    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);

    const retryButton = screen.getByText('Retry');
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should render fallback message when error has no message', () => {
    const onRetry = vi.fn();
    render(<ErrorState error={null} onRetry={onRetry} />);

    expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
  });
});
