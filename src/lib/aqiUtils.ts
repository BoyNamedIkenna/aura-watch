import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 1. US EPA STANDARD HEX CODES
export const AQI_COLORS = {
  good: '#009966',       
  moderate: '#FFDE33',   
  sensitive: '#FF9933',  
  unhealthy: '#CC0033',  
  veryUnhealthy: '#660099', 
  hazardous: '#7E0023',  
};

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

export type AQILevel = 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'hazardous';

export interface AQIStatus {
  level: AQILevel;
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  cardClass: string;
}

export const getIAQStatus = (iaq: number): AQIStatus => {
  if (iaq <= 50) {
    return {
      level: 'good',
      label: 'Good',
      color: AQI_COLORS.good,
      bgClass: 'bg-aqi-good',
      textClass: 'text-aqi-good',
      borderClass: 'border-aqi-good',
      cardClass: 'aqi-card-good',
    };
  } else if (iaq <= 100) {
    return {
      level: 'moderate',
      label: 'Moderate',
      color: AQI_COLORS.moderate,
      bgClass: 'bg-aqi-moderate',
      textClass: 'text-aqi-moderate',
      borderClass: 'border-aqi-moderate',
      cardClass: 'aqi-card-moderate',
    };
  } else if (iaq <= 150) {
    return {
      level: 'unhealthy-sensitive',
      label: 'Unhealthy for Sensitive',
      color: AQI_COLORS.sensitive,
      bgClass: 'bg-aqi-unhealthy-sensitive',
      textClass: 'text-aqi-unhealthy-sensitive',
      borderClass: 'border-aqi-unhealthy-sensitive',
      cardClass: 'aqi-card-unhealthy-sensitive',
    };
  } else if (iaq <= 200) {
    return {
      level: 'unhealthy',
      label: 'Unhealthy',
      color: AQI_COLORS.unhealthy,
      bgClass: 'bg-aqi-unhealthy',
      textClass: 'text-aqi-unhealthy',
      borderClass: 'border-aqi-unhealthy',
      cardClass: 'aqi-card-unhealthy',
    };
  } else {
    return {
      level: 'hazardous',
      label: 'Hazardous',
      color: AQI_COLORS.hazardous,
      bgClass: 'bg-aqi-hazardous',
      textClass: 'text-aqi-hazardous',
      borderClass: 'border-aqi-hazardous',
      cardClass: 'aqi-card-hazardous',
    };
  }
};

export const getCOStatus = (co: number): AQIStatus => {
  if (co <= 4.4) {
    return {
      level: 'good',
      label: 'Safe',
      color: AQI_COLORS.good,
      bgClass: 'bg-aqi-good',
      textClass: 'text-aqi-good',
      borderClass: 'border-aqi-good',
      cardClass: 'aqi-card-good',
    };
  } else if (co <= 9.4) {
    return {
      level: 'moderate',
      label: 'Elevated',
      color: AQI_COLORS.moderate,
      bgClass: 'bg-aqi-moderate',
      textClass: 'text-aqi-moderate',
      borderClass: 'border-aqi-moderate',
      cardClass: 'aqi-card-moderate',
    };
  } else {
    return {
      level: 'unhealthy',
      label: 'Dangerous',
      color: AQI_COLORS.unhealthy,
      bgClass: 'bg-aqi-unhealthy',
      textClass: 'text-aqi-unhealthy',
      borderClass: 'border-aqi-unhealthy',
      cardClass: 'aqi-card-unhealthy',
    };
  }
};

export const getPMStatus = (pm25: number): AQIStatus => {
  if (pm25 <= 12) {
    return {
      level: 'good',
      label: 'Good',
      color: AQI_COLORS.good,
      bgClass: 'bg-aqi-good',
      textClass: 'text-aqi-good',
      borderClass: 'border-aqi-good',
      cardClass: 'aqi-card-good',
    };
  } else if (pm25 <= 35) {
    return {
      level: 'moderate',
      label: 'Moderate',
      color: AQI_COLORS.moderate,
      bgClass: 'bg-aqi-moderate',
      textClass: 'text-aqi-moderate',
      borderClass: 'border-aqi-moderate',
      cardClass: 'aqi-card-moderate',
    };
  } else if (pm25 <= 55) {
    return {
      level: 'unhealthy-sensitive',
      label: 'Unhealthy for Sensitive',
      color: AQI_COLORS.sensitive,
      bgClass: 'bg-aqi-unhealthy-sensitive',
      textClass: 'text-aqi-unhealthy-sensitive',
      borderClass: 'border-aqi-unhealthy-sensitive',
      cardClass: 'aqi-card-unhealthy-sensitive',
    };
  } else if (pm25 <= 150) {
    return {
      level: 'unhealthy',
      label: 'Unhealthy',
      color: AQI_COLORS.unhealthy,
      bgClass: 'bg-aqi-unhealthy',
      textClass: 'text-aqi-unhealthy',
      borderClass: 'border-aqi-unhealthy',
      cardClass: 'aqi-card-unhealthy',
    };
  } else {
    return {
      level: 'hazardous',
      label: 'Hazardous',
      color: AQI_COLORS.hazardous,
      bgClass: 'bg-aqi-hazardous',
      textClass: 'text-aqi-hazardous',
      borderClass: 'border-aqi-hazardous',
      cardClass: 'aqi-card-hazardous',
    };
  }
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