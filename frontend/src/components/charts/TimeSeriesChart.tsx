import { memo, useMemo, useState, useRef } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useTheme, getChartTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { formatCurrency, formatNumber, formatPercentage } from '@/i18n/config';
import type { Metrics } from '@/types/metrics';

interface TimeSeriesChartProps {
  data: Metrics[];
  height?: number;
  showLegend?: boolean;
}

interface SeriesVisibility {
  activeUsers: boolean;
  revenue: boolean;
  churnRate: boolean;
  conversionRate: boolean;
}

export const TimeSeriesChart = memo<TimeSeriesChartProps>(
  ({ data, height = 400, showLegend = true }) => {
    const { theme } = useTheme();
    const { t, i18n } = useTranslation();
    const chartTheme = getChartTheme(theme);

    // Track series visibility state
    const [seriesVisibility, setSeriesVisibility] = useState<SeriesVisibility>({
      activeUsers: true,
      revenue: true,
      churnRate: false,
      conversionRate: false,
    });

    // Keep a ref to the chart instance
    const chartRef = useRef<Highcharts.Chart | null>(null);

    const options = useMemo<Highcharts.Options>(() => {
      // Store translated names for use in event handlers
      const churnRateName = t('metrics.churnRate');
      const conversionRateName = t('metrics.conversionRate');

      // Optimize: Single iteration to detect duplicates and prepare series data
      // Instead of 5 separate .map() calls, we do everything in one pass
      const timestamps: number[] = [];
      const uniqueTimestamps = new Set<number>();

      // First pass: collect timestamps for duplicate detection
      data.forEach((item) => {
        const timestamp = new Date(item.timestamp).getTime();
        timestamps.push(timestamp);
        uniqueTimestamps.add(timestamp);
      });

      // Check if timestamps are duplicated (more than 50% are duplicates)
      const hasDuplicateTimestamps = uniqueTimestamps.size < data.length * 0.5;
      const useIndexForX = hasDuplicateTimestamps;

      // Second pass: prepare all series data in a single iteration
      const activeUsersSeries: Array<{ x: number; y: number }> = [];
      const revenueSeries: Array<{ x: number; y: number }> = [];
      const churnRateSeries: Array<{ x: number; y: number }> = [];
      const conversionRateSeries: Array<{ x: number; y: number }> = [];

      data.forEach((item, index) => {
        const x = useIndexForX ? index + 1 : (timestamps[index] ?? 0);

        activeUsersSeries.push({ x, y: item.activeUsers });
        revenueSeries.push({ x, y: item.revenue });
        churnRateSeries.push({ x, y: item.churnRate });
        conversionRateSeries.push({ x, y: item.conversionRate });
      });

      return {
        chart: {
          type: 'line',
          height,
          backgroundColor: chartTheme.backgroundColor,
          style: {
            fontFamily: 'Inter, system-ui, sans-serif',
          },
          events: {
            load: function () {
              // Store chart reference when loaded
              chartRef.current = this;
            },
          },
        },
        title: {
          text: useIndexForX ? t('chart.comparison') : t('chart.timeEvolution'),
          style: {
            color: chartTheme.textColor,
            fontSize: '18px',
            fontWeight: '600',
          },
        },
        xAxis: {
          type: useIndexForX ? 'linear' : 'datetime',
          title: {
            text: useIndexForX ? t('chart.dataPoint') : t('chart.xAxis'),
            style: {
              color: chartTheme.axisLabelColor,
            },
          },
          labels: {
            style: {
              color: chartTheme.axisLabelColor,
            },
            formatter: function () {
              if (useIndexForX) {
                return '#' + this.value;
              }
              return Highcharts.dateFormat('%H:%M', this.value as number);
            },
          },
          gridLineColor: chartTheme.gridLineColor,
          lineColor: chartTheme.gridLineColor,
        },
        yAxis: [
          {
            // Left axis for users
            title: {
              text: t('metrics.activeUsers'),
              style: {
                color: '#3b82f6',
              },
            },
            labels: {
              style: {
                color: chartTheme.axisLabelColor,
              },
              formatter: function () {
                return formatNumber(this.value as number, i18n.language);
              },
            },
            gridLineColor: chartTheme.gridLineColor,
          },
          {
            // Right axis for revenue
            title: {
              text: t('metrics.revenue'),
              style: {
                color: '#10b981',
              },
            },
            labels: {
              style: {
                color: chartTheme.axisLabelColor,
              },
              formatter: function () {
                return formatCurrency(this.value as number, 'USD', i18n.language);
              },
            },
            opposite: true,
            gridLineColor: chartTheme.gridLineColor,
          },
          {
            // Third axis for percentages (churn & conversion rates)
            title: {
              text: t('chart.yAxisRates'),
              style: {
                color: '#f59e0b',
              },
            },
            labels: {
              style: {
                color: chartTheme.axisLabelColor,
              },
              formatter: function () {
                return formatPercentage(this.value as number, i18n.language);
              },
            },
            opposite: false,
            gridLineColor: 'transparent', // Hide grid lines to avoid clutter
            visible: false, // Hidden by default
          },
        ],
        tooltip: {
          shared: true,
          backgroundColor: chartTheme.tooltipBackgroundColor,
          style: {
            color: chartTheme.tooltipTextColor,
          },
          formatter: function () {
            let header = '';
            if (useIndexForX) {
              header = `<b>${t('chart.dataPoint')} #${this.x}</b><br/>`;
            } else {
              header = `<b>${Highcharts.dateFormat('%Y-%m-%d %H:%M', this.x as number)}</b><br/>`;
            }
            let tooltip = header;

            this.points?.forEach((point) => {
              const value = point.y ?? 0;
              let formattedValue = '';

              // Determine format based on series name
              if (point.series.name === t('metrics.activeUsers')) {
                formattedValue = formatNumber(value, i18n.language);
              } else if (point.series.name === t('metrics.revenue')) {
                formattedValue = formatCurrency(value, 'USD', i18n.language);
              } else if (
                point.series.name === churnRateName ||
                point.series.name === conversionRateName
              ) {
                formattedValue = formatPercentage(value, i18n.language);
              } else {
                formattedValue = value.toString();
              }

              tooltip += `<span style="color:${point.color}">\u25CF</span> ${point.series.name}: <b>${formattedValue}</b><br/>`;
            });

            return tooltip;
          },
        },
        legend: {
          enabled: showLegend,
          itemStyle: {
            color: chartTheme.legendTextColor,
          },
          itemHoverStyle: {
            color: chartTheme.textColor,
          },
        },
        plotOptions: {
          line: {
            dataLabels: {
              enabled: false,
            },
            enableMouseTracking: true,
            marker: {
              enabled: false,
              states: {
                hover: {
                  enabled: true,
                  radius: 5,
                },
              },
            },
          },
        },
        series: [
          {
            name: t('metrics.activeUsers'),
            data: activeUsersSeries,
            color: '#3b82f6',
            yAxis: 0,
            type: 'line',
            visible: seriesVisibility.activeUsers,
            events: {
              show: function () {
                setSeriesVisibility((prev) => ({ ...prev, activeUsers: true }));
              },
              hide: function () {
                setSeriesVisibility((prev) => ({ ...prev, activeUsers: false }));
              },
            },
          },
          {
            name: t('metrics.revenue'),
            data: revenueSeries,
            color: '#10b981',
            yAxis: 1,
            type: 'line',
            visible: seriesVisibility.revenue,
            events: {
              show: function () {
                setSeriesVisibility((prev) => ({ ...prev, revenue: true }));
              },
              hide: function () {
                setSeriesVisibility((prev) => ({ ...prev, revenue: false }));
              },
            },
          },
          {
            name: churnRateName,
            data: churnRateSeries,
            color: '#ef4444',
            yAxis: 2,
            type: 'line',
            visible: seriesVisibility.churnRate,
            events: {
              show: function () {
                setSeriesVisibility((prev) => ({ ...prev, churnRate: true }));
                // Show rates axis when this series is shown
                const chart = this.chart;
                const axis = chart.yAxis[2];
                if (axis) {
                  axis.update({ visible: true }, false);
                  chart.redraw();
                }
              },
              hide: function () {
                setSeriesVisibility((prev) => ({ ...prev, churnRate: false }));
                // Hide rates axis only if both rate series are hidden
                const chart = this.chart;
                const conversionSeries = chart.series.find((s) => s.name === conversionRateName);
                if (conversionSeries && !conversionSeries.visible) {
                  const axis = chart.yAxis[2];
                  if (axis) {
                    axis.update({ visible: false }, false);
                    chart.redraw();
                  }
                }
              },
            },
          },
          {
            name: conversionRateName,
            data: conversionRateSeries,
            color: '#f59e0b',
            yAxis: 2,
            type: 'line',
            visible: seriesVisibility.conversionRate,
            events: {
              show: function () {
                setSeriesVisibility((prev) => ({ ...prev, conversionRate: true }));
                // Show rates axis when this series is shown
                const chart = this.chart;
                const axis = chart.yAxis[2];
                if (axis) {
                  axis.update({ visible: true }, false);
                  chart.redraw();
                }
              },
              hide: function () {
                setSeriesVisibility((prev) => ({ ...prev, conversionRate: false }));
                // Hide rates axis only if both rate series are hidden
                const chart = this.chart;
                const churnSeries = chart.series.find((s) => s.name === churnRateName);
                if (churnSeries && !churnSeries.visible) {
                  const axis = chart.yAxis[2];
                  if (axis) {
                    axis.update({ visible: false }, false);
                    chart.redraw();
                  }
                }
              },
            },
          },
        ],
        responsive: {
          rules: [
            {
              condition: {
                maxWidth: 500,
              },
              chartOptions: {
                legend: {
                  enabled: false,
                },
                yAxis: [
                  {
                    title: {
                      text: null,
                    },
                  },
                  {
                    title: {
                      text: null,
                    },
                  },
                  {
                    title: {
                      text: null,
                    },
                  },
                ],
              },
            },
          ],
        },
        credits: {
          enabled: false,
        },
      };
    }, [data, height, showLegend, theme, t, i18n.language, chartTheme, seriesVisibility]);

    return (
      <div className="w-full">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    );
  }
);

TimeSeriesChart.displayName = 'TimeSeriesChart';
