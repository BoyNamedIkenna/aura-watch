import { useState, useEffect, useCallback } from 'react';
import type { FieldMapping } from '@/components/ThingSpeakConfig';

interface ThingSpeakConfig {
  channelId: string;
  apiKey: string;
  fieldMappings: FieldMapping[];
  refreshInterval?: number;
  results?: number;
}

export interface SensorReading {
  type: string;
  label: string;
  value: number;
  unit: string;
  field: string;
}

interface HistoricalDataPoint {
  time: string;
  [key: string]: string | number;
}

interface ThingSpeakFeed {
  created_at: string;
  entry_id: number;
  [key: string]: string | number | null;
}

interface ThingSpeakResponse {
  channel: {
    id: number;
    name: string;
    [key: string]: string | number;
  };
  feeds: ThingSpeakFeed[];
}

const parseValue = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = Number.parseFloat(String(value));
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
  const { channelId, apiKey, fieldMappings, refreshInterval = 15000, results = 144 } = config;
  
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchLatestData = useCallback(async () => {
    if (!channelId || !apiKey || fieldMappings.length === 0) return;

    try {
      const response = await fetch(
        `https://api.thingspeak.com/channels/${channelId}/feeds/last.json?api_key=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`ThingSpeak API error: ${response.status}`);
      }
      
      const data: ThingSpeakFeed = await response.json();
      
      const newReadings: SensorReading[] = fieldMappings.map(mapping => ({
        type: mapping.type,
        label: mapping.label,
        value: parseValue(data[mapping.field]),
        unit: mapping.unit,
        field: mapping.field,
      }));
      
      setReadings(newReadings);
      setLastUpdated(new Date(data.created_at));
      setError(null);
    } catch (err) {
      console.error('Error fetching latest ThingSpeak data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    }
  }, [channelId, apiKey, fieldMappings]);

  const fetchHistoricalData = useCallback(async () => {
    if (!channelId || !apiKey || fieldMappings.length === 0) return;

    try {
      const response = await fetch(
        `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=${results}`
      );
      
      if (!response.ok) {
        throw new Error(`ThingSpeak API error: ${response.status}`);
      }
      
      const data: ThingSpeakResponse = await response.json();
      
      const historical: HistoricalDataPoint[] = data.feeds.map(feed => {
        const point: HistoricalDataPoint = { time: formatTime(feed.created_at) };
        fieldMappings.forEach(mapping => {
          point[mapping.type] = parseValue(feed[mapping.field]);
        });
        return point;
      });
      
      setHistoricalData(historical);
    } catch (err) {
      console.error('Error fetching historical ThingSpeak data:', err);
    }
  }, [channelId, apiKey, fieldMappings, results]);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchLatestData(), fetchHistoricalData()]);
    setIsLoading(false);
  }, [fetchLatestData, fetchHistoricalData]);

  useEffect(() => {
    if (!channelId || !apiKey || fieldMappings.length === 0) {
      setIsLoading(false);
      return;
    }

    fetchAllData();

    const interval = setInterval(() => {
      fetchLatestData();
      fetchHistoricalData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [channelId, apiKey, fieldMappings, refreshInterval, fetchAllData, fetchLatestData, fetchHistoricalData]);

  // Helper to get a specific reading by type
  const getReading = (type: string): SensorReading | undefined => {
    return readings.find(r => r.type === type);
  };

  return {
    readings,
    historicalData,
    isLoading,
    error,
    lastUpdated,
    refetch: fetchAllData,
    getReading,
  };
};
