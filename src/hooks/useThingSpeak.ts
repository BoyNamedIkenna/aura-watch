import { useState, useEffect, useCallback } from 'react';

interface ThingSpeakConfig {
  channelId: string;
  apiKey: string;
  refreshInterval?: number; // in milliseconds
}

interface SensorData {
  co: number;
  pm25: number;
  pm10: number;
  iaq: number;
  temperature: number;
  humidity: number;
}

interface HistoricalDataPoint {
  time: string;
  co: number;
  pm25: number;
  pm10: number;
  iaq: number;
}

interface ThingSpeakFeed {
  created_at: string;
  entry_id: number;
  field1: string | null;
  field2: string | null;
  field3: string | null;
  field4: string | null;
  field5: string | null;
  field6: string | null;
}

interface ThingSpeakResponse {
  channel: {
    id: number;
    name: string;
    field1: string;
    field2: string;
    field3: string;
    field4: string;
    field5: string;
    field6: string;
  };
  feeds: ThingSpeakFeed[];
}

const parseFloat = (value: string | null): number => {
  if (value === null || value === '') return 0;
  const parsed = Number.parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

const formatTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

export const useThingSpeak = (config: ThingSpeakConfig) => {
  const { channelId, apiKey, refreshInterval = 15000 } = config;
  
  const [sensorData, setSensorData] = useState<SensorData>({
    co: 0,
    pm25: 0,
    pm10: 0,
    iaq: 0,
    temperature: 0,
    humidity: 0,
  });
  
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLatestData = useCallback(async () => {
    try {
      const response = await fetch(
        `https://api.thingspeak.com/channels/${channelId}/feeds/last.json?api_key=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`ThingSpeak API error: ${response.status}`);
      }
      
      const data: ThingSpeakFeed = await response.json();
      
      // Standard mapping: field1=CO, field2=PM2.5, field3=PM10, field4=IAQ, field5=Temp, field6=Humidity
      setSensorData({
        co: parseFloat(data.field1),
        pm25: parseFloat(data.field2),
        pm10: parseFloat(data.field3),
        iaq: parseFloat(data.field4),
        temperature: parseFloat(data.field5),
        humidity: parseFloat(data.field6),
      });
      
      setLastUpdated(new Date(data.created_at));
      setError(null);
    } catch (err) {
      console.error('Error fetching latest ThingSpeak data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    }
  }, [channelId, apiKey]);

  const fetchHistoricalData = useCallback(async () => {
    try {
      const response = await fetch(
        `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=24`
      );
      
      if (!response.ok) {
        throw new Error(`ThingSpeak API error: ${response.status}`);
      }
      
      const data: ThingSpeakResponse = await response.json();
      
      const historical: HistoricalDataPoint[] = data.feeds.map(feed => ({
        time: formatTime(feed.created_at),
        co: parseFloat(feed.field1),
        pm25: parseFloat(feed.field2),
        pm10: parseFloat(feed.field3),
        iaq: parseFloat(feed.field4),
      }));
      
      setHistoricalData(historical);
    } catch (err) {
      console.error('Error fetching historical ThingSpeak data:', err);
    }
  }, [channelId, apiKey]);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchLatestData(), fetchHistoricalData()]);
    setIsLoading(false);
  }, [fetchLatestData, fetchHistoricalData]);

  useEffect(() => {
    if (!channelId || !apiKey) {
      setError('Missing ThingSpeak channel ID or API key');
      setIsLoading(false);
      return;
    }

    // Initial fetch
    fetchAllData();

    // Set up polling interval
    const interval = setInterval(() => {
      fetchLatestData();
      fetchHistoricalData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [channelId, apiKey, refreshInterval, fetchAllData, fetchLatestData, fetchHistoricalData]);

  return {
    sensorData,
    historicalData,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchAllData,
  };
};
