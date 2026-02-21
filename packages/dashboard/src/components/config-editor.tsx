import type { ConfigField, TemplateConfigSchema } from '@lpf/shared';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface ConfigEditorProps {
  configSchema: TemplateConfigSchema;
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function ConfigEditor({ configSchema, config, onChange }: ConfigEditorProps) {
  const handleChange = (key: string, value: unknown) => {
    onChange({ ...config, [key]: value });
  };

  const getValue = (field: ConfigField): unknown => {
    return config[field.key] ?? field.default;
  };

  return (
    <div className="space-y-4">
      {configSchema.fields.map((field) => (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={field.key}>
            {field.label}
            {field.required && <span className="ml-1 text-destructive">*</span>}
          </Label>
          {renderField(field, getValue(field), (value) => handleChange(field.key, value))}
        </div>
      ))}
    </div>
  );
}

function renderField(
  field: ConfigField,
  value: unknown,
  onChange: (value: unknown) => void,
) {
  switch (field.type) {
    case 'text':
      return (
        <Input
          id={field.key}
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={typeof field.default === 'string' ? field.default : ''}
        />
      );

    case 'textarea':
      return (
        <Textarea
          id={field.key}
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={typeof field.default === 'string' ? field.default : ''}
        />
      );

    case 'color':
      return (
        <div className="flex items-center gap-3">
          <input
            type="color"
            id={field.key}
            value={(value as string) || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-14 cursor-pointer rounded border p-1"
          />
          <Input
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="flex-1"
          />
        </div>
      );

    case 'url':
      return (
        <Input
          id={field.key}
          type="url"
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
        />
      );

    case 'boolean':
      return (
        <div className="flex items-center gap-2">
          <Switch
            id={field.key}
            checked={!!value}
            onCheckedChange={(checked) => onChange(checked)}
          />
          <span className="text-sm text-muted-foreground">
            {value ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      );

    case 'select':
      return (
        <Select value={(value as string) || ''} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    default:
      return (
        <Input
          id={field.key}
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}
