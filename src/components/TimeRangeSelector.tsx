import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type TimeRange = '12h' | '24h' | '1w' | '1m';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: '12h', label: '12 Hours' },
  { value: '24h', label: '24 Hours' },
  { value: '1w', label: '1 Week' },
  { value: '1m', label: '1 Month' },
];

export const TimeRangeSelector = ({ value, onChange }: TimeRangeSelectorProps) => {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as TimeRange)}>
      <SelectTrigger className="w-[130px] h-9 text-sm">
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

export const getResultsForTimeRange = (timeRange: TimeRange): number => {
  switch (timeRange) {
    case '12h':
      return 72; // ~10 min intervals for 12 hours
    case '24h':
      return 144; // ~10 min intervals for 24 hours
    case '1w':
      return 504; // ~20 min intervals for 1 week
    case '1m':
      return 720; // ~1 hour intervals for 1 month
    default:
      return 144;
  }
};
