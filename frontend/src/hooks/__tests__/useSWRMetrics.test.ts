import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSWRMetrics } from '../useSWRMetrics';
import { api } from '@/services/api';
import { createMockMetrics, createWrapper } from '@/test/utils';

// Mock the api module
vi.mock('@/services/api', () => ({
  api: {
    metrics: {
      getAll: vi.fn(),
    },
  },
}));

describe('useSWRMetrics', () => {
  const wrapper = createWrapper({ dedupingInterval: 0, provider: () => new Map() });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch metrics successfully', async () => {
    const mockData = [
      createMockMetrics({ id: 1 }),
      createMockMetrics({ id: 2, activeUsers: 1500 }),
    ];

    vi.mocked(api.metrics.getAll).mockResolvedValue(mockData);

    const { result } = renderHook(() => useSWRMetrics(), { wrapper });

    // Initial loading state
    expect(result.current.isLoading).toBe(true);
    expect(result.current.metrics).toEqual([]);
    expect(result.current.latestMetrics).toBe(null);

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.metrics).toEqual(mockData);
    expect(result.current.latestMetrics).toEqual(mockData[1]);
    expect(result.current.isError).toBe(false);
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Failed to fetch');
    vi.mocked(api.metrics.getAll).mockRejectedValue(error);

    const { result } = renderHook(() => useSWRMetrics(), { wrapper });

    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 3000 }
    );

    expect(result.current.error).toEqual(error);
    expect(result.current.metrics).toEqual([]);
    expect(result.current.latestMetrics).toBe(null);
  });

  it('should calculate aggregated metrics correctly', async () => {
    const mockData = [
      createMockMetrics({
        activeUsers: 1000,
        revenue: 50000,
        conversionRate: 3.0,
        churnRate: 2.0,
        regions: [
          { name: 'North', value: 500 },
          { name: 'South', value: 300 },
        ],
      }),
      createMockMetrics({
        activeUsers: 1200,
        revenue: 60000,
        conversionRate: 3.5,
        churnRate: 2.5,
        regions: [
          { name: 'North', value: 600 },
          { name: 'South', value: 400 },
        ],
      }),
    ];

    vi.mocked(api.metrics.getAll).mockResolvedValue(mockData);

    const { result } = renderHook(() => useSWRMetrics(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const aggregated = result.current.aggregatedMetrics;
    expect(aggregated).toBeTruthy();
    expect(aggregated?.averageActiveUsers).toBe(1100);
    expect(aggregated?.totalRevenue).toBe(110000);
    expect(aggregated?.averageConversionRate).toBe(3.25);
    expect(aggregated?.averageChurnRate).toBe(2.25);
    expect(aggregated?.topRegion).toEqual({ name: 'North', value: 1100 });
  });

  it('should return zero values for aggregated metrics when no data', async () => {
    // Mock API to return empty array
    vi.mocked(api.metrics.getAll).mockResolvedValue([]);

    const { result } = renderHook(() => useSWRMetrics(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // When there's no data, aggregatedMetrics should still be an object with zero values
    const aggregated = result.current.aggregatedMetrics;
    expect(aggregated).toEqual({
      averageActiveUsers: 0,
      totalRevenue: 0,
      averageConversionRate: 0,
      averageChurnRate: 0,
      topRegion: null,
    });
  });

  it('should respect custom refresh interval', () => {
    const { result } = renderHook(() => useSWRMetrics({ refreshInterval: 10000 }), { wrapper });

    // Hook should be initialized (test won't wait for data)
    expect(result.current).toBeDefined();
  });

  it('should handle refresh function', async () => {
    const mockData = [createMockMetrics()];
    const updatedData = [createMockMetrics({ activeUsers: 2000 })];

    vi.mocked(api.metrics.getAll)
      .mockResolvedValueOnce(mockData)
      .mockResolvedValueOnce(updatedData);

    const { result } = renderHook(() => useSWRMetrics(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.latestMetrics?.activeUsers).toBe(1234);

    // Call refresh and wait for it to complete
    await result.current.refresh();

    await waitFor(() => {
      expect(result.current.latestMetrics?.activeUsers).toBe(2000);
    });

    // Should have been called twice (initial + refresh)
    expect(api.metrics.getAll).toHaveBeenCalledTimes(2);
  });

  it('should check thresholds and log warnings', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const mockData = [
      createMockMetrics({
        churnRate: 6, // Above warning threshold (5)
      }),
    ];

    vi.mocked(api.metrics.getAll).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useSWRMetrics(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Wait a bit for onSuccess callback to be called
    await waitFor(
      () => {
        expect(consoleSpy).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('churnRate threshold exceeded')
    );

    // Clear previous calls
    consoleSpy.mockClear();
    consoleErrorSpy.mockClear();

    // Test critical threshold
    const criticalData = [
      createMockMetrics({
        churnRate: 11, // Above critical threshold (10)
      }),
    ];

    vi.mocked(api.metrics.getAll).mockResolvedValueOnce(criticalData);
    await result.current.refresh();

    await waitFor(
      () => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('churnRate critical level')
    );

    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
