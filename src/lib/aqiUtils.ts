import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
/* // 1. US EPA STANDARD HEX CODES
export const AQI_COLORS = {
  good: '#009966',       
  moderate: '#FFDE33',   
  sensitive: '#FF9933',  
  unhealthy: '#CC0033',  
  veryUnhealthy: '#660099', 
  hazardous: '#7E0023',  
}; */
export const AQI_COLORS = {
  good: 'hsl(142 76% 45%)',
  moderate: 'hsl(45 93% 50%)',
  sensitive: 'hsl(25 95% 53%)',
  unhealthy: 'hsl(0 84% 55%)',
  veryUnhealthy: 'hsl(280 60% 35%)', 
  hazardous: 'hsl(343 100% 25%)',
};

export interface HistoricalDataPoint {
  created_at: string;
  [key: string]: string | number;
}

// 2. DATE FORMATTER (Required for Charts)
export const formatThingSpeakDate = (isoString: string, range: string): string => {
  const date = new Date(isoString);
  // If range is "1 Week", show Day + Time
  if (range === '1w') {
    return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit' });
  }
  // Otherwise just show Time
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export type AQILevel = 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous';

export interface AQIStatus {
  level: AQILevel;
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  cardClass: string;
}
const makeStatus = (level: AQILevel, label: string, color: string, key: string): AQIStatus => ({
  level,
  label,
  color,
  bgClass: `bg-aqi-${key}`,
  textClass: `text-aqi-${key}`,
  borderClass: `border-aqi-${key}`,
  cardClass: `aqi-card-${key}`,
});

export const getIAQStatus = (iaq: number): AQIStatus => {
  if (iaq <= 50)  return makeStatus('good', 'Good', AQI_COLORS.good, 'good');
  if (iaq <= 100) return makeStatus('moderate', 'Moderate', AQI_COLORS.moderate, 'moderate');
  if (iaq <= 150) return makeStatus('unhealthy-sensitive', 'Unhealthy for Sensitive', AQI_COLORS.sensitive, 'unhealthy-sensitive');
  if (iaq <= 200) return makeStatus('unhealthy', 'Unhealthy', AQI_COLORS.unhealthy, 'unhealthy');
  if (iaq <= 300) return makeStatus('very-unhealthy', 'Very Unhealthy', AQI_COLORS.veryUnhealthy, 'very-unhealthy');
  return makeStatus('hazardous', 'Hazardous', AQI_COLORS.hazardous, 'hazardous');
};

export const getCOStatus = (co: number): AQIStatus => {
  if (co <= 4.4)  return makeStatus('good', 'Good', AQI_COLORS.good, 'good');
  if (co <= 9.4)  return makeStatus('moderate', 'Moderate', AQI_COLORS.moderate, 'moderate');
  if (co <= 12.4) return makeStatus('unhealthy-sensitive', 'Unhealthy for Sensitive', AQI_COLORS.sensitive, 'unhealthy-sensitive');
  if (co <= 15.4) return makeStatus('unhealthy', 'Unhealthy', AQI_COLORS.unhealthy, 'unhealthy');
  if (co <= 30.4) return makeStatus('very-unhealthy', 'Very Unhealthy', AQI_COLORS.veryUnhealthy, 'very-unhealthy');
  return makeStatus('hazardous', 'Hazardous', AQI_COLORS.hazardous, 'hazardous');
};

export const getPMStatus = (pm25: number): AQIStatus => {
  if (pm25 <= 12.0)  return makeStatus('good', 'Good', AQI_COLORS.good, 'good');
  if (pm25 <= 35.4)  return makeStatus('moderate', 'Moderate', AQI_COLORS.moderate, 'moderate');
  if (pm25 <= 55.4)  return makeStatus('unhealthy-sensitive', 'Unhealthy for Sensitive', AQI_COLORS.sensitive, 'unhealthy-sensitive');
  if (pm25 <= 150.4) return makeStatus('unhealthy', 'Unhealthy', AQI_COLORS.unhealthy, 'unhealthy');
  if (pm25 <= 250.4) return makeStatus('very-unhealthy', 'Very Unhealthy', AQI_COLORS.veryUnhealthy, 'very-unhealthy');
  return makeStatus('hazardous', 'Hazardous', AQI_COLORS.hazardous, 'hazardous');
};

// NEW — PM10 has different raw thresholds from PM2.5
export const getPM10Status = (pm10: number): AQIStatus => {
  if (pm10 <= 54)  return makeStatus('good', 'Good', AQI_COLORS.good, 'good');
  if (pm10 <= 154) return makeStatus('moderate', 'Moderate', AQI_COLORS.moderate, 'moderate');
  if (pm10 <= 254) return makeStatus('unhealthy-sensitive', 'Unhealthy for Sensitive', AQI_COLORS.sensitive, 'unhealthy-sensitive');
  if (pm10 <= 354) return makeStatus('unhealthy', 'Unhealthy', AQI_COLORS.unhealthy, 'unhealthy');
  if (pm10 <= 424) return makeStatus('very-unhealthy', 'Very Unhealthy', AQI_COLORS.veryUnhealthy, 'very-unhealthy');
  return makeStatus('hazardous', 'Hazardous', AQI_COLORS.hazardous, 'hazardous');
};

export const getHealthAdvisory = (status: AQIStatus): string => {
  switch (status.level) {
    case 'good': return 'Air quality is satisfactory. Enjoy outdoor activities freely.';
    case 'moderate': return 'Air quality is acceptable. Unusually sensitive people should consider reducing prolonged outdoor exertion.';
    case 'unhealthy-sensitive': return 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.';
    case 'unhealthy': return 'Air quality is unhealthy. Everyone may begin to experience health effects. Avoid prolonged outdoor exposure.';
    case 'hazardous': return 'Health alert: everyone may experience more serious health effects. Stay indoors and keep windows closed.';
    default: return 'No data available.';
  }
};

export const calculateHourlyAverages = (feeds: HistoricalDataPoint[]): HistoricalDataPoint[] => {
  if (!feeds || feeds.length === 0) return [];

  const groupedByHour: { [key: string]: HistoricalDataPoint[] } = {};

  feeds.forEach((feed) => {
    const date = new Date(feed.created_at);
    const hourKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours()}:00`;
    if (!groupedByHour[hourKey]) groupedByHour[hourKey] = [];
    groupedByHour[hourKey].push(feed);
  });

  return Object.keys(groupedByHour).map((hourKey) => {
    const group = groupedByHour[hourKey];

    // Get all keys except created_at, then average each one dynamically
    const typeKeys = Object.keys(group[0]).filter(k => k !== 'created_at');

    const averaged: HistoricalDataPoint = { created_at: hourKey };
    typeKeys.forEach((key) => {
      const avg = group.reduce((sum, f) => sum + Number(f[key] || 0), 0) / group.length;
      averaged[key] = parseFloat(avg.toFixed(2));
    });

    return averaged;
  });
};