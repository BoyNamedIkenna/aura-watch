import { useState } from 'react';
import { Flame, Wind, Thermometer, Droplets, Activity } from 'lucide-react';
import { HeroSection } from '@/components/HeroSection';
import { SensorCard, Reading } from '@/components/SensorCard';
import { PollutantChart } from '@/components/PollutantChart';
import { HealthAdvisory } from '@/components/HealthAdvisory';
import { Footer } from '@/components/Footer';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { TimeRangeSelector, type TimeRange, getResultsForTimeRange } from '@/components/TimeRangeSelector';
import { useThingSpeak } from '@/hooks/useThingSpeak';
import { getIAQStatus, getCOStatus, getPMStatus, type AQIStatus, getHealthAdvisory } from '@/lib/aqiUtils';

// --- HARDCODED CONFIGURATION ---
// No local storage needed. We just define exactly what your sensor sends.
const CHANNEL_ID = import.meta.env.VITE_PUBLIC_THINGSPEAK_CHANNEL_ID; 
const READ_KEY = import.meta.env.VITE_PUBLIC_THINGSPEAK_API_KEY;

const FIELD_MAPPINGS = [
  { field: 'field1', type: 'co', label: 'CO Level', unit: 'ppm' },
  { field: 'field2', type: 'temperature', label: 'Temperature', unit: '°C' },
  { field: 'field3', type: 'humidity', label: 'Humidity', unit: '%' },
  { field: 'field4', type: 'aqi_co', label: 'AQI-CO', unit: 'AQI' },
  { field: 'field5', type: 'voc', label: 'IAQ VOC', unit: 'IAQ' },
  { field: 'field6', type: 'pm25', label: 'PM 2.5', unit: 'µg/m³' },
  { field: 'field7', type: 'pm10', label: 'PM 10', unit: 'µg/m³' },
];

// --- HELPER FUNCTIONS ---
const getStatusForType = (type: string, value: number): AQIStatus => {
  switch (type) {
    case 'co': return getCOStatus(value);
    case 'pm25':
    case 'pm10': return getPMStatus(value);
    case 'iaq':
    case 'voc':
    case 'aqi_co': return getIAQStatus(value);
    default: return getIAQStatus(50);
  }
};

const getIconForType = (type: string) => {
  switch (type) {
    case 'co': return <Flame className="h-5 w-5" />;
    case 'pm25': return <Wind className="h-5 w-5" />;
    case 'temperature': return <Thermometer className="h-5 w-5" />;
    case 'humidity': return <Droplets className="h-5 w-5" />;
    default: return <Activity className="h-5 w-5" />;
  }
};

const Index = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');

  // Fetch Data (Using hardcoded ID/Key)
  const {
    readings,
    historicalData,
    isLoading,
    error,
    lastUpdated,
    refetch,
    getReading,
  } = useThingSpeak({
    channelId: CHANNEL_ID,
    apiKey: READ_KEY,
    fieldMappings: FIELD_MAPPINGS,
    refreshInterval: 15000,
    results: getResultsForTimeRange(timeRange),
  });

  // Calculations
  const calculateAvg = (type: string) => {
    if (!historicalData.length) return 0;
    const values = historicalData.map(d => Number(d[type])).filter(v => !isNaN(v));
    if (!values.length) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  const primaryReading = getReading('iaq') || getReading('voc') || getReading('aqi_co') || readings[0];
  const primaryStatus = primaryReading ? getStatusForType(primaryReading.type, primaryReading.value) : getIAQStatus(50);

  const airQualityReadings = readings.filter(r => ['co', 'pm25', 'pm10', 'voc', 'iaq'].includes(r.type));
  const environmentalReadings = readings.filter(r => ['temperature', 'humidity'].includes(r.type));

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">AirMonitor IoT</span>
          </div>
          <div className="flex items-center gap-3">
             <ConnectionStatus isConnected={!error && !isLoading} isLoading={isLoading} lastUpdated={lastUpdated} error={error} onRefresh={refetch} />
          </div>
        </div>
      </div>

      {/* HERO */}
      <HeroSection iaq={primaryReading?.value || 50} location="Laboratory" />

      {/* SENSOR CARDS */}
      <section className="py-12">
        <div className="container">
          {readings.length === 0 && !isLoading ? (
             <div className="text-center py-12"><p className="text-muted-foreground">{error || 'No data available.'}</p></div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {airQualityReadings.map((reading, index) => (
                <SensorCard key={reading.field} title={reading.label} subtitle="Real-time" icon={getIconForType(reading.type)} status={getStatusForType(reading.type, reading.value)} delay={`${0.1 * (index + 1)}s`}>
                  <div className="space-y-4">
                    <Reading label={reading.label} value={reading.value} unit={reading.unit} status={getStatusForType(reading.type, reading.value)} large />
                  </div>
                </SensorCard>
              ))}
              {environmentalReadings.length > 0 && (
                <SensorCard title="Environment" subtitle="Lab Conditions" icon={<Thermometer className="h-5 w-5" />} status={getIAQStatus(50)} delay="0.5s">
                  <div className="space-y-4">
                    {environmentalReadings.map(reading => (
                      <div key={reading.field} className="flex items-center gap-3">
                        {getIconForType(reading.type)}
                        <div><span className="font-mono text-lg font-semibold">{reading.value.toFixed(1)}</span><span className="text-xs text-muted-foreground ml-1">{reading.unit}</span></div>
                        <span className="text-xs text-muted-foreground ml-auto">{reading.label}</span>
                      </div>
                    ))}
                  </div>
                </SensorCard>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CHARTS */}
      {readings.length > 0 && (
        <section className="py-12 bg-secondary/20">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Trends</h2>
              <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {airQualityReadings.map((reading) => {
                const defaultType = (reading.type === 'aqi_co' || reading.type === 'voc') ? 'bar' : 'line';
                return (
                  <PollutantChart
                    key={reading.field}
                    title={reading.label}
                    data={historicalData.map(d => ({ created_at: d.created_at, value: Number(d[reading.type]) || 0 }))}
                    status={getStatusForType(reading.type, reading.value)}
                    unit={reading.unit}
                    avgValue={calculateAvg(reading.type)}
                    currentValue={reading.value}
                    currentTimeRange={timeRange}
                    defaultChartType={defaultType}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}

      {readings.length > 0 && <HealthAdvisory status={primaryStatus} />}
      <Footer />
    </div>
  );
};

export default Index;