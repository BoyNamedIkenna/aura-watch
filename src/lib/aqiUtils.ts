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
      color: 'hsl(142, 76%, 45%)',
      bgClass: 'bg-aqi-good',
      textClass: 'text-aqi-good',
      borderClass: 'border-aqi-good',
      cardClass: 'aqi-card-good',
    };
  } else if (iaq <= 100) {
    return {
      level: 'moderate',
      label: 'Moderate',
      color: 'hsl(45, 93%, 50%)',
      bgClass: 'bg-aqi-moderate',
      textClass: 'text-aqi-moderate',
      borderClass: 'border-aqi-moderate',
      cardClass: 'aqi-card-moderate',
    };
  } else if (iaq <= 150) {
    return {
      level: 'unhealthy-sensitive',
      label: 'Unhealthy for Sensitive',
      color: 'hsl(25, 95%, 53%)',
      bgClass: 'bg-aqi-unhealthy-sensitive',
      textClass: 'text-aqi-unhealthy-sensitive',
      borderClass: 'border-aqi-unhealthy-sensitive',
      cardClass: 'aqi-card-unhealthy-sensitive',
    };
  } else if (iaq <= 200) {
    return {
      level: 'unhealthy',
      label: 'Unhealthy',
      color: 'hsl(0, 84%, 55%)',
      bgClass: 'bg-aqi-unhealthy',
      textClass: 'text-aqi-unhealthy',
      borderClass: 'border-aqi-unhealthy',
      cardClass: 'aqi-card-unhealthy',
    };
  } else {
    return {
      level: 'hazardous',
      label: 'Hazardous',
      color: 'hsl(280, 60%, 35%)',
      bgClass: 'bg-aqi-hazardous',
      textClass: 'text-aqi-hazardous',
      borderClass: 'border-aqi-hazardous',
      cardClass: 'aqi-card-hazardous',
    };
  }
};

export const getCOStatus = (co: number): AQIStatus => {
  if (co <= 4) {
    return {
      level: 'good',
      label: 'Safe',
      color: 'hsl(142, 76%, 45%)',
      bgClass: 'bg-aqi-good',
      textClass: 'text-aqi-good',
      borderClass: 'border-aqi-good',
      cardClass: 'aqi-card-good',
    };
  } else if (co <= 9) {
    return {
      level: 'moderate',
      label: 'Elevated',
      color: 'hsl(45, 93%, 50%)',
      bgClass: 'bg-aqi-moderate',
      textClass: 'text-aqi-moderate',
      borderClass: 'border-aqi-moderate',
      cardClass: 'aqi-card-moderate',
    };
  } else {
    return {
      level: 'unhealthy',
      label: 'Dangerous',
      color: 'hsl(0, 84%, 55%)',
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
      color: 'hsl(142, 76%, 45%)',
      bgClass: 'bg-aqi-good',
      textClass: 'text-aqi-good',
      borderClass: 'border-aqi-good',
      cardClass: 'aqi-card-good',
    };
  } else if (pm25 <= 35) {
    return {
      level: 'moderate',
      label: 'Moderate',
      color: 'hsl(45, 93%, 50%)',
      bgClass: 'bg-aqi-moderate',
      textClass: 'text-aqi-moderate',
      borderClass: 'border-aqi-moderate',
      cardClass: 'aqi-card-moderate',
    };
  } else if (pm25 <= 55) {
    return {
      level: 'unhealthy-sensitive',
      label: 'Unhealthy for Sensitive',
      color: 'hsl(25, 95%, 53%)',
      bgClass: 'bg-aqi-unhealthy-sensitive',
      textClass: 'text-aqi-unhealthy-sensitive',
      borderClass: 'border-aqi-unhealthy-sensitive',
      cardClass: 'aqi-card-unhealthy-sensitive',
    };
  } else if (pm25 <= 150) {
    return {
      level: 'unhealthy',
      label: 'Unhealthy',
      color: 'hsl(0, 84%, 55%)',
      bgClass: 'bg-aqi-unhealthy',
      textClass: 'text-aqi-unhealthy',
      borderClass: 'border-aqi-unhealthy',
      cardClass: 'aqi-card-unhealthy',
    };
  } else {
    return {
      level: 'hazardous',
      label: 'Hazardous',
      color: 'hsl(280, 60%, 35%)',
      bgClass: 'bg-aqi-hazardous',
      textClass: 'text-aqi-hazardous',
      borderClass: 'border-aqi-hazardous',
      cardClass: 'aqi-card-hazardous',
    };
  }
};

export const getHealthAdvisory = (status: AQIStatus): string => {
  switch (status.level) {
    case 'good':
      return 'Air quality is satisfactory. Enjoy outdoor activities freely.';
    case 'moderate':
      return 'Air quality is acceptable. Unusually sensitive people should consider reducing prolonged outdoor exertion.';
    case 'unhealthy-sensitive':
      return 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.';
    case 'unhealthy':
      return 'Air quality is unhealthy. Everyone may begin to experience health effects. Avoid prolonged outdoor exposure.';
    case 'hazardous':
      return 'Health alert: everyone may experience more serious health effects. Stay indoors and keep windows closed.';
    default:
      return 'No data available.';
  }
};

export const generateMockData = () => {
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date();
    hour.setHours(hour.getHours() - (23 - i));
    return hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  });

  return hours.map((time) => ({
    time,
    co: Math.random() * 8 + 1,
    pm25: Math.random() * 50 + 5,
    pm10: Math.random() * 80 + 10,
    iaq: Math.random() * 100 + 20,
    temperature: Math.random() * 10 + 20,
    humidity: Math.random() * 30 + 40,
  }));
};
