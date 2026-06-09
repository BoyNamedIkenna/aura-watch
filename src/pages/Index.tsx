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
import { getIAQStatus, getCOStatus, getPMStatus,getPM10Status,calculateHourlyAverages, type AQIStatus } from '@/lib/aqiUtils';

// --- HARDCODED CONFIGURATION ---
const CHANNEL_ID = import.meta.env.VITE_PUBLIC_THINGSPEAK_CHANNEL_ID;
const READ_KEY = import.meta.env.VITE_PUBLIC_THINGSPEAK_API_KEY;
const REFRESH_INTERVAL_MS = 15000;

const FIELD_MAPPINGS = [
  { field: 'field1', type: 'co', label: 'CO Level', unit: 'ppm' },
  { field: 'field2', type: 'temperature', label: 'Temperature', unit: '°C' },
  { field: 'field3', type: 'humidity', label: 'Humidity', unit: '%' },
  { field: 'field4', type: 'aqi_co', label: 'AQI-CO', unit: 'AQI' },
  { field: 'field5', type: 'voc', label: 'IAQ VOC', unit: 'IAQ' },
  { field: 'field6', type: 'pm25', label: 'PM 2.5', unit: 'µg/m³' },
  { field: 'field7', type: 'pm10', label: 'PM 10', unit: 'µg/m³' },
];

const EPA_LIMITS: Record<string, number> = {
  pm25: 15.0,
  pm10: 50.0,
  co: 9.0,
  voc: 50.0 // Standard 'Good' IAQ threshold
};

const calcPM25_AQI = (c: number): number => {
  if (c <= 12.0)  return Math.round(((50 - 0) / (12.0 - 0)) * c);
  if (c <= 35.4)  return Math.round(((100 - 51) / (35.4 - 12.1)) * (c - 12.1) + 51);
  if (c <= 55.4)  return Math.round(((150 - 101) / (55.4 - 35.5)) * (c - 35.5) + 101);
  if (c <= 150.4) return Math.round(((200 - 151) / (150.4 - 55.5)) * (c - 55.5) + 151);
  if (c <= 250.4) return Math.round(((300 - 201) / (250.4 - 150.5)) * (c - 150.5) + 201);
  if (c <= 500.4) return Math.round(((500 - 301) / (500.4 - 250.5)) * (c - 250.5) + 301); // Hazardous
  return 500;
};

const calcPM10_AQI = (c: number): number => {
  if (c <= 54)  return Math.round(((50 - 0) / (54 - 0)) * c);
  if (c <= 154) return Math.round(((100 - 51) / (154 - 55)) * (c - 55) + 51);
  if (c <= 254) return Math.round(((150 - 101) / (254 - 155)) * (c - 155) + 101);
  if (c <= 354) return Math.round(((200 - 151) / (354 - 255)) * (c - 255) + 151);
  if (c <= 424) return Math.round(((300 - 201) / (424 - 355)) * (c - 355) + 201);
  if (c <= 604) return Math.round(((500 - 301) / (604 - 425)) * (c - 425) + 301); // Hazardous
  return 500;
};

const getStatusForType = (type: string, value: number): AQIStatus => {
  switch (type) {
    case 'co':   return getCOStatus(value);
    case 'pm25': return getPMStatus(value);
    case 'pm10': return getPM10Status(value);  // ← was wrongly using getPMStatus
    case 'voc':
    case 'iaq':
    case 'aqi_co': return getIAQStatus(value);
    default: return getIAQStatus(0);
  }
};

const getIconForType = (type: string) => {
  switch (type) {
    case 'co': return <Flame className="h-5 w-5" />;
    case 'pm25':
    case 'pm10': return <Wind className="h-5 w-5" />;
    case 'temperature': return <Thermometer className="h-5 w-5" />;
    case 'humidity': return <Droplets className="h-5 w-5" />;
    default: return <Activity className="h-5 w-5" />;
  }
};

const Index = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [viewMode, setViewMode] = useState<'live' | 'hourly'>('live');

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
    refreshInterval: REFRESH_INTERVAL_MS,
    results: getResultsForTimeRange(timeRange),
  });

  const calculateAvg = (type: string) => {
    if (!historicalData.length) return 0;
    const values = historicalData.map(d => Number(d[type])).filter(v => !isNaN(v));
    if (!values.length) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  // Inside your main component:
  const latestFeed = historicalData && historicalData.length > 0 ? historicalData[historicalData.length - 1] : null;
  // Calculate latency in seconds
  const latency = latestFeed
  ? `${Math.floor((Date.now() - new Date(latestFeed.created_at).getTime()) / 1000)}s ago`
  : 'N/A';

  // --- 2. CALCULATE OVERALL "WORST" AQI ---
  const coAQI = getReading('aqi_co')?.value || 0;
  const vocIAQ = getReading('voc')?.value || 0;
  const rawPM25 = getReading('pm25')?.value || 0;
  const rawPM10 = getReading('pm10')?.value || 0;

  // Convert raw PM to AQI Scale (0-500)
  const pm25AQI = calcPM25_AQI(rawPM25);
  const pm10AQI = calcPM10_AQI(rawPM10);

  // Find the winner (The highest number determines the Overall AQI)
  const overallAQI = Math.max(coAQI, vocIAQ, pm25AQI, pm10AQI);

  // Determine which pollutant is responsible
  let mainPollutant = "Air Quality";
  if (overallAQI === coAQI) mainPollutant = "Carbon Monoxide";
  if (overallAQI === vocIAQ) mainPollutant = "VOCs";
  if (overallAQI === pm25AQI) mainPollutant = "PM 2.5";
  if (overallAQI === pm10AQI) mainPollutant = "PM 10";

  // This status object is what colors the Hero Section
  const overallStatus = getIAQStatus(overallAQI);

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

      {/* HERO SECTION - UPDATED TO SHOW CALCULATED OVERALL AQI */}
      <HeroSection
        iaq={overallAQI}
        location={`Pollutant: ${mainPollutant}`} // Shows which sensor is triggering the alert
      />

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
                <SensorCard title="Environment" subtitle="Lab Conditions" icon={<Thermometer className="h-5 w-5" />} status={getIAQStatus(0)} delay="0.5s">
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
              <div className="flex gap-4">
             <button
                  onClick={() => setViewMode(viewMode === 'live' ? 'hourly' : 'live')}
                  className="px-4 py-2 text-sm bg-primary/10 rounded-md hover:bg-primary/20 transition-colors"
                >
                  View: {viewMode === 'live' ? 'Live Data' : 'Hourly Averages'}
                </button> 
                <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {airQualityReadings.map((reading) => {
                const defaultType = 'line';
                return (
                  <PollutantChart
                    key={reading.field}
                    title={reading.label}
                    data={ viewMode === 'hourly'
                        // If Hourly, run our utility function (make sure to import it!)
                        ? calculateHourlyAverages(historicalData).map(d => ({
                          created_at: d.created_at,
                          value: Number(d[reading.type]) || 0
                        }))
                        // If Live, show the raw data like you currently have
                        :  historicalData.map(d => ({
                          created_at: d.created_at,
                          value: Number(d[reading.type]) || 0
                        }))
                    }
                    status={getStatusForType(reading.type, reading.value)}
                    unit={reading.unit}
                    avgValue={calculateAvg(reading.type)}
                    currentValue={reading.value}
                    currentTimeRange={timeRange}
                    defaultChartType={defaultType}
                    epaLimit={EPA_LIMITS[reading.type]}
                    limitLabel={`EPA Limit (${EPA_LIMITS[reading.type]} ${reading.unit})`}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        Last transmission: {latestFeed ? latency : 'Waiting for ESP32...'}
      </div>

      {readings.length > 0 && <HealthAdvisory status={overallStatus} />}
      <Footer />
    </div>
  );
};

export default Index;