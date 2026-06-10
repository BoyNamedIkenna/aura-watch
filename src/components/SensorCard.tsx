import { ReactNode } from 'react';
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
  return (
    <div 
      className={`aqi-card ${status.cardClass} animate-fade-in h-full`}
      style={{ animationDelay: delay }}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${status.bgClass}/10 ${status.textClass}`}>
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
        <span className={`font-mono font-bold ${status.textClass} ${large ? 'text-4xl' : 'text-2xl'}`}>
          {typeof value === 'number' ? value.toFixed(1) : value}
        </span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
};
