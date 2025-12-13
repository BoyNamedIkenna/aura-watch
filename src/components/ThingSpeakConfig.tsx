import { useState } from 'react';
import { Settings, Save, Loader2, Plus, Trash2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface FieldMapping {
  field: string; // field1, field2, etc.
  type: string; // co, pm25, pm10, iaq, temperature, humidity, voc, aqi_co
  label: string;
  unit: string;
}

export interface ThingSpeakSettings {
  channelId: string;
  apiKey: string;
  fieldMappings: FieldMapping[];
}

const SENSOR_TYPES = [
  { value: 'co', label: 'CO Level', unit: 'ppm' },
  { value: 'pm25', label: 'PM2.5', unit: 'µg/m³' },
  { value: 'pm10', label: 'PM10', unit: 'µg/m³' },
  { value: 'iaq', label: 'IAQ (Indoor Air Quality)', unit: 'IAQ' },
  { value: 'temperature', label: 'Temperature', unit: '°C' },
  { value: 'humidity', label: 'Humidity', unit: '%' },
  { value: 'voc', label: 'VOC / IAQ VOC', unit: 'IAQ' },
  { value: 'aqi_co', label: 'AQI-CO', unit: 'AQI' },
  { value: 'custom', label: 'Custom', unit: '' },
];

const THINGSPEAK_FIELDS = ['field1', 'field2', 'field3', 'field4', 'field5', 'field6', 'field7', 'field8'];

interface ThingSpeakConfigProps {
  settings: ThingSpeakSettings;
  onSave: (settings: ThingSpeakSettings) => void;
}

export const ThingSpeakConfig = ({ settings, onSave }: ThingSpeakConfigProps) => {
  const [open, setOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState<ThingSpeakSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setLocalSettings(settings);
    }
    setOpen(isOpen);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    onSave(localSettings);
    setIsSaving(false);
    setOpen(false);
  };

  const addFieldMapping = () => {
    const usedFields = localSettings.fieldMappings.map(m => m.field);
    const nextField = THINGSPEAK_FIELDS.find(f => !usedFields.includes(f)) || 'field1';
    
    setLocalSettings(prev => ({
      ...prev,
      fieldMappings: [
        ...prev.fieldMappings,
        { field: nextField, type: 'custom', label: 'New Sensor', unit: '' }
      ]
    }));
  };

  const removeFieldMapping = (index: number) => {
    setLocalSettings(prev => ({
      ...prev,
      fieldMappings: prev.fieldMappings.filter((_, i) => i !== index)
    }));
  };

  const updateFieldMapping = (index: number, updates: Partial<FieldMapping>) => {
    setLocalSettings(prev => ({
      ...prev,
      fieldMappings: prev.fieldMappings.map((mapping, i) => {
        if (i !== index) return mapping;
        
        // If type changed, auto-fill label and unit
        if (updates.type && updates.type !== 'custom') {
          const sensorType = SENSOR_TYPES.find(t => t.value === updates.type);
          if (sensorType) {
            return {
              ...mapping,
              ...updates,
              label: sensorType.label,
              unit: sensorType.unit,
            };
          }
        }
        
        return { ...mapping, ...updates };
      })
    }));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
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
      <DialogContent className="sm:max-w-lg max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>ThingSpeak Configuration</DialogTitle>
          <DialogDescription>
            Configure your channel and map ThingSpeak fields to sensor types.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 py-4">
            {/* Channel Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Channel Settings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="channelId">Channel ID</Label>
                  <Input
                    id="channelId"
                    placeholder="e.g., 123456"
                    value={localSettings.channelId}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, channelId: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">Read API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Your API key"
                    value={localSettings.apiKey}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Field Mappings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Field Mappings</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addFieldMapping}
                  disabled={localSettings.fieldMappings.length >= 8}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Field
                </Button>
              </div>

              <div className="space-y-3">
                {localSettings.fieldMappings.map((mapping, index) => (
                  <div 
                    key={index} 
                    className="p-3 border border-border/50 rounded-lg space-y-3 bg-secondary/20"
                  >
                    <div className="flex items-center justify-between">
                      <Select
                        value={mapping.field}
                        onValueChange={(value) => updateFieldMapping(index, { field: value })}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {THINGSPEAK_FIELDS.map(field => (
                            <SelectItem key={field} value={field}>
                              {field.replace('field', 'Field ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeFieldMapping(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Select
                        value={mapping.type}
                        onValueChange={(value) => updateFieldMapping(index, { type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {SENSOR_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        placeholder="Label"
                        value={mapping.label}
                        onChange={(e) => updateFieldMapping(index, { label: e.target.value })}
                      />

                      <Input
                        placeholder="Unit"
                        value={mapping.unit}
                        onChange={(e) => updateFieldMapping(index, { unit: e.target.value })}
                      />
                    </div>
                  </div>
                ))}

                {localSettings.fieldMappings.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No fields configured. Click "Add Field" to start.
                  </p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!localSettings.channelId || isSaving}>
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
