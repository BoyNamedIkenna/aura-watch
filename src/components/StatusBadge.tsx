import { CSSProperties } from 'react';
import { AQIStatus } from '@/lib/aqiUtils';

interface StatusBadgeProps {
  status: AQIStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const badgeStyle: CSSProperties = {
  backgroundColor: `hsl(${status.color} / 0.2)`,
borderColor: `hsl(${status.color} / 0.3)`,
color: `hsl(${status.color})`,
    borderWidth: '1px',
    borderStyle: 'solid',
  };

  const dotStyle: CSSProperties = {
    backgroundColor: status.color,
  };

  return (
    <div className="status-badge" style={badgeStyle}>
      <span className="pulse-dot" style={dotStyle} />
      {status.label}
    </div>
  );
};