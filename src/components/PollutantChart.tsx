import { useState } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { AQIStatus } from '@/lib/aqiUtils';
import { BarChart3, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PollutantChartProps {
  title: string;
  data: Array<{ time: string; value: number }>;
  dataKey: string;
  status: AQIStatus;
  unit: string;
  delay?: string;
}

// Format data to hourly intervals
const formatToHourlyData = (data: Array<{ time: string; value: number }>) => {
  if (!data || data.length === 0) return [];
  
  const hourlyMap = new Map<string, { sum: number; count: number }>();
  
  data.forEach(point => {
    const hour = point.time.split(':')[0] + ':00';
    if (hourlyMap.has(hour)) {
      const existing = hourlyMap.get(hour)!;
      existing.sum += point.value;
      existing.count += 1;
    } else {
      hourlyMap.set(hour, { sum: point.value, count: 1 });
    }
  });
  
  return Array.from(hourlyMap.entries()).map(([time, { sum, count }]) => ({
    time,
    value: sum / count,
  }));
};

export const PollutantChart = ({ title, data, dataKey, status, unit, delay = '0s' }: PollutantChartProps) => {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  
  const hourlyData = formatToHourlyData(data);

  return (
    <div 
      className="bg-card border border-border rounded-xl p-6 animate-fade-in"
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-0.5">
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 w-7 p-0 ${chartType === 'line' ? 'bg-background shadow-sm' : ''}`}
              onClick={() => setChartType('line')}
            >
              <TrendingUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 w-7 p-0 ${chartType === 'bar' ? 'bg-background shadow-sm' : ''}`}
              onClick={() => setChartType('bar')}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <AreaChart data={hourlyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={status.color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={status.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                vertical={false}
              />
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                }}
                labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                itemStyle={{ color: status.color }}
                formatter={(value: number) => [`${value.toFixed(2)} ${unit}`, title]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={status.color}
                strokeWidth={2}
                fill={`url(#gradient-${dataKey})`}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </AreaChart>
          ) : (
            <BarChart data={hourlyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                vertical={false}
              />
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                }}
                labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                itemStyle={{ color: status.color }}
                formatter={(value: number) => [`${value.toFixed(2)} ${unit}`, title]}
              />
              <Bar
                dataKey="value"
                fill={status.color}
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
