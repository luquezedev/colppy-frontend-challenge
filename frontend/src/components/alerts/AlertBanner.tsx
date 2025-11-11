import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import type { ThresholdAlert } from '@/types/alerts';

interface AlertBannerProps {
  alert: ThresholdAlert;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alert }) => {
  const { t } = useTranslation();

  return (
    <div
      className={clsx('alert', {
        'alert-warning': alert.level === 'warning',
        'alert-danger': alert.level === 'critical',
      })}
    >
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium">{alert.message}</p>
          <p className="text-sm opacity-90 mt-1">
            {t(`metrics.${alert.metric}`)}: {alert.value.toFixed(1)}% (
            {t('alerts.thresholdExceeded', { metric: alert.threshold + '%' })})
          </p>
        </div>
      </div>
    </div>
  );
};
