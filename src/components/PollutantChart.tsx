import { useState, useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AQIStatus, formatThingSpeakDate, AQI_COLORS, getIAQStatus } from '@/lib/aqiUtils';
import { BarChart3, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TimeRange } from './TimeRangeSelector';

interface PollutantChartProps {
  title: string;
  data: Array<{ created_at: string; value: number }>;
  status: AQIStatus;
  unit: string;
  avgValue: number;
  currentValue: number;
  currentTimeRange: TimeRange;
  defaultChartType?: 'line' | 'bar';
}

export const PollutantChart = ({ 
  title, 
  data, 
  status, 
  unit, 
  avgValue, 
  currentValue, 
  currentTimeRange,
  defaultChartType = 'line' 
}: PollutantChartProps) => {
  const [chartType, setChartType] = useState<'line' | 'bar'>(defaultChartType);
  const baseChartId = title.replace(/\s+/g, '-');
  const fillGradientId = `fill-gradient-${baseChartId}`;
  const lineGradientId = `line-gradient-${baseChartId}`;

  // --- SMART AGGREGATION ---
  const chartData = useMemo(() => {
    const now = new Date();
    const endTime = now.getTime();
    let startTime = endTime;
    let interval = 3600 * 1000; 

    if (currentTimeRange === '12h') {
      startTime = endTime - (12 * 60 * 60 * 1000);
      interval = 30 * 60 * 1000;
    } else if (currentTimeRange === '24h') {
      startTime = endTime - (24 * 60 * 60 * 1000);
      interval = 60 * 60 * 1000;
    } else if (currentTimeRange === '1w') {
      startTime = endTime - (7 * 24 * 60 * 60 * 1000);
      interval = 12 * 60 * 60 * 1000;
    }

    const bucketMap = new Map<number, { sum: number; count: number }>();
    for (let t = startTime; t <= endTime; t += interval) {
      const timeSlot = Math.floor(t / interval) * interval;
      bucketMap.set(timeSlot, { sum: 0, count: 0 });
    }

    data.forEach(d => {
      const dTime = new Date(d.created_at).getTime();
      if (dTime >= startTime && dTime <= endTime) {
        const timeSlot = Math.floor(dTime / interval) * interval;
        if (bucketMap.has(timeSlot)) {
          const b = bucketMap.get(timeSlot)!;
          b.sum += d.value;
          b.count++;
        }
      }
    });

    return Array.from(bucketMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([time, { sum, count }]) => ({
        created_at: time,
        value: count > 0 ? sum / count : 0, 
      }));
  }, [data, currentTimeRange]);

  // Define the gradient stops once to use for both fill and line
  const gradientStops = (
    <>
      <stop offset="5%" stopColor={AQI_COLORS.hazardous} />
      <stop offset="20%" stopColor={AQI_COLORS.unhealthy} />
      <stop offset="40%" stopColor={AQI_COLORS.sensitive} />
      <stop offset="60%" stopColor={AQI_COLORS.moderate} />
      <stop offset="95%" stopColor={AQI_COLORS.good} />
    </>
  );

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="font-semibold text-foreground text-lg">{title}</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold" style={{ color: status.color }}>
              {currentValue.toFixed(1)} <span className="text-sm text-muted-foreground">{unit}</span>
            </span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              Avg: {avgValue.toFixed(1)}
            </span>
          </div>
        </div>
        
        <div className="flex bg-muted rounded-lg p-1">
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
      
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {/* Gradient for the Area Fill (with opacity) */}
                <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1" stopOpacity={0.8}>
                  {gradientStops}
                </linearGradient>
                {/* NEW: Gradient for the Line Stroke (solid color) */}
                <linearGradient id={lineGradientId} x1="0" y1="0" x2="0" y2="1" stopOpacity={1}>
                  {gradientStops}
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="created_at" 
                tickFormatter={(ts) => formatThingSpeakDate(new Date(ts).toISOString(), currentTimeRange)} 
                tick={{ fontSize: 10 }} 
                axisLine={false} 
                tickLine={false} 
                minTickGap={40}
              />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none' }} 
                labelFormatter={(ts) => formatThingSpeakDate(new Date(ts).toISOString(), currentTimeRange)} 
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={`url(#${lineGradientId})`} // Apply gradient to the line
                fill={`url(#${fillGradientId})`}   // Apply gradient to the fill
                strokeWidth={3} // Made line slightly thicker for visibility
                connectNulls 
              />
            </AreaChart>
          ) : (
            <BarChart 
              data={chartData} 
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="created_at" 
                tickFormatter={(ts) => formatThingSpeakDate(new Date(ts).toISOString(), currentTimeRange)} 
                tick={{ fontSize: 10 }} 
                axisLine={false} 
                tickLine={false} 
                minTickGap={40}
              />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{fill: 'transparent'}} 
                contentStyle={{ borderRadius: '8px', border: 'none' }} 
                labelFormatter={(ts) => formatThingSpeakDate(new Date(ts).toISOString(), currentTimeRange)} 
              />
              <Bar 
                dataKey="value" 
                radius={[4, 4, 0, 0]} 
              >
                {/* INDIVIDUAL BAR COLORING LOOP */}
                {chartData.map((entry, index) => {
                  const barStatus = getIAQStatus(entry.value); 
                  return <Cell key={`cell-${index}`} fill={barStatus.color} />;
                })}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};