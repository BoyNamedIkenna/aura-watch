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

export interface HistoricalDataPoint {
  created_at: string; // Keeps raw ISO date
  [key: string]: string | number;
}

const parseValue = (value: string | number | null | undefined): number => {
  if (value === null || value === undefined || value === '') return 0;
  const parsed = Number.parseFloat(String(value));
  return isNaN(parsed) ? 0 : parsed;
};

export const useThingSpeak = (config: ThingSpeakConfig) => {
  const { channelId, apiKey, fieldMappings, refreshInterval = 15000, results = 1000 } = config;
  
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    if (!channelId || !apiKey || fieldMappings.length === 0) {
      setIsLoading(false); return;
    }

    try {
      const response = await fetch(
        `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=${results}`
      );
      
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      
      const data = await response.json();
      const rawFeeds = data.feeds || [];

      if (rawFeeds.length > 0) {
        // 1. Process History
        const history = rawFeeds.map((feed: any) => {
          const point: HistoricalDataPoint = { created_at: feed.created_at };
          fieldMappings.forEach(mapping => {
            point[mapping.type] = parseValue(feed[mapping.field]);
          });
          return point;
        });
        setHistoricalData(history);

        // 2. Process Latest (Last item in history)
        const lastFeed = rawFeeds[rawFeeds.length - 1];
        setLastUpdated(new Date(lastFeed.created_at));
        
        setReadings(fieldMappings.map(mapping => ({
          type: mapping.type,
          label: mapping.label,
          value: parseValue(lastFeed[mapping.field]),
          unit: mapping.unit,
          field: mapping.field,
        })));
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [channelId, apiKey, fieldMappings, results]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  const getReading = (type: string) => readings.find(r => r.type === type);

  return { readings, historicalData, isLoading, error, lastUpdated, refetch: fetchData, getReading };
};