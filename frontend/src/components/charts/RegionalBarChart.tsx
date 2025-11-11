import { memo, useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useTheme, getChartTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/i18n/config';
import type { Region } from '@/types/metrics';

interface RegionalBarChartProps {
  data: Region[];
  height?: number;
  orientation?: 'vertical' | 'horizontal';
}

export const RegionalBarChart = memo<RegionalBarChartProps>(
  ({ data, height = 400, orientation = 'vertical' }) => {
    const { theme } = useTheme();
    const { t, i18n } = useTranslation();
    const chartTheme = getChartTheme(theme);

    const options = useMemo<Highcharts.Options>(() => {
      // Sort data by value for better visualization
      const sortedData = [...data].sort((a, b) => b.value - a.value);

      const categories = sortedData.map(
        (item) => t(`regions.${item.name.toLowerCase()}`) || item.name
      );
      const values = sortedData.map((item) => item.value);

      // Generate gradient colors based on values
      const maxValue = Math.max(...values);
      const colors = values.map((value) => {
        const intensity = value / maxValue;
        if (theme === 'dark') {
          // Gradient from dark blue to bright blue in dark mode
          return `rgba(59, 130, 246, ${0.4 + intensity * 0.6})`;
        }
        // Gradient from light blue to dark blue in light mode
        return `rgba(59, 130, 246, ${0.5 + intensity * 0.5})`;
      });

      return {
        chart: {
          type: orientation === 'horizontal' ? 'bar' : 'column',
          height,
          backgroundColor: chartTheme.backgroundColor,
          style: {
            fontFamily: 'Inter, system-ui, sans-serif',
          },
        },
        title: {
          text: t('regions.title'),
          style: {
            color: chartTheme.textColor,
            fontSize: '18px',
            fontWeight: '600',
          },
        },
        xAxis: {
          categories,
          labels: {
            style: {
              color: chartTheme.axisLabelColor,
              fontSize: '12px',
            },
            rotation: orientation === 'vertical' ? -45 : 0,
          },
          gridLineColor: chartTheme.gridLineColor,
          lineColor: chartTheme.gridLineColor,
        },
        yAxis: {
          title: {
            text: t('chart.yAxis'),
            style: {
              color: chartTheme.axisLabelColor,
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
        tooltip: {
          backgroundColor: chartTheme.tooltipBackgroundColor,
          style: {
            color: chartTheme.tooltipTextColor,
          },
          formatter: function () {
            const value = formatNumber(this.y as number, i18n.language);
            const percentage = (
              ((this.y as number) / values.reduce((a, b) => a + b, 0)) *
              100
            ).toFixed(1);
            return `
              <b>${this.x}</b><br/>
              ${t('chart.yAxis')}: <b>${value}</b><br/>
              ${t('chart.distribution')}: <b>${percentage}%</b>
            `;
          },
        },
        legend: {
          enabled: false,
        },
        plotOptions: {
          column: {
            colorByPoint: true,
            colors,
            borderRadius: 4,
            dataLabels: {
              enabled: true,
              color: chartTheme.textColor,
              style: {
                fontSize: '11px',
                fontWeight: '500',
                textOutline: 'none',
              },
              formatter: function () {
                return formatNumber(this.y as number, i18n.language);
              },
            },
          },
          bar: {
            colorByPoint: true,
            colors,
            borderRadius: 4,
            dataLabels: {
              enabled: true,
              color: chartTheme.textColor,
              style: {
                fontSize: '11px',
                fontWeight: '500',
                textOutline: 'none',
              },
              formatter: function () {
                return formatNumber(this.y as number, i18n.language);
              },
            },
          },
        },
        series: [
          {
            name: t('regions.title'),
            data: values,
            type: orientation === 'horizontal' ? 'bar' : 'column',
          },
        ],
        responsive: {
          rules: [
            {
              condition: {
                maxWidth: 500,
              },
              chartOptions: {
                xAxis: {
                  labels: {
                    rotation: -90,
                    style: {
                      fontSize: '10px',
                    },
                  },
                },
                plotOptions: {
                  column: {
                    dataLabels: {
                      enabled: false,
                    },
                  },
                  bar: {
                    dataLabels: {
                      enabled: false,
                    },
                  },
                },
              },
            },
          ],
        },
        credits: {
          enabled: false,
        },
      };
    }, [data, height, orientation, theme, t, i18n.language, chartTheme]);

    return (
      <div className="w-full">
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    );
  }
);

RegionalBarChart.displayName = 'RegionalBarChart';
