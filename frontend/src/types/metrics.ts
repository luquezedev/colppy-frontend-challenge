import { z } from 'zod';

// Region schema
export const RegionSchema = z.object({
  name: z.string(),
  value: z.number(),
});

// Metrics schema for validation
export const MetricsSchema = z.object({
  id: z.number(),
  timestamp: z.string(),
  activeUsers: z.number(),
  revenue: z.number(),
  conversionRate: z.number(),
  churnRate: z.number(),
  regions: z.array(RegionSchema),
});

// Types derived from schemas
export type Region = z.infer<typeof RegionSchema>;
export type Metrics = z.infer<typeof MetricsSchema>;

// Response types
export type MetricsResponse = Metrics[];

// Trend types
export type TrendDirection = 'up' | 'down' | 'stable';

export interface Trend {
  direction: TrendDirection;
  percentage: number;
  isPositive: boolean;
}

// Threshold types
export interface ThresholdConfig {
  metric: keyof Pick<Metrics, 'activeUsers' | 'revenue' | 'conversionRate' | 'churnRate'>;
  warning: number;
  critical: number;
  comparison: 'above' | 'below';
}

export interface ThresholdAlert {
  metric: string;
  value: number;
  threshold: number;
  level: 'warning' | 'critical';
  message: string;
}

// Chart types
export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
}

// KPI Card props
export interface KPIData {
  title: string;
  value: number;
  format?: 'number' | 'currency' | 'percentage';
  trend?: Trend;
  threshold?: ThresholdConfig;
  icon?: string;
}

// Dashboard state
export interface DashboardState {
  metrics: Metrics[];
  isLoading: boolean;
  error?: Error;
  lastUpdated?: Date;
}

// Aggregated metrics for summary
export interface AggregatedMetrics {
  averageActiveUsers: number;
  totalRevenue: number;
  averageConversionRate: number;
  averageChurnRate: number;
  topRegion: Region | null;
}
