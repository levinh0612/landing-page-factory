import { useState } from 'react';
import type { ConfigField, TemplateConfigSchema } from '@lpf/shared';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ImageIcon, X, Loader2 } from 'lucide-react';
import { api } from '@/lib/axios';
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

// Standalone component for image upload (needs local state)
function ImageField({ fieldKey, value, onChange }: {
  fieldKey: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const url = value || '';

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/media/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(res.data.data.url);
    } catch {
      setError('Upload thất bại. Thử lại nhé.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {url && (
        <div className="relative group w-48 rounded-xl overflow-hidden border-2 border-primary/20 bg-muted shadow-sm">
          <img src={url} alt="preview" className="w-full aspect-square object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1.5 right-1.5 h-6 w-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <label className="block cursor-pointer">
        <div className={cn(
          'flex items-center gap-2 border-2 border-dashed rounded-xl p-3 text-sm text-muted-foreground',
          'hover:border-primary/60 hover:text-primary hover:bg-primary/5 transition-all duration-200',
          uploading && 'pointer-events-none opacity-60',
        )}>
          {uploading
            ? <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            : <ImageIcon className="h-4 w-4 shrink-0" />
          }
          <span className="flex-1">{uploading ? 'Đang tải lên…' : url ? 'Thay ảnh khác' : 'Tải ảnh lên'}</span>
          <span className="text-xs opacity-50">PNG · JPG · WEBP</span>
        </div>
        <input
          id={fieldKey}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleUpload}
          disabled={uploading}
        />
      </label>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
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

    case 'image':
      return (
        <ImageField
          fieldKey={field.key}
          value={(value as string) || ''}
          onChange={onChange}
        />
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
