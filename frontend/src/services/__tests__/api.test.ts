import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock axios with proper structure
const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() },
  },
};

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
  },
}));

describe('api.metrics', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should fetch all metrics successfully', async () => {
      const { api } = await import('../api');

      const mockData = [
        {
          timestamp: '2024-01-01T00:00:00Z',
          activeUsers: 1000,
          newUsers: 100,
          revenue: 50000,
          churnRate: 0.02,
          byRegion: { US: 400, EU: 300, LATAM: 200, APAC: 100 },
        },
      ];

      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockData });

      const result = await api.metrics.getAll();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/metrics');
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        timestamp: '2024-01-01T00:00:00Z',
        activeUsers: 1000,
        revenue: 50000,
        churnRate: 2, // Converted from decimal
        conversionRate: expect.any(Number),
        regions: expect.arrayContaining([
          { name: 'US', value: 400 },
          { name: 'EU', value: 300 },
          { name: 'LATAM', value: 200 },
          { name: 'APAC', value: 100 },
        ]),
      });
    });

    it('should transform churnRate from decimal to percentage', async () => {
      const { api } = await import('../api');

      const mockData = [
        {
          timestamp: '2024-01-01T00:00:00Z',
          activeUsers: 1000,
          newUsers: 100,
          revenue: 50000,
          churnRate: 0.025, // 2.5%
          byRegion: { US: 1000 },
        },
      ];

      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockData });

      const result = await api.metrics.getAll();

      expect(result[0]!.churnRate).toBe(2.5);
    });

    it('should transform byRegion object to regions array', async () => {
      const { api } = await import('../api');

      const mockData = [
        {
          timestamp: '2024-01-01T00:00:00Z',
          activeUsers: 1000,
          newUsers: 100,
          revenue: 50000,
          churnRate: 0.02,
          byRegion: { US: 400, EU: 300 },
        },
      ];

      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockData });

      const result = await api.metrics.getAll();

      expect(result[0]!.regions).toEqual([
        { name: 'US', value: 400 },
        { name: 'EU', value: 300 },
      ]);
    });

    it('should calculate conversionRate from newUsers', async () => {
      const { api } = await import('../api');

      const mockData = [
        {
          timestamp: '2024-01-01T00:00:00Z',
          activeUsers: 1000,
          newUsers: 150,
          revenue: 50000,
          churnRate: 0.02,
          byRegion: { US: 1000 },
        },
      ];

      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockData });

      const result = await api.metrics.getAll();

      expect(result[0]!.conversionRate).toBeGreaterThan(0);
      expect(result[0]!.conversionRate).toBeLessThanOrEqual(10);
    });

    it('should handle API errors', async () => {
      const { api } = await import('../api');

      const error = new Error('Network error');
      mockAxiosInstance.get.mockRejectedValueOnce(error);

      await expect(api.metrics.getAll()).rejects.toThrow('Network error');
    });

    it('should assign incremental IDs to metrics', async () => {
      const { api } = await import('../api');

      const mockData = [
        {
          timestamp: '2024-01-01T00:00:00Z',
          activeUsers: 1000,
          newUsers: 100,
          revenue: 50000,
          churnRate: 0.02,
          byRegion: { US: 1000 },
        },
        {
          timestamp: '2024-01-01T01:00:00Z',
          activeUsers: 1100,
          newUsers: 110,
          revenue: 55000,
          churnRate: 0.02,
          byRegion: { US: 1100 },
        },
      ];

      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockData });

      const result = await api.metrics.getAll();

      expect(result[0]!.id).toBe(1);
      expect(result[1]!.id).toBe(2);
    });
  });
});
