export interface ThresholdAlert {
  id: string;
  metric: string;
  value: number;
  threshold: number;
  level: 'warning' | 'critical';
  message: string;
}
