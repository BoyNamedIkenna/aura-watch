import { AlertTriangle, Heart, Shield, Info } from 'lucide-react';
import { AQIStatus, getHealthAdvisory } from '@/lib/aqiUtils';

interface HealthAdvisoryProps {
  status: AQIStatus;
}

export const HealthAdvisory = ({ status }: HealthAdvisoryProps) => {
  const advisory = getHealthAdvisory(status);
  
  const getIcon = () => {
    switch (status.level) {
      case 'good':
        return <Heart className="h-6 w-6" />;
      case 'moderate':
        return <Info className="h-6 w-6" />;
      case 'unhealthy-sensitive':
        return <Shield className="h-6 w-6" />;
      default:
        return <AlertTriangle className="h-6 w-6" />;
    }
  };

  return (
    <section className="py-12">
      <div className="container">
        <div 
          className={`aqi-card ${status.cardClass} animate-fade-in`}
          style={{ animationDelay: '0.6s' }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className={`flex-shrink-0 p-4 rounded-2xl ${status.bgClass}/10 ${status.textClass}`}>
              {getIcon()}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg text-foreground">Health Advisory</h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.bgClass}/20 ${status.textClass}`}>
                  {status.label}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {advisory}
              </p>
            </div>

            <div className={`flex-shrink-0 hidden lg:flex items-center gap-2 px-4 py-2 rounded-full border ${status.borderClass}/30 ${status.bgClass}/10`}>
              <span className={`pulse-dot ${status.bgClass}`} />
              <span className={`text-sm font-medium ${status.textClass}`}>Live Monitoring</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
