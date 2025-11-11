import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { LoadingState } from '../LoadingState';

describe('LoadingState', () => {
  it('should render loading message', () => {
    render(<LoadingState />);

    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('should render spinner', () => {
    const { container } = render(<LoadingState />);

    const spinner = container.querySelector('.spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('should apply correct dark mode classes', () => {
    const { container } = render(<LoadingState />, { theme: 'dark' });

    const mainDiv = container.querySelector('.dark\\:bg-dark-bg-primary');
    expect(mainDiv).toBeInTheDocument();
  });
});
