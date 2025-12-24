import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type TimeRange = '12h' | '24h' | '1w';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: '12h', label: 'Last 12 Hours' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '1w', label: 'Last 7 Days' },
];

export const TimeRangeSelector = ({ value, onChange }: TimeRangeSelectorProps) => {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as TimeRange)}>
      <SelectTrigger className="w-[140px] h-9 text-sm border-border bg-card">
        <SelectValue placeholder="Time range" />
      </SelectTrigger>
      <SelectContent>
        {timeRangeOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// LOGIC: (Total Seconds / 20s Update Rate)
export const getResultsForTimeRange = (timeRange: TimeRange): number => {
  switch (timeRange) {
    case '12h': return 2200; 
    case '24h': return 4500; 
    case '1w': return 8000;  // ThingSpeak Max Limit
    default: return 100;
  }
};