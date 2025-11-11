import { describe, it, expect, vi } from 'vitest';
import { render } from '@/test/utils';
import App from '../App';

// Mock the Dashboard component
vi.mock('@/components/dashboard', () => ({
  Dashboard: () => <div data-testid="dashboard">Dashboard Component</div>,
}));

describe('App', () => {
  it('should render Dashboard component', () => {
    const { getByTestId } = render(<App />);

    expect(getByTestId('dashboard')).toBeInTheDocument();
  });
});
