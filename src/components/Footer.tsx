import { Cpu, Radio, Thermometer } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-8 mt-8">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              <span className="text-xs">MQ-7</span>
            </div>
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4" />
              <span className="text-xs">PMS5004</span>
            </div>
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              <span className="text-xs">BME680</span>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Data collected from IoT environmental sensors • Updated in real-time
          </p>
        </div>
      </div>
    </footer>
  );
};
