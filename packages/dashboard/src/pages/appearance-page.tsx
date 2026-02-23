import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Paintbrush, Type, Sun, Moon, CheckCircle2 } from 'lucide-react';
import { useThemeStore } from '@/stores/theme-store';
import api from '@/lib/axios';

const COLOR_PRESETS = [
  { name: 'Default', primary: '#7c3aed', hex: '#7c3aed' },
  { name: 'Ocean', primary: '#0ea5e9', hex: '#0ea5e9' },
  { name: 'Sunset', primary: '#f97316', hex: '#f97316' },
  { name: 'Forest', primary: '#22c55e', hex: '#22c55e' },
];

export function AppearancePage() {
  const { theme, toggleTheme } = useThemeStore();
  const setTheme = (t: 'light' | 'dark') => { if (theme !== t) toggleTheme(); };
  const queryClient = useQueryClient();

  const [siteTitle, setSiteTitle] = useState('Landing Page Factory');
  const [siteTagline, setSiteTagline] = useState('Admin Dashboard');
  const [primaryColor, setPrimaryColor] = useState(COLOR_PRESETS[0].hex);

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data.data as Array<{ key: string; value: string }>;
    },
  });

  useEffect(() => {
    if (!settings) return;
    const title = settings.find((s) => s.key === 'site_title');
    const tagline = settings.find((s) => s.key === 'site_tagline');
    const color = settings.find((s) => s.key === 'site_primary_color');
    if (title) setSiteTitle(title.value);
    if (tagline) setSiteTagline(tagline.value);
    if (color) setPrimaryColor(color.value);
  }, [settings]);

  // Apply color to CSS variable
  useEffect(() => {
    if (primaryColor) {
      document.documentElement.style.setProperty('--primary', hexToHsl(primaryColor));
    }
  }, [primaryColor]);

  const brandingMutation = useMutation({
    mutationFn: () =>
      api.put('/settings', {
        settings: [
          { key: 'site_title', value: siteTitle, type: 'STRING', section: 'appearance', label: 'Site Title' },
          { key: 'site_tagline', value: siteTagline, type: 'STRING', section: 'appearance', label: 'Site Tagline' },
          { key: 'site_primary_color', value: primaryColor, type: 'STRING', section: 'appearance', label: 'Primary Color' },
        ],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Branding saved');
    },
    onError: () => toast.error('Failed to save branding'),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Appearance</h1>
        <p className="text-muted-foreground">Customize the look and feel of your dashboard</p>
      </div>

      {/* Theme Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Paintbrush className="h-5 w-5" /> Color Mode
          </CardTitle>
          <CardDescription>Choose between light and dark theme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                theme === 'light' ? 'border-primary' : 'border-border hover:border-muted-foreground'
              }`}
            >
              <Sun className="h-6 w-6" />
              <span className="text-sm font-medium">Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                theme === 'dark' ? 'border-primary' : 'border-border hover:border-muted-foreground'
              }`}
            >
              <Moon className="h-6 w-6" />
              <span className="text-sm font-medium">Dark</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Color Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Paintbrush className="h-5 w-5" /> Color Theme
          </CardTitle>
          <CardDescription>Choose a preset accent color for the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setPrimaryColor(preset.hex)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-colors ${
                  primaryColor === preset.hex ? 'border-foreground' : 'border-border hover:border-muted-foreground'
                }`}
              >
                <div
                  className="h-8 w-8 rounded-full relative flex items-center justify-center"
                  style={{ backgroundColor: preset.hex }}
                >
                  {primaryColor === preset.hex && (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  )}
                </div>
                <span className="text-xs font-medium">{preset.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Site Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Type className="h-5 w-5" /> Site Branding
          </CardTitle>
          <CardDescription>Configure site name and branding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Dashboard Title</Label>
            <Input value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tagline</Label>
            <Input value={siteTagline} onChange={(e) => setSiteTagline(e.target.value)} />
          </div>
          <Button onClick={() => brandingMutation.mutate()} disabled={brandingMutation.isPending}>
            {brandingMutation.isPending ? 'Saving...' : 'Save Branding'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Convert hex to HSL string for CSS variable (approximate)
function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
