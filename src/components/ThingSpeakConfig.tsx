import { useState } from 'react';
import { Settings, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ThingSpeakConfigProps {
  channelId: string;
  apiKey: string;
  onSave: (channelId: string, apiKey: string) => void;
}

export const ThingSpeakConfig = ({ channelId, apiKey, onSave }: ThingSpeakConfigProps) => {
  const [open, setOpen] = useState(false);
  const [localChannelId, setLocalChannelId] = useState(channelId);
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 300));
    onSave(localChannelId, localApiKey);
    setIsSaving(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Configure</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ThingSpeak Configuration</DialogTitle>
          <DialogDescription>
            Enter your ThingSpeak channel details to connect your IoT sensors.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="channelId">Channel ID</Label>
            <Input
              id="channelId"
              placeholder="e.g., 123456"
              value={localChannelId}
              onChange={(e) => setLocalChannelId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Find this in your ThingSpeak channel settings
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="apiKey">Read API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Your read API key"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Required for private channels
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!localChannelId || !localApiKey || isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
