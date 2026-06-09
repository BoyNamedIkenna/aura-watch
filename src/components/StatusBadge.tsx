import { AQIStatus } from '@/lib/aqiUtils';

interface StatusBadgeProps {
  status: AQIStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <div
      className={`status-badge ${status.textClass}`}
      style={{
        backgroundColor: `${status.color}33`, // 33 = 20% opacity in hex
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: `${status.color}4D`,     // 4D = 30% opacity in hex
      }}
    >
      <span className={`pulse-dot`} style={{ backgroundColor: status.color }} />
      {status.label}
    </div>
  );
};
