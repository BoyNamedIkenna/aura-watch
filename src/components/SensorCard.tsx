import { ReactNode, CSSProperties } from 'react';
import { AQIStatus } from '@/lib/aqiUtils';
import { StatusBadge } from './StatusBadge';

interface SensorCardProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  status: AQIStatus;
  children: ReactNode;
  delay?: string;
}

export const SensorCard = ({ title, subtitle, icon, status, children, delay = '0s' }: SensorCardProps) => {
  const cardStyle: CSSProperties = {
    animationDelay: delay,
    background: `linear-gradient(135deg, ${status.color}33, ${status.color}0D)`, // 33=20%, 0D=5%
    borderColor: `${status.color}4D`,                                             // 4D=30%
    boxShadow: `0 0 60px ${status.color}4D`,
  };

  const iconStyle: CSSProperties = {
    backgroundColor: `${status.color}1A`, // 1A=10%
    color: status.color,
  };

  return (
    <div
      className="aqi-card animate-fade-in h-full"
      style={cardStyle}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={iconStyle}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {children}
    </div>
  );
};

interface ReadingProps {
  label: string;
  value: number;
  unit: string;
  status: AQIStatus;
  large?: boolean;
}

export const Reading = ({ label, value, unit, status, large = false }: ReadingProps) => {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-1">
        <span
          className={`font-mono font-bold ${large ? 'text-4xl' : 'text-2xl'}`}
          style={{ color: status.color }}
        >
          {typeof value === 'number' ? value.toFixed(1) : value}
        </span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
};