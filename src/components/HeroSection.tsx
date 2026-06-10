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
        className="absolute inset-0  transition-all duration-1000"
        style={{
          background: `radial-gradient(
  ellipse at 50% 0%,
  hsl(${status.color} / 0.8) 0%,
  transparent 70%
)`
        }}
      />

      <div className="container relative z-10">
        <div className="flex flex-col items-center text-center">

          {/* Title */}
          <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Real-Time Air Quality
            <br />
            <span className="text-muted-foreground">Monitoring</span>
          </h1>

          {/* Main AQI Card */}
          <div
            className="mt-10 aqi-card w-full max-w-md animate-scale-in"
            style={{
              background: `linear-gradient(
    135deg,
    hsl(${status.color} / 0.2),
    hsl(${status.color} / 0.05)
  )`,
              borderColor: `hsl(${status.color} / 0.3)`,
              boxShadow: `0 0 60px hsl(${status.color} / 0.3)`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity
                  className="h-5 w-5"
                  style={{ color: `hsl(${status.color})` }}
                />

                <span
                  className="text-sm font-medium"
                  style={{ color: `hsl(${status.color})` }}
                >
                  Overall Air Quality Index
                </span>
              </div>
              <StatusBadge status={status} />
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-mono text-7xl font-bold animate-pulse-glow"
                style={{
                  color: `hsl(${status.color})`,
                }}>
                {Math.round(iaq)}
              </span>
              <span className="text-xl text-muted-foreground">AQI</span>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Wind className={`h-4 w-4 ${status.textClass}`} />
              <span className={`text-sm font-medium ${status.textClass}`}>
                {status.label} — EPA Air Quality Index
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
