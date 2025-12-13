import { useState } from 'react';
import { Flame, Wind, Thermometer, Droplets, Activity, Gauge } from 'lucide-react';
import { HeroSection } from '@/components/HeroSection';
import { SensorCard, Reading } from '@/components/SensorCard';
import { PollutantChart } from '@/components/PollutantChart';
import { HealthAdvisory } from '@/components/HealthAdvisory';
import { Footer } from '@/components/Footer';
import { ThingSpeakConfig, type ThingSpeakSettings, type FieldMapping } from '@/components/ThingSpeakConfig';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { useThingSpeak, type SensorReading } from '@/hooks/useThingSpeak';
import { 
  getIAQStatus, 
  getCOStatus, 
  getPMStatus,
  type AQIStatus,
} from '@/lib/aqiUtils';

const STORAGE_KEY = 'thingspeak_config';

const DEFAULT_MAPPINGS: FieldMapping[] = [
  { field: 'field1', type: 'co', label: 'CO Level', unit: 'ppm' },
  { field: 'field2', type: 'temperature', label: 'Temperature', unit: '°C' },
  { field: 'field3', type: 'humidity', label: 'Humidity', unit: '%' },
  { field: 'field4', type: 'aqi_co', label: 'AQI-CO', unit: 'AQI' },
  { field: 'field5', type: 'voc', label: 'IAQ VOC', unit: 'IAQ' },
];

const getStoredSettings = (): ThingSpeakSettings => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { channelId: '', apiKey: '', fieldMappings: DEFAULT_MAPPINGS };
    }
  }
  return { channelId: '', apiKey: '', fieldMappings: DEFAULT_MAPPINGS };
};

const getStatusForType = (type: string, value: number): AQIStatus => {
  switch (type) {
    case 'co':
      return getCOStatus(value);
    case 'pm25':
    case 'pm10':
      return getPMStatus(value);
    case 'iaq':
    case 'voc':
    case 'aqi_co':
      return getIAQStatus(value);
    default:
      return getIAQStatus(50); // Default neutral status
  }
};

const getIconForType = (type: string) => {
  switch (type) {
    case 'co':
      return <Flame className="h-5 w-5" />;
    case 'pm25':
    case 'pm10':
      return <Wind className="h-5 w-5" />;
    case 'temperature':
      return <Thermometer className="h-5 w-5" />;
    case 'humidity':
      return <Droplets className="h-5 w-5" />;
    case 'voc':
    case 'iaq':
      return <Activity className="h-5 w-5" />;
    case 'aqi_co':
      return <Gauge className="h-5 w-5" />;
    default:
      return <Activity className="h-5 w-5" />;
  }
};

const Index = () => {
  const [settings, setSettings] = useState<ThingSpeakSettings>(getStoredSettings);
  
  const isConfigured = !!settings.channelId && !!settings.apiKey && settings.fieldMappings.length > 0;

  const {
    readings,
    historicalData,
    isLoading,
    error,
    lastUpdated,
    refetch,
    getReading,
  } = useThingSpeak({
    channelId: settings.channelId,
    apiKey: settings.apiKey,
    fieldMappings: settings.fieldMappings,
    refreshInterval: 15000,
  });

  const handleSettingsSave = (newSettings: ThingSpeakSettings) => {
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  };

  // Get primary reading for hero section (prefer IAQ, VOC, or AQI-CO)
  const primaryReading = getReading('iaq') || getReading('voc') || getReading('aqi_co') || readings[0];
  const primaryStatus = primaryReading ? getStatusForType(primaryReading.type, primaryReading.value) : getIAQStatus(50);

  // Get worst status for health advisory
  const statusPriority = ['hazardous', 'unhealthy', 'unhealthy-sensitive', 'moderate', 'good'];
  const allStatuses = readings.map(r => getStatusForType(r.type, r.value));
  const worstStatus = allStatuses.length > 0 
    ? allStatuses.reduce((worst, current) => 
        statusPriority.indexOf(current.level) < statusPriority.indexOf(worst.level) ? current : worst
      )
    : getIAQStatus(50);

  // Group readings for display
  const airQualityReadings = readings.filter(r => ['co', 'pm25', 'pm10', 'aqi_co', 'voc', 'iaq'].includes(r.type));
  const environmentalReadings = readings.filter(r => ['temperature', 'humidity'].includes(r.type));
  const otherReadings = readings.filter(r => !['co', 'pm25', 'pm10', 'aqi_co', 'voc', 'iaq', 'temperature', 'humidity'].includes(r.type));

  return (
    <div className="min-h-screen bg-background">
      {/* Config Bar */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">ThingSpeak</span>
            {isConfigured && (
              <span className="text-xs text-muted-foreground">
                Channel: {settings.channelId}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isConfigured && (
              <ConnectionStatus
                isConnected={!error && !isLoading}
                isLoading={isLoading}
                lastUpdated={lastUpdated}
                error={error}
                onRefresh={refetch}
              />
            )}
            <ThingSpeakConfig
              settings={settings}
              onSave={handleSettingsSave}
            />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <HeroSection 
        iaq={primaryReading?.value || 50} 
        location="Air Quality Monitor" 
      />

      {/* Sensor Cards Section */}
      <section className="py-12">
        <div className="container">
          {!isConfigured ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Configure your ThingSpeak channel to see live sensor data.
              </p>
            </div>
          ) : readings.length === 0 && !isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {error || 'No data available. Check your ThingSpeak configuration.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Air Quality Readings */}
              {airQualityReadings.map((reading, index) => (
                <SensorCard
                  key={reading.field}
                  title={reading.label}
                  subtitle={`ThingSpeak ${reading.field.replace('field', 'Field ')}`}
                  icon={getIconForType(reading.type)}
                  status={getStatusForType(reading.type, reading.value)}
                  delay={`${0.1 * (index + 1)}s`}
                >
                  <div className="space-y-4">
                    <Reading 
                      label={reading.label}
                      value={reading.value} 
                      unit={reading.unit} 
                      status={getStatusForType(reading.type, reading.value)}
                      large
                    />
                  </div>
                </SensorCard>
              ))}

              {/* Environmental Card (grouped) */}
              {environmentalReadings.length > 0 && (
                <SensorCard
                  title="Environmental Data"
                  subtitle="Temperature & Humidity"
                  icon={<Thermometer className="h-5 w-5" />}
                  status={getIAQStatus(50)}
                  delay={`${0.1 * (airQualityReadings.length + 1)}s`}
                >
                  <div className="space-y-4">
                    {environmentalReadings.map(reading => (
                      <div key={reading.field} className="flex items-center gap-3">
                        {getIconForType(reading.type)}
                        <div>
                          <span className="font-mono text-lg font-semibold text-foreground">
                            {reading.value.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">
                            {reading.unit}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {reading.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </SensorCard>
              )}

              {/* Other Custom Readings */}
              {otherReadings.map((reading, index) => (
                <SensorCard
                  key={reading.field}
                  title={reading.label}
                  subtitle={`ThingSpeak ${reading.field.replace('field', 'Field ')}`}
                  icon={<Activity className="h-5 w-5" />}
                  status={getIAQStatus(50)}
                  delay={`${0.1 * (airQualityReadings.length + (environmentalReadings.length > 0 ? 1 : 0) + index + 1)}s`}
                >
                  <div className="space-y-4">
                    <Reading 
                      label={reading.label}
                      value={reading.value} 
                      unit={reading.unit} 
                      status={getIAQStatus(50)}
                      large
                    />
                  </div>
                </SensorCard>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Charts Section */}
      {isConfigured && readings.length > 0 && historicalData.length > 0 && (
        <section className="py-12 bg-secondary/20">
          <div className="container">
            <h2 className="text-2xl font-bold text-foreground mb-8 animate-fade-in">
              Sensor Trends
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {readings.map((reading, index) => (
                <PollutantChart
                  key={reading.field}
                  title={reading.label}
                  data={historicalData.map(d => ({ 
                    time: d.time, 
                    value: Number(d[reading.type]) || 0 
                  }))}
                  dataKey={reading.type}
                  status={getStatusForType(reading.type, reading.value)}
                  unit={reading.unit}
                  delay={`${0.1 * (index + 1)}s`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Health Advisory */}
      {isConfigured && readings.length > 0 && (
        <HealthAdvisory status={worstStatus} />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
