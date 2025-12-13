import { useState, useEffect } from 'react';
import { Flame, Wind, Thermometer, Droplets } from 'lucide-react';
import { HeroSection } from '@/components/HeroSection';
import { SensorCard, Reading } from '@/components/SensorCard';
import { PollutantChart } from '@/components/PollutantChart';
import { HealthAdvisory } from '@/components/HealthAdvisory';
import { Footer } from '@/components/Footer';
import { 
  getIAQStatus, 
  getCOStatus, 
  getPMStatus, 
  generateMockData 
} from '@/lib/aqiUtils';

const Index = () => {
  const [sensorData, setSensorData] = useState({
    co: 3.2,
    pm25: 18.5,
    pm10: 32.4,
    iaq: 42,
    temperature: 24.5,
    humidity: 58,
  });

  const [historicalData, setHistoricalData] = useState(generateMockData());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => ({
        co: Math.max(0.5, prev.co + (Math.random() - 0.5) * 0.5),
        pm25: Math.max(1, prev.pm25 + (Math.random() - 0.5) * 3),
        pm10: Math.max(5, prev.pm10 + (Math.random() - 0.5) * 5),
        iaq: Math.max(10, Math.min(200, prev.iaq + (Math.random() - 0.5) * 5)),
        temperature: prev.temperature + (Math.random() - 0.5) * 0.2,
        humidity: Math.max(30, Math.min(80, prev.humidity + (Math.random() - 0.5) * 2)),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const iaqStatus = getIAQStatus(sensorData.iaq);
  const coStatus = getCOStatus(sensorData.co);
  const pmStatus = getPMStatus(sensorData.pm25);

  // Get worst status for health advisory
  const statusPriority = ['hazardous', 'unhealthy', 'unhealthy-sensitive', 'moderate', 'good'];
  const worstStatus = [iaqStatus, coStatus, pmStatus].reduce((worst, current) => {
    return statusPriority.indexOf(current.level) < statusPriority.indexOf(worst.level) ? current : worst;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection iaq={sensorData.iaq} location="New Delhi, India" />

      {/* Sensor Cards Section */}
      <section className="py-12">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* CO Card */}
            <SensorCard
              title="Carbon Monoxide"
              subtitle="MQ-7 Sensor"
              icon={<Flame className="h-5 w-5" />}
              status={coStatus}
              delay="0.1s"
            >
              <div className="space-y-4">
                <Reading 
                  label="CO Concentration" 
                  value={sensorData.co} 
                  unit="ppm" 
                  status={coStatus}
                  large
                />
                <div className="pt-4 border-t border-border/50">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Safe Limit</span>
                    <span className="text-aqi-good">{'< 4 ppm'}</span>
                  </div>
                </div>
              </div>
            </SensorCard>

            {/* PM Card */}
            <SensorCard
              title="Particulate Matter"
              subtitle="PMS5004 Sensor"
              icon={<Wind className="h-5 w-5" />}
              status={pmStatus}
              delay="0.2s"
            >
              <div className="space-y-4">
                <Reading 
                  label="PM2.5" 
                  value={sensorData.pm25} 
                  unit="µg/m³" 
                  status={pmStatus}
                  large
                />
                <Reading 
                  label="PM10" 
                  value={sensorData.pm10} 
                  unit="µg/m³" 
                  status={pmStatus}
                />
                <div className="pt-4 border-t border-border/50">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">WHO PM2.5 Limit</span>
                    <span className="text-aqi-good">{'< 12 µg/m³'}</span>
                  </div>
                </div>
              </div>
            </SensorCard>

            {/* Environmental Card */}
            <SensorCard
              title="Environmental Data"
              subtitle="BME680 Sensor"
              icon={<Thermometer className="h-5 w-5" />}
              status={iaqStatus}
              delay="0.3s"
            >
              <div className="space-y-4">
                <Reading 
                  label="Indoor Air Quality" 
                  value={sensorData.iaq} 
                  unit="IAQ" 
                  status={iaqStatus}
                  large
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-mono text-lg font-semibold text-foreground">
                        {sensorData.temperature.toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">°C</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-mono text-lg font-semibold text-foreground">
                        {sensorData.humidity.toFixed(0)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </SensorCard>
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="py-12 bg-secondary/20">
        <div className="container">
          <h2 className="text-2xl font-bold text-foreground mb-8 animate-fade-in">
            Pollution Trends
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <PollutantChart
              title="CO Concentration"
              data={historicalData.map(d => ({ time: d.time, value: d.co }))}
              dataKey="co"
              status={coStatus}
              unit="ppm"
              delay="0.1s"
            />
            <PollutantChart
              title="PM2.5 Levels"
              data={historicalData.map(d => ({ time: d.time, value: d.pm25 }))}
              dataKey="pm25"
              status={pmStatus}
              unit="µg/m³"
              delay="0.2s"
            />
            <PollutantChart
              title="Indoor Air Quality"
              data={historicalData.map(d => ({ time: d.time, value: d.iaq }))}
              dataKey="iaq"
              status={iaqStatus}
              unit="IAQ"
              delay="0.3s"
            />
          </div>
        </div>
      </section>

      {/* Health Advisory */}
      <HealthAdvisory status={worstStatus} />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
