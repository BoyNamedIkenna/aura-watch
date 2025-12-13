import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AQIStatus } from '@/lib/aqiUtils';

interface PollutantChartProps {
  title: string;
  data: Array<{ time: string; value: number }>;
  dataKey: string;
  status: AQIStatus;
  unit: string;
  delay?: string;
}

export const PollutantChart = ({ title, data, dataKey, status, unit, delay = '0s' }: PollutantChartProps) => {
  return (
    <div 
      className={`aqi-card ${status.cardClass} animate-fade-in`}
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <span className={`text-xs font-medium ${status.textClass} uppercase tracking-wider`}>
          Last 24 Hours
        </span>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={status.color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={status.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(222, 30%, 18%)" 
              vertical={false}
            />
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
              tickFormatter={(value) => value.split(':')[0]}
              interval="preserveStartEnd"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(222, 47%, 9%)',
                border: '1px solid hsl(222, 30%, 18%)',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              }}
              labelStyle={{ color: 'hsl(215, 20%, 55%)', marginBottom: '4px' }}
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
        </ResponsiveContainer>
      </div>
    </div>
  );
};
