import { Wind, MapPin, Activity } from 'lucide-react';
import { getIAQStatus } from '@/lib/aqiUtils';
import { StatusBadge } from './StatusBadge';

interface HeroSectionProps {
  iaq: number;
  location: string;
}

export const HeroSection = ({ iaq, location }: HeroSectionProps) => {
  const status = getIAQStatus(iaq);

  return (
    <section className="relative overflow-hidden py-12 md:py-20">
      {/* Background gradient based on AQI */}
      <div 
        className="absolute inset-0 opacity-20 transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${status.color} 0%, transparent 70%)`,
        }}
      />
      
      <div className="container relative z-10">
        <div className="flex flex-col items-center text-center">
          {/* Location */}
          <div className="mb-6 flex items-center gap-2 text-muted-foreground animate-fade-in">
            <MapPin className="h-4 w-4" />
            <span className="text-sm font-medium uppercase tracking-widest">{location}</span>
          </div>

          {/* Title */}
          <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Real-Time Air Quality
            <br />
            <span className="text-muted-foreground">Monitoring</span>
          </h1>

          {/* Main AQI Card */}
          <div 
            className={`mt-10 aqi-card ${status.cardClass} w-full max-w-md animate-scale-in`}
            style={{ animationDelay: '0.2s' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className={`h-5 w-5 ${status.textClass}`} />
                <span className="text-sm font-medium text-muted-foreground">Overall Air Quality Index</span>
              </div>
              <StatusBadge status={status} />
            </div>

            <div className="flex items-baseline gap-3">
              <span className={`font-mono text-7xl font-bold ${status.textClass} animate-pulse-glow`}>
                {Math.round(iaq)}
              </span>
              <span className="text-xl text-muted-foreground">IAQ</span>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Wind className={`h-4 w-4 ${status.textClass}`} />
              <span className={`text-sm font-medium ${status.textClass}`}>
                {status.label} Air Quality
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
