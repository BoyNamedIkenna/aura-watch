import { AQIStatus } from '@/lib/aqiUtils';

interface StatusBadgeProps {
  status: AQIStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <div className={`status-badge ${status.bgClass}/20 ${status.textClass} border ${status.borderClass}/30`}>
      <span className={`pulse-dot ${status.bgClass}`} />
      {status.label}
    </div>
  );
};
