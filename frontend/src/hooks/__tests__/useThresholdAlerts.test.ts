import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useThresholdAlerts } from '../useThresholdAlerts';
import { createMockMetrics, createWrapper } from '@/test/utils';

describe('useThresholdAlerts', () => {
  const wrapper = createWrapper();

  it('should return empty array when no metrics', () => {
    const { result } = renderHook(() => useThresholdAlerts(null), { wrapper });
    expect(result.current).toEqual([]);
  });

  it('should return empty array when metrics are within thresholds', () => {
    const metrics = createMockMetrics({
      churnRate: 3, // Below warning threshold (5)
      conversionRate: 4, // Above warning threshold (3)
    });

    const { result } = renderHook(() => useThresholdAlerts(metrics), { wrapper });
    expect(result.current).toEqual([]);
  });

  it('should create warning alert when churn rate exceeds warning threshold', () => {
    const metrics = createMockMetrics({
      churnRate: 6, // Above warning (5), below critical (10)
    });

    const { result } = renderHook(() => useThresholdAlerts(metrics), { wrapper });

    expect(result.current).toHaveLength(1);
    expect(result.current[0]).toMatchObject({
      id: 'churn-warning',
      metric: 'churnRate',
      value: 6,
      threshold: 5,
      level: 'warning',
    });
  });

  it('should create critical alert when churn rate exceeds critical threshold', () => {
    const metrics = createMockMetrics({
      churnRate: 12, // Above critical threshold (10)
    });

    const { result } = renderHook(() => useThresholdAlerts(metrics), { wrapper });

    expect(result.current).toHaveLength(1);
    expect(result.current[0]).toMatchObject({
      level: 'critical',
      metric: 'churnRate',
      value: 12,
    });
  });

  it('should create warning alert when conversion rate is below warning threshold', () => {
    const metrics = createMockMetrics({
      conversionRate: 2.5, // Below warning (3), above critical (2)
    });

    const { result } = renderHook(() => useThresholdAlerts(metrics), { wrapper });

    expect(result.current).toHaveLength(1);
    expect(result.current[0]).toMatchObject({
      id: 'conversion-warning',
      metric: 'conversionRate',
      value: 2.5,
      threshold: 3,
      level: 'warning',
    });
  });

  it('should create critical alert when conversion rate is below critical threshold', () => {
    const metrics = createMockMetrics({
      conversionRate: 1.5, // Below critical threshold (2)
    });

    const { result } = renderHook(() => useThresholdAlerts(metrics), { wrapper });

    expect(result.current).toHaveLength(1);
    expect(result.current[0]).toMatchObject({
      level: 'critical',
      metric: 'conversionRate',
      value: 1.5,
    });
  });

  it('should create multiple alerts when multiple thresholds are exceeded', () => {
    const metrics = createMockMetrics({
      churnRate: 7, // Warning
      conversionRate: 2.5, // Warning
    });

    const { result } = renderHook(() => useThresholdAlerts(metrics), { wrapper });

    expect(result.current).toHaveLength(2);
    expect(result.current[0]!.metric).toBe('churnRate');
    expect(result.current[1]!.metric).toBe('conversionRate');
  });
});
