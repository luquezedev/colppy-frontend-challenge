import { memo } from 'react';
import { AlertBanner } from './AlertBanner';
import type { ThresholdAlert } from '@/types/alerts';

interface AlertListProps {
  alerts: ThresholdAlert[];
}

export const AlertList = memo<AlertListProps>(({ alerts }) => {
  if (alerts.length === 0) return null;

  return (
    <div className="mb-6 space-y-2">
      {alerts.map((alert) => (
        <AlertBanner key={alert.id} alert={alert} />
      ))}
    </div>
  );
});

AlertList.displayName = 'AlertList';
