import axios from 'axios';
import { MetricsSchema, type Metrics, type MetricsResponse } from '@/types/metrics';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

// Transform API response to match frontend schema
interface ApiMetric {
  timestamp: string;
  activeUsers: number;
  newUsers?: number;
  revenue: number;
  churnRate: number;
  byRegion: {
    US: number;
    EU: number;
    LATAM: number;
    APAC: number;
  };
}

function transformMetric(apiMetric: ApiMetric, index: number): Metrics {
  // Transform byRegion object to regions array
  const regions = Object.entries(apiMetric.byRegion).map(([name, value]) => ({
    name,
    value,
  }));

  // Convert churnRate from decimal to percentage
  const churnRate = apiMetric.churnRate * 100;

  // Generate a fake conversionRate based on data patterns
  // In a real app, this would come from the API
  const conversionRate = Math.max(1, Math.min(10, (apiMetric.newUsers || 100) / 50));

  return {
    id: index + 1,
    timestamp: apiMetric.timestamp,
    activeUsers: apiMetric.activeUsers,
    revenue: apiMetric.revenue,
    conversionRate: Number(conversionRate.toFixed(2)),
    churnRate: Number(churnRate.toFixed(2)),
    regions,
  };
}

// API endpoints
export const api = {
  metrics: {
    getAll: async (): Promise<MetricsResponse> => {
      const { data } = await apiClient.get<ApiMetric[]>('/metrics');

      // Transform API data to match frontend schema
      const transformedData = data.map((item, index) => transformMetric(item, index));

      // Validate transformed data with Zod
      return transformedData.map((item) => MetricsSchema.parse(item));
    },

    getLatest: async (): Promise<Metrics> => {
      const metrics = await api.metrics.getAll();
      if (metrics.length === 0) {
        throw new Error('No metrics available');
      }
      return metrics[metrics.length - 1]!;
    },
  },
};

export default apiClient;
