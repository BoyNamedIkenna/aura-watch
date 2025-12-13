import { Wifi, WifiOff, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConnectionStatusProps {
  isConnected: boolean;
  isLoading: boolean;
  lastUpdated: Date | null;
  error: string | null;
  onRefresh: () => void;
}

export const ConnectionStatus = ({
  isConnected,
  isLoading,
  lastUpdated,
  error,
  onRefresh,
}: ConnectionStatusProps) => {
  const formatLastUpdated = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex items-center gap-2">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : isConnected ? (
          <Wifi className="h-4 w-4 text-aqi-good" />
        ) : (
          <WifiOff className="h-4 w-4 text-destructive" />
        )}
        <span className="text-muted-foreground hidden sm:inline">
          {isLoading 
            ? 'Fetching...' 
            : isConnected 
              ? `Updated: ${formatLastUpdated(lastUpdated)}`
              : error || 'Disconnected'
          }
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onRefresh}
        disabled={isLoading}
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
};
